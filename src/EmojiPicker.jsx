import React, { useContext, useEffect, useMemo, useState } from "react";
import { Box } from "@mui/system";
// import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
// import { init } from "emoji-mart";
import { DarkModeContext } from "./App";
import { vmin } from "./utils";
import { emojiData } from "./Profile";

function EmojiPicker({ onEmojiSelect, isEmojiPickerOpen, emojiLevel }) {
  const [darkMode] = useContext(DarkModeContext);
  // const emojiLevel = useMemo(() => Math.floor(Math.random() * 5) + 1, []);

  return (
    emojiData &&
    isEmojiPickerOpen && (
      <Picker
        emojiVersion="12.0"
        onEmojiSelect={onEmojiSelect}
        data={emojiData}
        categories={[
          "people",
          "nature",
          "foods",
          "activity",
          "places",
          "objects",
        ].slice(0, emojiLevel)}
        theme={darkMode ? "dark" : "light"}
        searchPosition="none"
        previewPosition="none"
        skinTonePosition="none"
        perLine={Math.min(Math.floor((vmin(80) - 10) / 36), 9)}
      />
    )
  );
}

export default EmojiPicker;
