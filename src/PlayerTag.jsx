import { Box, Paper } from "@mui/material";
import React from "react";

export function PlayerTag({
  player,
  fontSize = "1rem",
  sx = {},
  onClick = () => {},
}) {
  return (
    <Paper
      onClick={onClick}
      sx={{
        fontSize: fontSize,
        height: "1.5em",
        borderRadius: "1.5em",
        fontFamily: "ubuntu",
        pl: "0.15em",
        pr: "0.25em",
        bgcolor: player.color,
        cursor: "pointer",
        transition: "background 0.5s",
        ...sx,
      }}
    >
      {player.icon + player.playerName}
    </Paper>
  );
}
