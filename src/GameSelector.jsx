import Brightness4Icon from "@mui/icons-material/Brightness4";
import {Box, Button, IconButton, Stack, Typography, Zoom} from "@mui/material";
import {collection, orderBy, query} from "firebase/firestore";
import React, {useContext, useMemo} from "react";
import {useCollectionData} from "react-firebase-hooks/firestore";
import bgDark from "/assets/bg-dark.webp";
import bgLight from "/assets/bg-light.webp";
import {DarkModeContext, db} from "./App";

function GameSelector({handleChooseGame}) {
  const usingHTBrowser = navigator.userAgent.indexOf("hellotalk") > -1;
  const [darkMode, toggleDarkMode] = useContext(DarkModeContext);
  const gameStatesRef = collection(db, "gameStates");
  const [gameStates] = useCollectionData(
    query(gameStatesRef, orderBy("createdAt", "desc"))
  );

  const liveGames = gameStates?.filter((game) => game.state === "live") || [];
  const deadGames = gameStates?.filter((game) => game.state === "dead") || [];
  return (
    <>
      <Background {...{darkMode}} />
      <Header {...{usingHTBrowser, toggleDarkMode}} />
      <Box
        sx={{
          overflow: "scroll",
          width: "100vw",
          height: "100vh",
          textAlign: "center",
        }}>
        <Stack sx={{alignItems: "center"}}>
          <Typography
            sx={{
              fontSize: "12vmin",
              fontWeight: "bold",
              mt: "20vh",
              mb: "1em",
              filter: "drop-shadow(2px 6px 10px #0008)",
              WebkitTextStrokeWidth: 0,
            }}>
            WordFractal
          </Typography>

          {usingHTBrowser ? (
            <Typography
              fontSize="30px"
              mt="60px"
              mx="10%"
              sx={{filter: "drop-shadow(1px 3px 5px #0008)"}}>
              Please open this page on another browser.
            </Typography>
          ) : (
            <Buttons
              {...{gameStates, liveGames, deadGames, handleChooseGame}}
            />
          )}
        </Stack>
      </Box>
      <Footer />
    </>
  );
}

export default GameSelector;

function Buttons({gameStates, liveGames, deadGames, handleChooseGame}) {
  if (!gameStates) return null;
  return (
    <Stack
      direction="row"
      justifyContent="center"
      alignItems="center"
      flexWrap="wrap"
      gap="20px"
      mx="12px"
      mt="20px"
      mb="60px"
      maxWidth="400px">
      <Zoom in>
        <Typography
          width="100%"
          fontSize="30px"
          sx={{filter: "drop-shadow(1px 3px 5px #0008)"}}>
          Join a game
        </Typography>
      </Zoom>
      {[...liveGames, ...deadGames].map((game) => {
        return (
          <Zoom
            in
            key={game.id}>
            <Button
              onClick={() => handleChooseGame(game.id)}
              size="small"
              variant={game.state === "dead" ? "" : "contained"}
              // color="primary"
              sx={{
                padding: "0",
                width: game.state === "dead" ? "75px" : "110px",
                height: game.state === "dead" ? "75px" : "110px",
                bgcolor: game.state === "dead" ? "transparent" : "",
                filter:
                  game.state === "dead" ? "grayscale(1.0) contrast(0.5) " : "",
              }}>
              <Typography
                fontSize={game.state === "dead" ? "48px" : "64px"}
                lineHeight={game.state === "dead" ? "48px" : "64px"}>
                {game.icon || game.name}
              </Typography>
            </Button>
          </Zoom>
        );
      })}
    </Stack>
  );
}

function Background({darkMode}) {
  const backgroundOffset = useMemo(
    () => Math.floor(Math.random() * -1000) + "s",
    []
  );
  const backgroundXVel = useMemo(() => (Math.random() < 0.5 ? "-" : ""), []);
  const backgroundYVel = useMemo(() => (Math.random() < 0.5 ? "-" : ""), []);
  return (
    <Box
      sx={{
        position: "fixed",
        left: 0,
        top: 0,
        minWidth: "100vw",
        minHeight: "100vh",
        background: darkMode
          ? `url(${bgDark}) repeat`
          : `url(${bgLight}) repeat`,
        filter: "blur(3px) brightness(1)",
        transform: "scale(2)",

        "@keyframes slide": {
          "0%": {
            backgroundPosition: "0px 0px",
          },
          "100%": {
            backgroundPosition: `${backgroundXVel}5000px ${backgroundYVel}8000px`,
          },
        },

        animation: "slide 1000s infinite  linear",
        animationDelay: backgroundOffset,
        zIndex: -100,
      }}></Box>
  );
}

function Footer() {
  return (
    <Stack
      sx={{
        position: "fixed",
        bottom: 0,
        // minHeight: "5vh",
        // background: "#8888",
        backdropFilter: "blur(10px)",
        textAlign: "center",
        justifyContent: "center",
        width: "100%",
        px: "10%",
        py: "0.5rem",
        fontSize: "0.75rem",
        // opacity: 0.5,
      }}>
      <Box>Made with ❤ from Canada.</Box>
      <Box
        component="a"
        href="mailto:wordfractal@gmail.com"
        sx={{
          color: "text.primary",
          textDecoration: "none",
        }}>
        Contact me: wordfractal@gmail.com
      </Box>
    </Stack>
  );
}

function Header({usingHTBrowser, toggleDarkMode}) {
  return (
    <Box sx={{position: "fixed", top: 0, minHeight: "10vh"}}>
      {usingHTBrowser ? (
        <Box
          sx={{
            animation: "float 1s infinite",
            position: "fixed",
            top: "5vw",
            right: "5vw",
            fontSize: "20px",
          }}>
          👆
        </Box>
      ) : (
        <IconButton
          onClick={toggleDarkMode}
          sx={{position: "fixed", top: "5vw", right: "5vw"}}>
          <Brightness4Icon sx={{fontSize: "1.5rem"}} />
        </IconButton>
      )}
    </Box>
  );
}
