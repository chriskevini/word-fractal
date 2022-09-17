import { Box, Stack } from "@mui/material";
import React from "react";
import { PlayerTag } from "./PlayerTag";

export function WinnerBanner({ setIsProfileModalOpen, game, sx }) {
  return (
    <Stack
      sx={{
        // position: "fixed",
        // bottom: "4vh",
        // width: "100%",
        // marginX: "auto",
        alignItems: "center",
        ...sx,
      }}>
      {/* <Fade in={isGameOver}> */}
      <Box
        onClick={() => {
          setIsProfileModalOpen(true);
        }}
        sx={{
          fontSize: "min(7vw,2rem)",
          lineHeight: "min(7vw,2rem)",
          filter: `drop-shadow(0 0 5px ${game.winner.color})`,
          textShadow: `0 0 10px ` + game.winner.color,
          color: "white",
          // zIndex: "1",
          cursor: "pointer",
          transition: "filter 0.5s, text-shadow 0.5s",
        }}>
        Winner
      </Box>
      <PlayerTag
        onClick={() => {
          setIsProfileModalOpen(true);
        }}
        player={game.winner}
        sx={{
          fontSize: "min(5vw,2rem)",
          color: "white",
          position: "relative",
          filter: "brightness(1.1)",
          "&::before": {
            content: "''",
            inset: "0",
            position: "absolute",
            border: "3px solid white",
            borderRadius: "100vw",
            boxShadow: `0 0 12px 6px ${game.winner.color},0 0 24px 12px ${game.winner.color}40`,
            transition: "box-shadow 0.5s",
          },
        }}
      />
      {/* </Fade> */}
    </Stack>
  );
}
