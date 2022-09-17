import MapIcon from "@mui/icons-material/Map";
import { Button } from "@mui/material";
import React from "react";

export function MinimapButton({ setIsMinimapOpen, player, sx = {} }) {
  return (
    <Button
      onClick={() => setIsMinimapOpen(true)}
      sx={{
        bgcolor: "background.paper",
        ":hover": {
          bgcolor: "background.paper",
          boxShadow: 6,
        },
        width: "min(16vw,4rem)",
        height: "min(16vw,4rem)",
        minWidth: "",

        color: player.color,
        boxShadow: 3,
        transition: "background 0s",
        ...sx,
      }}>
      <MapIcon />
    </Button>
  );
}
