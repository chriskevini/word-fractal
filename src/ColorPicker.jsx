import { Button, Dialog, Paper } from "@mui/material";
import {
  blue,
  green,
  indigo,
  lightBlue,
  orange,
  purple,
  red,
  yellow,
} from "@mui/material/colors";
import { Box, Container, Stack } from "@mui/system";
import React from "react";
import { vmin } from "./utils";

//Original colors
//🟥🟧🟨🟩🟦🟪
const colors = [
  red[400],
  orange[400],
  yellow[500],
  green[400],
  blue[400],
  purple[300],
];

function ColorPicker({ onColorPicked, open = false, onClose }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: "5vmin",
          transform: vmin(100) > 600 ? `scale(${600 / vmin(100)})` : "",
          minWidth: "80vmin",
          minHeight: "80vmin",
        },
      }}
    >
      <Stack direction="column" justifyContent="space-evenly" height="80vmin">
        <Box
          textAlign="center"
          fontSize="10vmin"
          sx={{ animation: "float 1s infinite" }}
        >
          👇
        </Box>
        <Box
          width="60vmin"
          sx={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            mx: "auto",
          }}
        >
          {colors.map((color) => (
            <Paper
              onClick={() => onColorPicked(color)}
              key={color}
              sx={{
                bgcolor: color,
                width: "18vmin",
                height: "18vmin",
                borderRadius: "8px",
                margin: "1vmin",
                cursor: "pointer",
              }}
            >
              {/* 🟥🟧🟨🟩🟦🟪 */}
            </Paper>
          ))}
        </Box>
      </Stack>
    </Dialog>
  );
}

export default ColorPicker;
