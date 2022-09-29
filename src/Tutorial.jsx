import {Box, Dialog} from "@mui/material";
import React from "react";
import {vmin} from "./utils";

function Tutorial({open = false, onClose}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: "8px",
          transform: vmin(100) > 600 ? `scale(${600 / vmin(100)})` : "",
          minWidth: "80vmin",
          minHeight: "80vmin",
          display: "grid",
          placeItems: "center",
        },
      }}>
      <Box
        bgcolor="#02021D" //darkmode paper
        sx={{
          "@keyframes fade": {
            "50%": {
              bgcolor: "transparent",
            },
            "20%,80%": {
              bgcolor: "#02021D",
            },
          },
          animation: "fade 4s infinite",
          animationDelay: "-1s",
        }}
        width="70vw"
        height="70vw"
        borderRadius={3}
        overflow="hidden">
        <video
          autoPlay
          loop
          // controls
          width="100%"
          height="100%"
          style={{objectFit: "cover"}}>
          <source src="https://firebasestorage.googleapis.com/v0/b/word-fractal-dev.appspot.com/o/tutorial.webm?alt=media&token=a7e477a4-be0c-42d4-8f98-2343e7a12a54" />
        </video>
      </Box>
    </Dialog>
  );
}

export default Tutorial;
