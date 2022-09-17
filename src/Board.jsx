import { Box } from "@mui/material";
import React from "react";
import { FixedSizeGrid } from "react-window";
import { vw } from "./utils";
import { useWindowSize } from "./window-size";

export function Board({
  gridRef,
  board,
  boardStyles,
  boardActions,
  cellSize,
  isEnglish,
  isGameOver,
  onItemsRendered = () => {},
}) {
  const { width, height } = useWindowSize();
  //bottom
  return (
    <FixedSizeGrid
      ref={gridRef}
      itemData={{
        board: board,
        boardStyles: boardStyles,
        boardActions: boardActions,
        tileSize: cellSize * 0.9,
        fontSize: cellSize * 0.77,
        isEnglish: isEnglish,
        isGameOver: isGameOver,
        gridRef: gridRef,
      }}
      height={height}
      width={width}
      columnCount={board.length}
      rowCount={board.length}
      columnWidth={cellSize}
      rowHeight={cellSize}
      overscanColumnCount={2}
      overscanRowCount={2}
      // initialScrollTop={(board.length / 2) * cellSize - vh(50)}
      initialScrollLeft={
        (Math.floor(board.length / 2) + 0.5) * cellSize - vw(50)
      }
      onItemsRendered={onItemsRendered}
      style={{
        backgroundColor: isGameOver ? "#0003" : "",
      }}
      className="unselectable">
      {Cell}
    </FixedSizeGrid>
  );
}

export const BoardTile = ({ letter, style = {}, onClick = () => {} }) => (
  <div
    className="unselectable"
    onClick={onClick}
    style={{
      fontSize: "50px",
      // fontWeight: 700, read preference from localstorage
      borderRadius: "4px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#aaa1",
      scale: "0.9",
      // transitionDuration: "0.5s",
      transition:
        "color 0s, box-shadow 0.5s, border 0.5s, background-color 0.5s",

      ...style,
    }}>
    {letter}
  </div>
);

export const SXBoardTile = ({ letter, sx = {}, onClick = () => {} }) => (
  <Box
    onClick={onClick}
    style={{
      fontSize: "50px",
      // fontWeight: 700, read preference from localstorage
      borderRadius: "4px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#aaa1",
      scale: "0.9",
      // transitionDuration: "0.5s",
      transition:
        "color 0s, box-shadow 0.5s, border 0.5s, background-color 0.5s",

      ...sx,
    }}>
    {letter}
  </Box>
);

const Cell = ({ columnIndex, rowIndex, style, data }) => {
  return BoardTile({
    letter: data.board[rowIndex][columnIndex],
    style: {
      filter: data.isGameOver
        ? "opacity(0.5) grayscale(0.5) brightness(0.8)"
        : "",
      ...style,
      ...data.boardStyles[rowIndex][columnIndex],
    },
    onClick: data.boardActions[rowIndex][columnIndex],
  });
};

const Cell4 = ({ columnIndex, rowIndex, style, data }) => {
  return (
    <div
      style={{
        ...style,
        fontSize: "50px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}>
      {data.board[rowIndex][columnIndex]}
    </div>
  );
};
