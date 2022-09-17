import CheckBoxRoundedIcon from "@mui/icons-material/CheckBoxRounded";
import DisabledByDefaultRoundedIcon from "@mui/icons-material/DisabledByDefaultRounded";
import VerticalAlignBottomIcon from "@mui/icons-material/VerticalAlignBottom";
import VerticalAlignTopIcon from "@mui/icons-material/VerticalAlignTop";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Popover,
  Stack,
  useTheme,
  Zoom,
} from "@mui/material";
import { green, red } from "@mui/material/colors";
import { httpsCallable } from "firebase/functions";
import React, { useContext, useMemo, useState } from "react";
import { AlertsContext, functions } from "./App";
import { BoardTile } from "./Board";
import { useLocalStorage } from "./useLocalStorage";
import { vmin, vw } from "./utils";
import { twoDArrayToString } from "./Game";

function AltLetterSelector(props) {
  const altLetters = useMemo(() => getAlts(props.letter), [props.letter]);

  return (
    <Popover
      open={props.isAltLettersOpen && altLetters?.length > 0}
      anchorEl={props.altLettersAnchor}
      onClose={() => props.setAltLettersAnchor(null)} // PaperProps={{ backgroundColor: "red" }}
      PaperProps={{
        elevation: 0,
        sx: { background: "transparent", p: "0.15em" },
      }}
      anchorOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}>
      <Stack direction="row">
        {altLetters?.map((letter, i) => (
          <BoardTile
            sx={{}}
            key={i}
            letter={letter}
            style={{
              width: "1.3em",
              height: "1.3em",
              // fontSize: vmin(100) < 600 ? 32 : vmin(4),
              fontSize: "max(4vmin, 32px)",
              ...props.cursorStyle(props.color),
              // scale: "0.8",
              backgroundColor: props.altLetterBackgroundColor,
            }}
            onClick={() => {
              props.setSelection((prev) => {
                prev[props.altLetterIndex].letter = letter;
                return prev;
                // const newLetter = {
                //   ...prev[props.altLetterIndex],
                //   letter: letter,
                // };
                // return [
                //   ...prev.slice(0, props.altLetterIndex),
                //   newLetter,
                //   ...prev.slice(props.altLetterIndex + 1),
                // ];
              });
              props.setAltLettersAnchor(null);
            }}
          />
        ))}
      </Stack>
    </Popover>
  );
}

export function WordSubmissionDialog({
  selection,
  setSelection,
  clearSelection,
  player,
  cursorStyle,
  boardStyles,
  isEnglish,
  gameId,
}) {
  const [altLettersAnchor, setAltLettersAnchor] = useState(null);
  const isAltLettersOpen = !!altLettersAnchor;
  const [awaitingAfterSubmitWord, setAwaitingAfterSubmitWord] = useState(false);
  const [altLetterIndex, setAltLetterIndex] = useState(null);
  const [altLetterBackgroundColor, setAltLetterBackgroundColor] =
    useState(null);
  const [, , handleAlert] = useContext(AlertsContext);
  const [preferDialogAtTop, setPreferDialogAtTop] = useLocalStorage(
    "preferWordSubmissionDialogAtTop",
    false
  );
  const toggleSelectionModalLocation = () => {
    setPreferDialogAtTop(!preferDialogAtTop);
  };
  const theme = useTheme();
  const [kanaToggleButton, setKanaToggleButton] = useState("ア");

  return (
    <>
      <Zoom in={selection.length > 0}>
        <Paper
          elevation={8}
          sx={{
            position: "fixed",
            top: preferDialogAtTop ? "20vmin" : "",
            bottom: preferDialogAtTop ? "" : "2vmin",
            left: (vw(100) - Math.min(vmin(92) + 24, 600 + 24)) / 2,
            zIndex: 150,
            width: Math.min(vmin(92) + 24, 600 + 24),
            borderRadius: 2,
            overflow: "hidden",
          }}>
          <Stack
            direction="row"
            justifyContent="center"
            sx={{
              m: "12px",
              mb: 0,
            }}>
            {selection.map((s, i) => {
              const [x, y] = s.coords;
              return (
                <Box
                  key={x + "," + y + "box"}
                  sx={{
                    "@keyframes ghost": {
                      "50%": {
                        backgroundColor: player.color,
                        boxShadow: "0 0 0.20em 0.08em " + player.color,
                      },
                    },
                  }}>
                  <BoardTile
                    key={x + "," + y + "tile"}
                    letter={s.letter}
                    style={{
                      ...cursorStyle(player.color),
                      cursor: "pointer",
                      width: "1.3em",
                      height: "1.3em",
                      fontSize:
                        Math.min(vmin(92), 600) /
                        Math.max(selection.length, 4) /
                        1.3,
                      transition: "width 0.5s, height 0.2s ",
                      backgroundColor:
                        boardStyles[y][x].backgroundColor ||
                        theme.palette.background.paper,

                      animation: awaitingAfterSubmitWord
                        ? "ghost 3s infinite"
                        : "",
                    }}
                    onClick={(e) => {
                      if (isEnglish) return;
                      setAltLettersAnchor(e.currentTarget);
                      setAltLetterIndex(i);
                      setAltLetterBackgroundColor(
                        boardStyles[y][x].backgroundColor ||
                          theme.palette.background.paper
                      );
                    }}
                  />
                </Box>
              );
            })}
          </Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-end">
            {/* for spacing */}
            <IconButton>
              <VerticalAlignBottomIcon sx={{ mb: "", opacity: "0" }} />
            </IconButton>
            <Box>
              <IconButton
                onClick={() => {
                  clearSelection();
                  setKanaToggleButton("ア");
                }}
                size="small">
                <DisabledByDefaultRoundedIcon
                  sx={{ fontSize: "60px", padding: 0, color: red[400] }}
                />
              </IconButton>
              <Button
                onClick={() => {
                  setSelection((prev) => {
                    return prev.map((s) => ({
                      ...s,
                      letter:
                        kanaToggleButton == "ア"
                          ? toKatakana(s.letter)
                          : toHiragana(s.letter),
                    }));
                  });
                  setKanaToggleButton((prev) => (prev === "あ" ? "ア" : "あ"));
                }}
                sx={{
                  fontSize: "32px",
                  p: 0,
                  m: 0,
                  color: "text.primary",
                  filter: isEnglish ? "opacity(0)" : "opacity(0.5)",
                  pointer: isEnglish ? "" : "pointer",
                }}>
                {kanaToggleButton}
              </Button>
              <IconButton
                onClick={() => {
                  setAwaitingAfterSubmitWord(true);
                  const checkPlayedWord = httpsCallable(
                    functions,
                    "checkPlayedWord"
                  );
                  checkPlayedWord({
                    gameId: gameId,
                    createdBy: player.id,
                    chainCoords: twoDArrayToString(
                      selection.map((s) => s.coords)
                    ),
                    word: selection.map((s) => s.letter).join(""),
                  })
                    .then((res) => {
                      console.log(res);
                      handleAlert(res.data);
                    })
                    .catch((res) => {
                      handleAlert({
                        status: "error",
                        message:
                          "Cannot connect to the server. Please check your internet connection.",
                      });
                      console.log(res);
                    })
                    .finally(() => {
                      clearSelection();
                      setKanaToggleButton("ア");
                      setAwaitingAfterSubmitWord(false);
                    });
                }}
                size="small"
                disabled={selection.length < 3}>
                <CheckBoxRoundedIcon
                  sx={{
                    fontSize: "60px",
                    padding: 0,
                    color: selection.length >= 3 ? green[400] : "grey",
                  }}
                />
              </IconButton>
            </Box>
            <IconButton
              onClick={toggleSelectionModalLocation}
              disableRipple>
              {preferDialogAtTop ? (
                <VerticalAlignBottomIcon sx={{ mb: "" }} />
              ) : (
                <VerticalAlignTopIcon sx={{ mb: "" }} />
              )}
            </IconButton>
          </Stack>
        </Paper>
      </Zoom>

      <AltLetterSelector
        letter={selection[altLetterIndex]?.letter}
        setSelection={setSelection}
        color={player.color}
        cursorStyle={cursorStyle}
        altLettersAnchor={altLettersAnchor}
        setAltLettersAnchor={setAltLettersAnchor}
        altLetterBackgroundColor={altLetterBackgroundColor}
        altLetterIndex={altLetterIndex}
        isAltLettersOpen={isAltLettersOpen}></AltLetterSelector>
    </>
  );
}

const getAlts = (kana) => {
  const alts = [
    "あぁ",
    "いぃ",
    "うぅ",
    "えぇ",
    "おぉ",
    "かが",
    "きぎ",
    "くぐ",
    "けげ",
    "こご",
    "さざ",
    "しじ",
    "すず",
    "せぜ",
    "そぞ",
    "ただ",
    "ちぢ",
    "つづっ",
    "てで",
    "とど",
    "はばぱ",
    "ひびぴ",
    "ふぶぷ",
    "へべぺ",
    "ほぼぽ",
    "やゃ",
    "ゆゅ",
    "よょ",
    "アァ",
    "イィ",
    "ウゥ",
    "エェ",
    "オォ",
    "カガ",
    "キギ",
    "クグ",
    "ケゲ",
    "コゴ",
    "サザ",
    "シジ",
    "スズ",
    "セゼ",
    "ソゾ",
    "タダ",
    "チヂ",
    "ツヅッ",
    "テデ",
    "トド",
    "ハバパ",
    "ヒビピ",
    "フブプ",
    "ヘベペ",
    "ホボポ",
    "ヤャ",
    "ユュ",
    "ヨョ",
  ];
  const kanaGroup = alts.find((g) => g.includes(kana));
  if (kanaGroup) return kanaGroup.split("").filter((k) => k != kana);
  else return [];
};

const toHiragana = (kana) =>
  kana.charCodeAt() >= "ァ".charCodeAt() &&
  kana.charCodeAt() <= "ヶ".charCodeAt()
    ? String.fromCharCode(kana.charCodeAt(0) - 96)
    : kana;

const toKatakana = (kana) =>
  kana.charCodeAt() >= "ぁ".charCodeAt() &&
  kana.charCodeAt() <= "ゖ".charCodeAt()
    ? String.fromCharCode(kana.charCodeAt(0) + 96)
    : kana;

const toggleKana = (kana) => {
  const temp = toKatakana(kana);
  if (temp === kana) return toHiragana(kana);
  else return temp;
};
