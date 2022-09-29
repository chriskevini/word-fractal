/* eslint-disable no-irregular-whitespace */
const fetch = require("node-fetch");
const {functions, db, admin} = require("./admin");
const cheerio = require("cheerio");
const {deflate, inflate} = require("pako");

// const ERRORS = {

// }

exports.checkPlayedWord = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  console.log(data);
  if (!data.gameId || !data.chainCoords || !data.word) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "You must pass gameId, chainCoords, and word"
    );
  }

  return db
    .runTransaction(async (transaction) => {
      const {gameId, chainCoords, word: submittedWord} = data;
      const gameRef = db.doc("games/" + data.gameId);
      const gameSnapshot = await gameRef.get();
      const game = gameSnapshot.data();
      const playerRef = db.doc("players/" + context.auth.uid);
      const playerSnapshot = await playerRef.get();
      const player = playerSnapshot.data();
      player.id = context.auth.uid;

      if (!game) {
        throw new functions.https.HttpsError(
          "not-found",
          "That game doesn't exist"
        );
      }

      //show error to player because this is a reachable state by the client
      //when another player wins the game while this player has submission dialog open
      if (game.state != "live") {
        return {status: "error", message: "This game is over"};
      }

      let board = game.board;
      const boardLength = board.split(" ").length;
      const chainCoordsArray = stringTo2dArray(chainCoords);
      const coordsAtWordStart = " " + chainCoords.split(" ")[0] + " ";
      const nodes = " " + game.nodes + " "; //The extra spaces are for cases like: 12,3 != 2,3

      if (!nodes.includes(coordsAtWordStart)) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "The submitted word doesn't start at a node."
        );
      }

      const playedWords = game.playedWordsDeflated
        ? JSON.parse(inflate(game.playedWordsDeflated, {to: "string"}))
        : [];
      const alreadyPlayedWordsCoords = playedWords.map((w) => w.chainCoords);
      if (alreadyPlayedWordsCoords.includes(chainCoords))
        return {
          status: "error",
          message: "That word has already been played",
        };

      const getLetter = ([x, y]) => {
        return board[y * (boardLength + 1) + x];
      };

      const setLetter = ([x, y], newLetter) => {
        const i = y * (boardLength + 1) + x;
        board = board.slice(0, i) + newLetter + board.slice(i + 1);
      };

      const wordFromBoard = chainCoordsArray
        .map((coords) => getLetter(coords))
        .join("");

      const isEnglish = "abcdefghijklmnopqrstuvwxyz".includes(submittedWord[0]);

      const newPlayedWord = {
        chainCoords: chainCoords,
        createdBy: player.id,
        playerName: player.playerName,
        color: player.color,
        icon: player.icon,
        word: submittedWord,
        createdAt: admin.firestore.Timestamp.now(),
      };

      if (isEnglish) {
        if (wordFromBoard != submittedWord)
          throw new functions.https.HttpsError(
            "invalid-argument",
            "The submitted word does not match what's in the board"
          );

        const res = await fetch(
          "https://www.ei-navi.jp/dictionary/content/" + submittedWord
        );
        const text = await res.text();
        const $ = cheerio.load(text);

        const isNotInDictionary = $(".error_block").text()?.includes("見"); //見つかりません

        if (isNotInDictionary)
          return {
            status: "error",
            message: "That word is not in the dictionary",
          };

        newPlayedWord.pos =
          $(".page-header>.list-group-item-heading")
            .text()
            .split(" ")[0]
            .trim() ||
          $(".pos").first().text().trim() ||
          "";
        newPlayedWord.pronunciation =
          $(".pronunciation-ipa").first().text().trim() || "";
        newPlayedWord.jpTranslation =
          $(".example_wrap>section").children().first().text().trim() ||
          $(".wordnet-translations")
            .first()
            .children("span")
            .toArray()
            .map((e) => $(e).text())
            .join("，") ||
          "";
        newPlayedWord.enDefinition =
          $(".wordnet-definition").first().text().trim() || "";
        newPlayedWord.audio = $("audio>source").attr("src") || "";
        newPlayedWord.enSentence =
          $(".example>.en").first().text().trim() ||
          $(".example>.wordnet-example").first().text().trim() ||
          "";
        newPlayedWord.jpSentence =
          $(".example>.ja").first().text().trim() || "";
      } else {
        //Japanese has more complex checking
        if (
          makeBig(removeDakuten(toHiragana(wordFromBoard))) !=
          makeBig(removeDakuten(toHiragana(submittedWord)))
        )
          return {
            status: "error",
            message: "The submitted word does not match what's in the board",
          };

        const jishoResponse = await fetch(
          "https://jotoba.de/api/search/words",
          {
            method: "POST",
            body: JSON.stringify({
              query: submittedWord,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const jishoData = await jishoResponse.json();
        const jishoEntry = jishoData.words[0];

        const isInDictionary = jishoEntry.reading.kana === submittedWord;

        if (!isInDictionary)
          return {
            status: "error",
            message: "That word is not in the dictionary",
          };

        const jishoResponse2 = await fetch(
          "https://jotoba.de/api/search/sentences",
          {
            method: "POST",
            body: JSON.stringify({
              query: jishoEntry.reading.kanji || submittedWord,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const jishoData2 = await jishoResponse2.json();
        const jishoSentences = jishoData2.sentences[0];

        if (jishoEntry.reading.kanji)
          newPlayedWord.kanji = jishoEntry.reading.kanji;
        let pos = jishoEntry.senses[0].pos[0]; //this is of type {} | String
        if (typeof pos !== "string") pos = Object.keys(pos)[0];
        newPlayedWord.pos = pos || "";
        newPlayedWord.pitch = jishoEntry.pitch || [];
        newPlayedWord.enTranslation =
          jishoEntry.senses[0].glosses.join(", ") || "";
        newPlayedWord.audio = jishoEntry.audio
          ? "https://jotoba.de" + jishoEntry.audio
          : "";
        newPlayedWord.enSentence = jishoSentences?.translation || "";
        newPlayedWord.jpSentence = jishoSentences?.content || "";
        newPlayedWord.furiganaSentence = jishoSentences?.furigana || "";

        submittedWord
          .split("")
          .forEach((newLetter, i) => setLetter(chainCoordsArray[i], newLetter));
      }

      const coordsAtWordEnd = chainCoordsArray.at(-1);

      const wonGame =
        coordsAtWordEnd.toString().split(",")[1] ===
        (boardLength - 1).toString();
      let stateInformation = {};
      let winInformation = {};
      let medalInformation = {};
      if (wonGame) {
        stateInformation = {
          state: "dead",
          diedAt: admin.firestore.Timestamp.now(),
        };
        const winningChain = findWinningChain(
          chainCoords,
          alreadyPlayedWordsCoords,
          boardLength
        );
        winInformation = {
          winningChain: winningChain,
          winner: {
            id: player.id,
            playerName: player.playerName,
            icon: player.icon,
            color: player.color,
          },
        };

        medalInformation = {medals: (player.medals || "") + "🏅"};
      }

      const newPlayedWordsDeflated = deflate(
        JSON.stringify([...playedWords, newPlayedWord]),
        {level: 9}
      );

      transaction.update(gameRef, {
        board: board,
        nodes: game.nodes + " " + coordsAtWordEnd,
        // playedWords: admin.firestore.FieldValue.arrayUnion(newPlayedWord),
        playedWordsDeflated: newPlayedWordsDeflated,
        participants: admin.firestore.FieldValue.arrayUnion(player.id),
        ...stateInformation,
        ...winInformation,
      });

      transaction.set(
        playerRef,
        {
          points: (player?.points || 0) + submittedWord.length,
          longestWord:
            submittedWord.length > (player?.longestWord?.length || 0)
              ? submittedWord
              : player.longestWord,
          ...medalInformation,
        },
        {merge: true}
      );

      if (wonGame) {
        const gameStatesRef = db.doc("gameStates/" + gameId);
        transaction.update(gameStatesRef, stateInformation);
        return {
          status: "success",
          message:
            "       🎉 Congratulations! 🎉\n" + "You won the game! +1 medal 🏅",
        };
      }

      if (submittedWord.length >= 11)
        return {
          status: "success",
          message: `😱 +${submittedWord.length} points ✨`,
        };

      if (submittedWord.length === 10)
        return {
          status: "success",
          message: "OMG! That's this many letters 😯👐\n" + "+10 points ✨",
        };

      if (submittedWord.length >= 7)
        return {
          status: "success",
          message:
            "Wow! That's a long word 😮\n" +
            `+${submittedWord.length} points ✨`,
        };

      const levelBoundaries = [0, 10, 50, 100, 200, 300, 9999999];
      const icons = [
        "😀",
        "Woof! 🐶",
        "Yum! 🍔",
        "Catch! 🏈",
        "Vroom! 🚗",
        " 🎷🎶",
      ];
      const lvlBefore = levelBoundaries.findIndex((n) => player.points < n);
      const lvlAfter = levelBoundaries.findIndex(
        (n) => player.points + submittedWord.length < n
      );

      if (lvlBefore != lvlAfter)
        return {
          status: "success",
          message:
            `You unlocked new icons! ${icons[lvlAfter]}\n` +
            `+${submittedWord.length} points ✨`,
        };
      return {
        status: "success",
        message: `Nice!  +${submittedWord.length} points ✨`,
      };
    })
    .then((res) => res)
    .catch((e) => {
      console.error(e);
      return {
        status: "error",
        message: "There was a problem with the server",
      };
    });
});

const toHiragana = (word) =>
  word
    .split("")
    .map((kana) =>
      kana.charCodeAt() >= "ァ".charCodeAt() &&
      kana.charCodeAt() <= "ヶ".charCodeAt()
        ? String.fromCharCode(kana.charCodeAt(0) - 96)
        : kana
    )
    .join("");

const removeDakuten = (word) =>
  word
    .split("")
    .map((kana) =>
      kana.normalize("NFD").replace("\u3099", "").replace("\u309a", "")
    )
    .join("");

const makeBig = (word) => {
  const big = {
    ぁ: "あ",
    ぃ: "い",
    ぅ: "う",
    ぇ: "え",
    ぉ: "お",
    っ: "つ",
    ゃ: "や",
    ゅ: "ゆ",
    ょ: "よ",
  };
  return word
    .split("")
    .map((kana) => big[kana] || kana)
    .join("");
};

const stringTo2dArray = (s) =>
  s.split(" ").map((c) => c.split(",").map((s) => Number(s)));

// const twoDArrayToString = (a) => a.map((s) => s.join(",")).join(" ");

//returns the winning chain of playedWords from the bottom to the top of the board
const findWinningChain = (
  chainCoords,
  alreadyPlayedWordsCoords,
  boardLength
) => {
  const boardCenter = Math.floor(boardLength / 2);
  let winningChain = "";
  let current = chainCoords.split(" ");
  winningChain = current.join(" ") + " " + winningChain;
  const playedWordsArray = alreadyPlayedWordsCoords.map((c) => c.split(" "));
  while (current[0] != `${boardCenter},0`) {
    current = playedWordsArray.find((w) => w.at(-1) === current[0]);
    winningChain = current.join(" ") + " " + winningChain;
  }
  return winningChain;
};
