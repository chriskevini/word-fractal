import {
  ClickAwayListener,
  Dialog,
  Paper,
  Typography,
  Zoom,
  IconButton,
} from "@mui/material";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import {Box, Stack} from "@mui/system";
import {Timestamp} from "firebase/firestore";
import React, {useEffect} from "react";
import {useMemo} from "react";
import {useLocalStorage} from "./useLocalStorage";
import imgNotFound from "../image-not-found.jpg";
import {useState} from "react";

function DictionaryView({
  playedWords,
  currentWord,
  setCurrentWord,
  setOtherPlayerId,
  setIsProfileModalOpen,
  winner,
}) {
  if (currentWord === null) return null;
  const {
    audio,
    chainCoords,
    createdAt,
    createdBy,
    enSentence,
    jpSentence,
    enTranslation,
    jpTranslation,
    enDefinition,
    icon,
    playerName,
    color: playerColor,
    word,
    kanji,
    pitch,
    pronunciation,
  } = currentWord;
  const [preferEnDefinitions] = useLocalStorage("preferEnDefinitions", false);
  const pos = useMemo(
    () =>
      preferEnDefinitions ? getEnglishPos(currentWord.pos) : currentWord.pos,
    []
  );
  useEffect(() => {
    setOtherPlayerId(createdBy);
    console.log(currentWord);
  }, []);
  // console.log("parents", getParents(playedWords, currentWord));
  // console.log("siblings", getSiblings(playedWords, currentWord));
  // console.log("children", getChildren(playedWords, currentWord));
  // const image = "https://source.unsplash.com/random/600x400?" + word;
  const image =
    "https://source.unsplash.com/random/640x427?" +
    (enTranslation?.split(" ")[0] || word);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [closing, setClosing] = useState(false);
  return (
    <Dialog
      // onClick={() => setCurrentWord(null)}
      // sx={{
      //   position: "fixed",
      //   inset: "0",
      //   display: "grid",
      //   placeItems: "center",
      //   background: "#0008",
      // }}>
      transitionDuration={300}
      TransitionComponent={Zoom}
      open={!closing && !!currentWord}
      onClose={() => {
        setClosing(true);
        setTimeout(() => {
          setCurrentWord(null);
          setClosing(false);
        }, 350);
        setOtherPlayerId(winner?.id);
      }}
      PaperProps={{
        sx: {
          margin: "0px",
          borderRadius: "20px",
          border: "4px solid " + playerColor,
        },
      }}>
      <Box
        sx={{
          backgroundColor: "background.paper",
          // boxShadow: 8,
          // width: "minmax(300px,calc(100vw-8px))",
          width: "300px",
          height: "400px",

          // borderBottom: "0px",
          // background: color,
          // borderRadius: "20px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          lineHeight: 1.1,
          position: "relative",
        }}>
        <Box
          sx={{
            background: `url(${imgNotFound}) #0008`,
            backgroundSize: "cover",
            minHeight: "200px",
            borderRadius: "0px 0px 20px 20px",
            boxShadow: 2,
            position: "relative",
            "@keyframes blurIn": {
              "0%, 50%": {
                filter: "blur(20px)",
              },
              "100%": {
                filter: "blur(0px)",
              },
            },
            animation: "blurIn 6s",
            clipPath: "inset(0px round 20px)",
          }}></Box>
        <img
          src={`${image}`}
          width="100%"
          height="100%"
          onLoad={() => setImageLoaded(true)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "200px",
            opacity: imageLoaded ? 1.0 : 0,
            filter: imageLoaded ? "blur(0px)" : "blur(10px)",
            transition: "opacity 0.3s, filter 0.3s",
            borderRadius: "0px 0px 20px 20px",
          }}
        />

        <Box
          sx={{
            lineHeight: 1.5,
            fontSize: "30px",
            textAlign: "center",
            position: "relative",
            // alignItems: "center",
          }}>
          {kanji || word}
          {audio && (
            <IconButton
              onClick={() => new Audio(audio).play()}
              sx={{mr: "-1.25em", p: 0, pl: "0.25em"}}>
              <VolumeUpIcon />
            </IconButton>
          )}
        </Box>
        <Stack
          direction="row"
          justifyContent="space-between"
          sx={{
            lineHeight: 1.2,
            mx: "1rem",
            mb: "0.25rem",
            opacity: 0.5,
            fontSize: "0.8rem",
          }}>
          <span style={{fontStyle: "italic"}}>{pos}</span>
          <span>
            {pronunciation || pitch?.map((e) => e.part)?.join("") || ""}
          </span>
        </Stack>
        <Box sx={{mx: "1rem", mb: "1rem"}}>
          {(preferEnDefinitions ? enDefinition : jpTranslation) ||
            enTranslation}
        </Box>
        <Box sx={{mx: "1rem", mb: "0.25rem", opacity: 0.5, fontSize: "0.8rem"}}>
          {preferEnDefinitions ? "" : jpSentence}
        </Box>
        <Box sx={{mx: "1rem", opacity: 0.5, fontSize: "0.8rem"}}>
          {enSentence}
        </Box>
        <Box sx={{flexGrow: 1}}></Box>
        <Box
          component="a"
          href={
            enTranslation
              ? "https://jotoba.de/search/" + word
              : preferEnDefinitions
              ? "https://en.wikipedia.org/wiki/" + word
              : "https://www.ei-navi.jp/dictionary/content/" + word
          }
          sx={{
            position: "absolute",
            bottom: "1.5rem",
            right: 0,
            // textAlign: "end",
            p: "0.25em",
            textDecoration: "none",
            textDecorationColor: "text.primary",
            color: "text.primary",
            opacity: 0.8,
            fontSize: "0.7rem",
            fontStyle: "italic",
            cursor: "pointer",
            width: "fit-content",
          }}>
          See more
        </Box>
        <Box
          onClick={() => {
            setClosing(true);
            setTimeout(() => {
              setIsProfileModalOpen(true);
              setCurrentWord(null);
              setClosing(false);
            }, 100);
          }}
          sx={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            lineHeight: 1.75,
            backgroundColor: playerColor,
            cursor: "pointer",
            // backgroundClip: "border-box", //weird line around border
            // width: "110%",
            display: "flex",
            justifyContent: "space-between",
            px: "0.5rem",
            mb: "-4px",
          }}>
          <span>{icon + playerName}</span>
          <span
            style={{
              WebkitTextStroke: "0px",
              color: "#0004",
            }}>
            {relativeTimestamp(createdAt)}
          </span>
        </Box>
      </Box>
    </Dialog>
  );
}

export default DictionaryView;

function getParents(playedWords, currentWord) {
  const {chainCoords} = currentWord;
  const startOfWord = chainCoords.split(" ")[0];
  return playedWords.filter((pw) => pw.chainCoords.endsWith(startOfWord));
}

function getSiblings(playedWords, currentWord) {
  const {chainCoords} = currentWord;
  const startOfWord = chainCoords.split(" ")[0];
  return playedWords.filter(
    (pw) =>
      pw.chainCoords.startsWith(startOfWord) && pw.chainCoords != chainCoords
  );
}

function getChildren(playedWords, currentWord) {
  const {chainCoords} = currentWord;
  const endOfWord = chainCoords.split(" ")[chainCoords.split(" ").length - 1]; //.at() broken
  return playedWords.filter((pw) => pw.chainCoords.startsWith(endOfWord));
}

function relativeTimestamp(timestampToCompare) {
  const second = 1;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;

  const difference = Timestamp.now().seconds - timestampToCompare["_seconds"];

  if (difference < minute)
    return Math.floor(difference / second) + " second(s) ago";
  if (difference < hour)
    return Math.floor(difference / minute) + " minute(s) ago";
  if (difference < day) return Math.floor(difference / hour) + " hour(s) ago";
  else return Math.floor(difference / day) + " day(s) ago";
}

function getEnglishPos(pos) {
  switch (pos) {
    case "名詞":
      return "Noun";
    case "動詞":
      return "Verb";
    case "形容詞":
      return "Adjective";
    // case "":
    //   return ""
    // case "":
    //   return ""
    // case "":
    //   return ""
    // case "":
    //   return ""
    // case "":
    //   return ""
    // case "":
    //   return ""
    default:
      return pos;
  }
}

function fetchImage(word) {}
