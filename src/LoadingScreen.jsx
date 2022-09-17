import { Box, Skeleton } from "@mui/material";
import React from "react";

const LoadingCell = ({ size }) => (
  //TODO try to shift the animation start
  <Skeleton
    variant="rounded"
    width={size}
    height={size}
    sx={{
      scale: "0.9",
      animationDelay: "-2s",
      // bgcolor: "background.paper",
      // filter: "brightness(1.1)",
    }}
  />
);

export function LoadingScreen({ cellSize }) {
  return (
    <Box width="100vw">
      <Box
        width={cellSize * 3}
        sx={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          margin: "0 auto",
          // "@keyframes lmao": {
          //   "50%": {
          //     scale: "1.2",
          //   },
          // },
          // animation: "lmao 1.5s infinite",
        }}>
        <LoadingCell size={cellSize} />
        <LoadingCell size={cellSize} />
        <LoadingCell size={cellSize} />
        <LoadingCell size={cellSize} />
        <LoadingCell size={cellSize} />
        <LoadingCell size={cellSize} />
        <LoadingCell size={cellSize} />
        <LoadingCell size={cellSize} />
        <LoadingCell size={cellSize} />
      </Box>
    </Box>
  );
}
