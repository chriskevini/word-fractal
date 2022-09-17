const {functions, db, admin} = require("./admin");
const {deflate, inflate} = require("pako");

exports.editProfile = functions.https.onCall(async (data, context) => {
  console.log(data);

  const {pendingChanges} = data;

  const playerId = context.auth.uid;
  const playerRef = db.doc("players/" + playerId);
  const playerSnapshot = await playerRef.get();
  const player = playerSnapshot.data();

  if (
    player.lastEdit &&
    admin.firestore.Timestamp.now() - player.lastEdit < 5000
  )
    // return Promise.resolve({
    //   status: "error",
    //   message: admin.firestore.Timestamp.now() - player.lastEdit,
    // });
    throw new functions.https.HttpsError(
      "spam",
      "Client is editing their profile too often"
    );

  return db
    .runTransaction(async (transaction) => {
      // const gamesRef = db.collection("games");
      // const gamesQuerySnapshot = await gamesRef
      //   .where("participants", "array-contains", playerId)
      //   .get();
      // const games = gamesQuerySnapshot.getDocuments();
      // console.log(games);

      let games = [];
      await db
        .collection("games")
        .where("participants", "array-contains", playerId)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            games.push(doc.data());
          });
          // dosn't work for some reason
          // games = querySnapshot.map((doc) => doc.data());
        })
        .catch((error) => {
          console.log("Error getting documents: ", error);
          throw new functions.https.HttpsError(error);
        });

      if (pendingChanges.playerName) {
        const playerInfoCacheRef = db.doc("cache/playerInfo");
        const playerInfoSnapshot = await playerInfoCacheRef.get();
        const playerInfo = playerInfoSnapshot.data();

        const takenNames = playerInfo?.takenNames || [];
        if (
          takenNames
            .map((n) => n.toLowerCase())
            .includes(pendingChanges.playerName.toLowerCase())
        )
          return {
            status: "error",
            message: "That name is taken",
          };
        const newTakenNames = takenNames.filter((n) => n != player.playerName); //remove old name
        newTakenNames.push(pendingChanges.playerName); //add new name
        transaction.update(playerInfoCacheRef, {
          takenNames: newTakenNames,
        });
      }

      games.forEach((game) => {
        const gameRef = db.doc("games/" + game.id);
        const {winner} = game;
        const playedWords = game.playedWordsDeflated
          ? JSON.parse(inflate(game.playedWordsDeflated, {to: "string"}))
          : [];
        const updatedWinnerField = winner
          ? {winner: updateWinner(winner, playerId, pendingChanges)}
          : {};
        const updatedPlayedWords = updatePlayedWords(
          playedWords,
          playerId,
          pendingChanges
        );
        const updatedPlayedWordsDeflated = deflate(
          JSON.stringify(updatedPlayedWords),
          {level: 9}
        );
        transaction.update(gameRef, {
          playedWordsDeflated: updatedPlayedWordsDeflated,
          ...updatedWinnerField,
        });
      });

      transaction.update(playerRef, {
        ...pendingChanges,
        lastEdit: admin.firestore.Timestamp.now(),
      });
      return {status: "success"};
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

function updateWinner(winner, playerId, pendingChanges) {
  if (!winner || winner.id !== playerId) return winner;
  else return {...winner, ...pendingChanges};
}

function updatePlayedWords(playedWords, playerId, pendingChanges) {
  return playedWords.map((playedWord) => {
    if (playedWord.createdBy !== playerId) return playedWord;
    else return {...playedWord, ...pendingChanges};
  });
}
