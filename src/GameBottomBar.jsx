import { Stack, Box } from "@mui/material";
import React from "react";
import GameMenu from "./GameMenu";
import { MinimapButton } from "./MinimapButton";
import { WinnerBanner } from "./WinnerBanner";

export function GameBottomBar({
  setIsMinimapOpen,
  player,
  game,
  setIsProfileModalOpen,
  setGameId,
  isBottomOfBoardVisible,
  setIsTutorialOpen,
}) {
  const isFullscreen = !!document.fullscreenElement;
  const fullscreenAdj = isFullscreen ? -1 : 0;
  const bottomVisibleAdj = isBottomOfBoardVisible ? 40 : 0;
  const yTranslate = 82 + fullscreenAdj + bottomVisibleAdj + "vh";
  return (
    <Stack
      direction="row"
      position="absolute"
      // bgcolor="pink"
      bottom="0"
      // top="0"
      padding="4vmin"
      width="100%"
      sx={{
        pointerEvents: "none",
        // transform: `translateY(${yTranslate})`,
        transform: isBottomOfBoardVisible ? `translateY(20vh)` : "",
        transition: "transform 0.5s",
      }}
      justifyContent="space-between"
      alignItems="flex-end">
      <MinimapButton
        setIsMinimapOpen={setIsMinimapOpen}
        player={player}
        sx={{
          pointerEvents: "all",
        }}
      />
      {game.winner && (
        <WinnerBanner
          setIsProfileModalOpen={setIsProfileModalOpen}
          game={game}
          sx={{
            pointerEvents: "all",
          }}
        />
      )}
      <GameMenu
        setGameId={setGameId}
        setIsTutorialOpen={setIsTutorialOpen}
        player={player}
        buttonStyle={{
          pointerEvents: "all",
        }}></GameMenu>
    </Stack>
  );
}
