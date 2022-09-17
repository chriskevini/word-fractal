import { Popover } from "@mui/material";

import {
  collection,
  doc,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { inflate } from "pako";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  useCollectionData,
  useDocumentData,
} from "react-firebase-hooks/firestore";
import { AlertsContext, auth, db } from "./App";
import { Board } from "./Board";
import ColorPicker from "./ColorPicker";
import DictionaryView from "./DictionaryView";
import { GameBottomBar } from "./GameBottomBar";
import { LoadingScreen } from "./LoadingScreen";
import { Minimap } from "./Minimap";
import { PlayerTag } from "./PlayerTag";
import Profile from "./Profile";
import Tutorial from "./Tutorial";
import { getNeighbors } from "./utils";
import { WordSubmissionDialog } from "./WordSubmissionDialog";

const Game = function ({ gameId, setGameId }) {
  const [isMinimapOpen, setIsMinimapOpen] = useState(false);
  const cellSize = 64;

  const [, , handleAlert] = useContext(AlertsContext);

  const [isBottomOfBoardVisible, setIsBottomOfBoardVisible] = useState(false);

  const gameRef = doc(db, "games", gameId);
  const [game, awaitingGame] = useDocumentData(gameRef);
  const playerRef = doc(db, "players", auth.currentUser.uid);
  let [player, awaitingPlayer] = useDocumentData(playerRef);
  player = { ...player, id: auth.currentUser.uid };
  const [currentWord, setCurrentWord] = useState(null);

  useEffect(() => {
    if (awaitingGame) return;
    if (!game.playedWordsDeflated) return;

    // const t0 = performance.now();
    // for (let i = 0; i < 1000; i++) {
    //   const playedWords = JSON.parse(
    //     inflate(game.playedWordsDeflated.toUint8Array(), { to: "string" })
    //   );
    // }
    // const t1 = performance.now();
    // console.log("inflated 1000x in", (t1 - t0).toString().slice(0, 4) + "ms");

    // console.log("zipped", game.playedWordsZipped.toUint8Array());
    // console.log(
    //   "unzipped",
    //   inflate(game.playedWordsZipped.toUint8Array(), { to: "string" })
    // );
    // console.log("deflated", game.playedWordsDeflated.toUint8Array());
    // const deflated = deflate(JSON.stringify(game.playedWords), { level: 9 });
    // console.log("client", deflated);
    // console.log(
    //   "inflated",
    //   inflate(game.playedWordsDeflated.toUint8Array(), { to: "string" })
    // );

    // const playedWordsString = JSON.stringify(game.playedWords);
    // const uncompressedLength = new TextEncoder().encode(
    //   playedWordsString
    // ).byteLength;
    // console.log("data size", uncompressedLength);

    // const t0 = performance.now();
    // for (let i = 0; i < 1000; i++) {
    //   const gzipped = gzip(playedWordsString, { level: level });
    // }
    // const t1 = performance.now();
    // const gzipped = gzip(playedWordsString, { level: level });
    // console.log(
    //   `gzip ` + level,
    //   gzipped.byteLength / uncompressedLength,
    //   (t1 - t0).toString().slice(0, 3) + "ms"
    // );
    // const t2 = performance.now();
    // for (let i = 0; i < 1000; i++) {
    //   const ungzipped = ungzip(gzipped);
    // }
    // const t3 = performance.now();
    // console.log("ungzipped in", (t3 - t2).toString().slice(0, 3) + "ms");

    // const compressionLevels = [9];
    // compressionLevels.forEach((level) => {
    //   const t0 = performance.now();
    //   for (let i = 0; i < 1000; i++) {
    //     const deflated = deflate(playedWordsString, { level: level });
    //   }
    //   const t1 = performance.now();
    //   const deflated = deflate(playedWordsString, { level: level });
    //   console.log(
    //     `deflate ` + level,
    //     deflated.byteLength / uncompressedLength,
    //     (t1 - t0).toString().slice(0, 3) + "ms"
    //   );
    //   const t2 = performance.now();
    //   for (let i = 0; i < 1000; i++) {
    //     const inflated = inflate(deflated);
    //   }
    //   const t3 = performance.now();
    //   console.log("inflated in", (t3 - t2).toString().slice(0, 3) + "ms");
    // });
  }, [awaitingGame]);

  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  //setTempColor allows colorpicker to immediately close

  if (
    !awaitingPlayer &&
    !player?.color &&
    !isTutorialOpen &&
    !isColorPickerOpen
  ) {
    setIsColorPickerOpen(true);
  }

  //super buggy. dont know why
  // const [isFullscreen, setIsFullscreen] = useState(false);
  // document.addEventListener("fullscreenchange", () => {
  //   setIsFullscreen((prev) => !prev);
  //   console.log("went fullscreen");
  // });

  //This is a filter for cursors that hides cursors older than 60 seconds
  //It refreshes every 10 seconds
  const [staleInterval, setStaleInterval] = useState(
    new Timestamp(Timestamp.now().seconds - 60, 0)
  );
  useEffect(() => {
    const staleIntervalRefresher = setInterval(() => {
      setStaleInterval(new Timestamp(Timestamp.now().seconds - 60, 0));
    }, 10000);

    return () => {
      clearInterval(staleIntervalRefresher);
    };
  }, []);

  const cursorsQuery = query(
    collection(db, "games", gameId, "cursors"),
    where("state", "==", "live"),
    where("createdBy", "!=", player.id)
    // where("createdAt", ">", staleInterval),
    // orderBy("createdAt", "desc")
  );
  const [unfilteredCursors, awaitingCursors, cursorsError] =
    useCollectionData(cursorsQuery);
  if (cursorsError) console.log(cursorsError);
  const cursors = unfilteredCursors
    ? unfilteredCursors
        .filter((c) => c.createdAt > staleInterval)
        .sort((a, b) => a.createdAt.valueOf() - b.createdAt.valueOf())
    : [];

  const nodes = game?.nodes;
  // const playedWords = game?.playedWords;
  const playedWords = game?.playedWordsDeflated
    ? JSON.parse(
        inflate(game.playedWordsDeflated.toUint8Array(), { to: "string" })
      )
    : game?.playedWords;
  const winningChain = game?.winningChain;
  const isGameOver = game?.state === "dead";

  const isLoading = awaitingGame || awaitingPlayer || awaitingCursors;

  const board = useMemo(
    () =>
      game?.board
        // .toUpperCase()
        .split(" ")
        .map((r) => r.split("")),
    [game?.board]
  );

  const [selection, setSelection] = useState([]);

  const extendSelection = (newSelection) => {
    if (selection.length === 20) return;
    const cursorRef = doc(collection(db, "games", gameId, "cursors"));
    const [x, y] = newSelection.coords;
    newSelection = {
      ...newSelection,
      cursorId: cursorRef.id,
      createdAt: serverTimestamp(),
      diedAt: null,
      state: "live",
    };
    // onDisconnect(cursorRef).update({
    //   state: "dead",
    //   diedAt: serverTimestamp(),
    // });
    setDoc(cursorRef, newSelection).catch(console.log);

    setSelection((oldSelection) => [...oldSelection, newSelection]);
  };
  const clearSelection = () => trimSelection(0);
  const trimSelection = (index) => {
    const batch = writeBatch(db);
    selection &&
      selection.slice(index).forEach((cursor) => {
        const cursorRef = doc(db, "games", gameId, "cursors", cursor.cursorId);
        // onDisconnect(cursorRef).cancel();
        batch.update(cursorRef, {
          state: "dead",
          diedAt: serverTimestamp(),
        });
        // batch.delete(cursorRef) //if writing and storing all the cursors gets too much
      });
    batch.commit().catch(console.log);
    setSelection((oldSelection) => oldSelection.slice(0, index));
  };

  const continuationOptions =
    selection.length > 0 &&
    getNeighbors(
      selection[selection.length - 1].coords,
      board.length,
      selection.map((s) => s.coords)
    );

  // used for shifting latin characters slightly up
  const isEnglish = useMemo(
    () => !!board && "abcdefghijklmnopqrstuvwxyz".includes(board[0][0]),
    [board]
  );

  const winner = game?.winner;
  const [otherPlayerTag, setOtherPlayerTag] = useState(null);
  const [otherPlayerTagAnchor, setOtherPlayerTagAnchor] = useState(null);
  const isPlayerTagOpen = !!otherPlayerTagAnchor;
  const [otherPlayerId, setOtherPlayerId] = useState(null);
  const otherPlayerRef = otherPlayerId && doc(db, "players", otherPlayerId);
  const [otherPlayer] = useDocumentData(otherPlayerRef);
  const [tempOtherPlayer, setTempOtherPlayer] = useState({}); //TODO remove?
  useEffect(() => {
    setOtherPlayerId(game?.winner?.id);
  }, [game?.winner?.id]);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  ///////////        STYLING        ///////////

  const cursorStyle = (color) => ({
    boxShadow: `0 0 0.10em 0.06em ${color}`,
    cursor: "pointer",
  });
  const nodeStyle = {
    border: "4px solid ",
    animation: "expand 4s infinite ",
    cursor: "pointer",
  };

  const winningChainStyle = {
    // pseudo element could allow brighter glows that dont go on top of adjacent elements
    // but it doesn't show up for some reason
    // position: "relative",
    // "&::before": {
    //   // position: "absolute",
    //   // inset: 0,
    //   content: "apple",
    //   backgroundColor: "red",
    // },
    boxShadow: `0 0  5px 3px ${winner?.color}, inset 0 0 10px 6px ${winner?.color}`,
    border: "4px solid white",

    cursor: "pointer",
    filter: ` brightness(1.1)`,
  };
  const nodeStyles = useMemo(
    () =>
      nodes && !isGameOver
        ? generateStyles(stringTo2dArray(nodes), nodeStyle)
        : [[]],
    [nodes]
  );
  const playedWordsStyles = useMemo(
    () =>
      playedWords?.length > 0 &&
      playedWords
        .map((w) =>
          generateStyles(stringTo2dArray(w.chainCoords), {
            backgroundColor: w.color,
            cursor: "pointer",
          })
        )
        .reduce((p, c) => ({ ...p, ...c })),
    [playedWords]
  );
  const cursorStyles = useMemo(
    () =>
      generateStyles(
        cursors.map((c) => c.coords),
        cursors.map((c) => cursorStyle(c.color))
      ),
    [cursors]
  );
  const selectionStyles = useMemo(
    () =>
      generateStyles(
        selection.map((s) => s.coords),
        cursorStyle(player.color)
      ),
    [selection, player.color]
  );
  const continuationOptionsStyles = useMemo(
    () =>
      generateStyles(continuationOptions, {
        cursor: "pointer",
      }),
    [continuationOptions]
  );
  const winningChainStyles = useMemo(
    () =>
      winningChain
        ? generateStyles(stringTo2dArray(winningChain), winningChainStyle)
        : [[]],
    [winningChain, winner?.color]
  );

  const boardStyles =
    !isLoading &&
    Array(board.length)
      .fill(null)
      .map((r, y) =>
        Array(board.length)
          .fill(null)
          .map((c, x) => ({
            ...winningChainStyles[[x, y]],
            ...nodeStyles[[x, y]],
            ...playedWordsStyles[[x, y]],
            ...cursorStyles[[x, y]],
            ...selectionStyles[[x, y]],
            ...continuationOptionsStyles[[x, y]],
          }))
      );

  //TODO: refactor into Board.jsx
  ///////////        ACTIONS        ///////////

  const boardActions =
    !isLoading &&
    Array(board.length)
      .fill(null)
      .map((r) =>
        Array(board.length)
          .fill()
          .map(() => null)
      );

  if (boardActions) {
    cursors.map((cursor) => {
      const [x, y] = cursor.coords;
      boardActions[y][x] = (event) => {
        if (selection) clearSelection();
        setOtherPlayerTagAnchor(
          otherPlayerTagAnchor ? null : event.currentTarget
        );
        setOtherPlayerTag(
          <PlayerTag
            onClick={() => {
              setIsProfileModalOpen(true);
              setOtherPlayerTagAnchor(null);
            }}
            player={cursor}
            // player={{ ...cursor }}
          />
        );
        setOtherPlayerId(cursor.createdBy);
        setTempOtherPlayer(cursor);
      };
    });
    playedWords?.map((w) => {
      stringTo2dArray(w.chainCoords).map(([x, y]) => {
        boardActions[y][x] = () => {
          if (selection) clearSelection();
          setCurrentWord(w);
        };
      });
    });

    selection.length > 0 &&
      selection.map((selection, index) => {
        const {
          coords: [x, y],
        } = selection;
        boardActions[y][x] = () => trimSelection(index);
      });

    !isGameOver &&
      stringTo2dArray(nodes).map(([x, y]) => {
        boardActions[y][x] = () => {
          if (selection) {
            clearSelection();
          }
          extendSelection({
            coords: [x, y],
            letter: toHiragana(board[y][x]),
            color: player.color,
            playerName: player.playerName,
            icon: player.icon,
            createdBy: player.id,
          });
        };
      });

    selection.length > 0 &&
      continuationOptions.map(
        ([x, y]) =>
          (boardActions[y][x] = () => {
            extendSelection({
              coords: [x, y],
              letter: toHiragana(board[y][x]),
              color: player.color,
              playerName: player.playerName,
              icon: player.icon,
              createdBy: player.id,
            });
          })
      );
  }

  // console.log({ game, unfilteredCursors, cursors, selection, boardStyles });
  // console.log({ otherPlayerId: otherPlayerId, otherPlayer: otherPlayer });
  // console.log("rendered");
  // console.log(JSON.stringify(game));

  const gridRef = useRef();

  return (
    <>
      {isLoading ? (
        <LoadingScreen cellSize={cellSize} />
      ) : (
        <>
          <Board
            gridRef={gridRef}
            board={board}
            boardStyles={boardStyles}
            boardActions={boardActions}
            cellSize={cellSize}
            isEnglish={isEnglish}
            isGameOver={isGameOver}
            onItemsRendered={(e) => {
              const bottomReached = e.visibleRowStopIndex === board.length - 1;
              if (bottomReached != isBottomOfBoardVisible) {
                setIsBottomOfBoardVisible(bottomReached);
              }
            }}
          />

          <Minimap
            boardStyles={boardStyles}
            gridRef={gridRef}
            isMinimapOpen={isMinimapOpen}
            setIsMinimapOpen={setIsMinimapOpen}
            isGameOver={isGameOver}
            board={board}></Minimap>

          <Popover
            open={isPlayerTagOpen}
            anchorEl={otherPlayerTagAnchor}
            onClose={() => setOtherPlayerTagAnchor(null)}
            anchorOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
            transformOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            PaperProps={{
              sx: {
                fontSize: "1rem",
                height: "1.5rem",
                borderRadius: "1.5rem",
                fontFamily: "ubuntu",
              },
            }}>
            {otherPlayerTag}
          </Popover>
          <GameBottomBar
            setIsMinimapOpen={setIsMinimapOpen}
            player={player}
            game={game}
            setIsProfileModalOpen={setIsProfileModalOpen}
            setGameId={setGameId}
            isBottomOfBoardVisible={isBottomOfBoardVisible}
            setIsTutorialOpen={setIsTutorialOpen}
          />

          <ColorPicker
            open={isColorPickerOpen}
            onClose={() => setGameId(null)}
            onColorPicked={(color) => {
              setIsColorPickerOpen(false);
              setIsTutorialOpen(true);
              createPlayer({
                id: auth.currentUser.uid,
                color: color,
              });
            }}
          />

          <Tutorial
            open={isTutorialOpen}
            onClose={() => {
              setIsTutorialOpen(false);
            }}
          />

          <Profile
            player={{ ...tempOtherPlayer, ...otherPlayer }}
            editable={false}
            open={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}></Profile>

          <WordSubmissionDialog
            selection={selection}
            setSelection={setSelection}
            clearSelection={clearSelection}
            player={player}
            cursorStyle={cursorStyle}
            boardStyles={boardStyles}
            isEnglish={isEnglish}
            gameId={gameId}
            handleAlert={handleAlert}
          />

          <DictionaryView
            {...{
              currentWord,
              setCurrentWord,
              playedWords,
              setOtherPlayerId,
              setIsProfileModalOpen,
            }}
            winner={game.winner}
          />
        </>
      )}
    </>
  );
};

export default Game;

function generateStyles(coords, style) {
  if (!coords || coords.length === 0) return {};
  const styles = {};
  coords.map(([x, y], i) => {
    if (style.length > 0) styles[[x, y]] = style[i] || style[style.length - 1];
    else styles[[x, y]] = style;
  });
  return styles;
}

const stringTo2dArray = (s) =>
  s.split(" ").map((c) => c.split(",").map((s) => Number(s)));

export const twoDArrayToString = (a) => a.map((s) => s.join(",")).join(" ");

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

function createPlayer({ id, color, playerName = "", icon = "" }) {
  const playerRef = doc(db, "players", id);
  setDoc(
    playerRef,
    {
      playerName:
        playerName ||
        "anon" + (Math.floor(Math.random() * 99) + "").padStart(2, "0"),
      icon: icon || "😀",
      color: color,
      createdAt: serverTimestamp(),
    },
    { merge: true }
  )
    .then(console.log)
    .catch(console.log);
}
