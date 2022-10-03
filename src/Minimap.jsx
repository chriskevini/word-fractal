import React from "react";
import { vmin, vh, vw } from "./utils";
import { FixedSizeGrid } from "react-window";
import { Dialog, Zoom } from "@mui/material";
import { green } from "@mui/material/colors";

export function Minimap({
  boardStyles,
  gridRef,
  isMinimapOpen,
  setIsMinimapOpen,
  isGameOver,
  board,
}) {
  const mapWidth = vmin(96);
  return (
    <Dialog
      // update transition maybe use react-spring
      TransitionComponent={Zoom}
      transitionDuration={300}
      open={isMinimapOpen}
      onClose={() => setIsMinimapOpen(false)}
      PaperProps={{
        elevation: 0,
        sx: {
          minWidth: mapWidth,
          minHeight: mapWidth,
          overflow: "hidden",
          boxShadow: 20,
          "@keyframes slideFromBottomLeft": {
            "0%": {
              opacity: 0,
              transform: "translate(-50vw, 50vh)",
            },
          },
          animation: "slideFromBottomLeft 0.5s",
          // transform: isMinimapOpen
          //   ? "translate(0, 0)"
          //   : "translate(-50vw, 50vh)",
          // transition: "transform 0.5s",
        },
      }}
    >
      <FixedSizeGrid
        itemData={{
          boardStyles: boardStyles,
          gridRef: gridRef,
          setIsMinimapOpen: setIsMinimapOpen,
          isGameOver: isGameOver,
        }}
        // style={{ backgroundColor: "transparent" }}
        height={mapWidth}
        width={mapWidth}
        columnCount={board.length}
        rowCount={board.length}
        columnWidth={mapWidth / board.length}
        rowHeight={mapWidth / board.length}
      >
        {minimapCell}
      </FixedSizeGrid>
    </Dialog>
  );
}

const minimapCell = ({ columnIndex, rowIndex, style, data }) => {
  if (!data.boardStyles[rowIndex][columnIndex].backgroundColor) return null;
  // else
  return (
    <div
      onClick={() => {
        setTimeout(() => {
          data.gridRef.current.scrollToItem({
            align: "center",
            columnIndex: columnIndex,
            rowIndex: rowIndex,
          });
        }, 0);
        data.setIsMinimapOpen(false);
      }}
      style={{
        ...style,
        backgroundColor:
          data.boardStyles[rowIndex][columnIndex].backgroundColor,
        cursor: "pointer",
        filter:
          data.boardStyles[rowIndex][columnIndex].filter ||
          (data.isGameOver
            ? "opacity(0.5) grayscale(0.2) brightness(0.8)"
            : ""),
      }}
    ></div>
  );
};
