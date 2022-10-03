import EditOffIcon from "@mui/icons-material/EditOff";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Dialog,
  IconButton,
  Paper,
  Popover,
  Stack,
  Typography,
  Zoom,
} from "@mui/material";
import React, { useContext, useEffect, useRef, useState } from "react";

import EditIcon from "@mui/icons-material/Edit";
import { Timestamp } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { AlertsContext, functions } from "./App";
import ColorPicker from "./ColorPicker";
import EmojiPicker from "./EmojiPicker";
import ProfileNameInput from "./ProfileNameInput";
import { vmin } from "./utils";

//TODO save progress: link account to gmail,etc.
export let emojiData = null;

function Profile({
  player,
  editable = false,
  open,
  onClose,
  onSubmitChanges = () => {},
}) {
  const [pendingChanges, setPendingChanges] = useState({});
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isNameInputOpen, setIsNameInputOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [awaitingDb, setAwaitingDb] = useState(false);
  const [lockedExplainerAnchor, setLockedExplainerAnchor] = useState(null);
  const locked = player.lastEdit && Timestamp.now() - player.lastEdit < 5000;
  const [, , handleAlert] = useContext(AlertsContext);

  const levelBoundaries = [0, 10, 50, 100, 200, 300, 99999999];
  player.points = player.points || 0;
  const emojiLevel = levelBoundaries.findIndex((n) => player.points < n);
  // const emojiLevel = 3;
  // const emojiLevel = Math.floor(Math.random() * 5) + 1;

  useEffect(() => {
    if (!emojiData)
      fetch("https://cdn.jsdelivr.net/npm/@emoji-mart/data")
        .then((response) => response.json())
        .then((data) => (emojiData = data))
        .catch(console.log);
  }, []);

  //stupid autofocus for playername input not working
  const inputRef = useRef();
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [isNameInputOpen]);

  const truncateName = (name) => {
    if (!name) return null;
    const maxLength = editable ? 6 : 8;
    return name.length <= maxLength ? name : name.slice(0, maxLength - 1) + "…";
  };

  const medals = player?.medals || "　";

  const cleanUpState = () => {
    setPendingChanges({});
    setAwaitingDb(false);
  };
  const [closing, setClosing] = useState(false);

  return (
    <Dialog
      open={open && !closing}
      TransitionComponent={Zoom}
      onClose={() => {
        setClosing(true);
        setTimeout(() => {
          setClosing(false);
          cleanUpState();
          onClose();
        }, 200);
      }}
      margin="10vmin"
      PaperProps={{
        elevation: 12,
        sx: {
          maxWidth: "",
          minWidth: "80vmin",
          minHeight: "80vmin",
          borderRadius: "5vmin",
          background: pendingChanges.color || player.color,
          transform: vmin(100) > 600 ? `scale(${600 / vmin(100)})` : "",
          transition: "background 0.3s",
          transitionDelay: "0.2s",
        },
      }}
    >
      <Stack
        sx={{
          alignItems: "center",
          width: "80vmin",
          height: "80vmin",
          // margin: "0 auto",
          overflow: "hidden",
        }}
      >
        <Stack
          direction="row"
          justifyContent="center"
          spacing="0"
          mt="8vmin"
          // margin="auto "
        >
          {editable && !locked && (
            <IconButton
              onClick={() => setIsEmojiPickerOpen(true)}
              size="small"
              sx={{ opacity: "50%" }}
            >
              <EditIcon sx={{ fontSize: "4vmin", color: "black" }} />
            </IconButton>
          )}

          <Paper
            elevation={6}
            sx={{
              fontSize: "8vmin",
              height: "12vmin",
              borderRadius: "12vmin",
              paddingLeft: "1.2vmin",
              paddingRight: "2vmin ",
              background: pendingChanges.color || player.color,
              transition: "background 0.3s",
              transitionDelay: "0.2s",
            }}
          >
            <span
              style={{ cursor: "pointer" }}
              onClick={() => editable && !locked && setIsEmojiPickerOpen(true)}
            >
              <span>{pendingChanges.icon || player.icon}</span>
            </span>
            <Box
              component="span"
              sx={{ cursor: "pointer" }}
              onClick={() => editable && !locked && setIsNameInputOpen(true)}
            >
              {truncateName(pendingChanges.playerName || player.playerName)}
            </Box>
          </Paper>

          {editable && !locked && (
            <IconButton
              onClick={() => {
                setIsNameInputOpen(true);
              }}
              size="small"
              sx={{ opacity: "50%" }}
            >
              <EditIcon sx={{ fontSize: "4vmin", color: "black" }} />
            </IconButton>
          )}
        </Stack>

        <Box fontSize="8vmin" height="8vmin" lineHeight="1" my="2vmin">
          {medals.length <= 20 ? (
            <Box
              letterSpacing={-medals.length / 4 + "vmin"}
              ml={-medals.length / 4 + "vmin"}
            >
              {medals}
            </Box>
          ) : (
            <Box>{medals.slice(0, 2) + "x" + medals.length / 2}</Box>
          )}
        </Box>

        <Stack gap="3vmin" height="100%">
          {[
            ["Points", player.points || 0],
            ["Longest Word", player.longestWord || "　"],
          ].map(([label, value]) => (
            <Stack
              key={label}
              sx={{
                border: "1px solid #0003",
                width: "64vmin",
                height: "100%",
                textAlign: "center",
                // justifyContent: "space-between",
                borderRadius: "4vmin",
                lineHeight: "1",
              }}
            >
              <Box fontSize="3.5vmin" fontStyle="italic" m="1vmin" mb="-1vmin">
                {label}
              </Box>
              <Stack fontSize="9vmin" flexGrow={1} justifyContent="center">
                {value}
              </Stack>
            </Stack>
          ))}
        </Stack>
        <Stack
          direction="row"
          justifyContent="space-between"
          width="100%"
          height="8vmin"
        >
          {editable && !locked && (
            <IconButton
              onClick={() => setIsColorPickerOpen(true)}
              size="small"
              sx={{ opacity: "50%" }}
            >
              <EditIcon
                sx={{ fontSize: "4vmin", color: "black", m: "0.5vmin" }}
              />
            </IconButton>
          )}

          {editable && locked && (
            <IconButton
              onClick={(e) => setLockedExplainerAnchor(e.currentTarget)}
              size="small"
              sx={{ opacity: "50%" }}
            >
              <EditOffIcon
                sx={{ fontSize: "4vmin", color: "black", m: "0.5vmin" }}
              />
            </IconButton>
          )}

          {Object.keys(pendingChanges).length > 0 ? (
            <LoadingButton
              onClick={() => {
                submitChanges();
              }}
              loading={awaitingDb}
              sx={{
                // bgcolor: colord(pendingChanges.color || player.color)
                //   .darken(0.2)
                //   .toHex(),
                // ":hover": {
                //   bgcolor: colord(pendingChanges.color || player.color)
                //     .darken(0.3)
                //     .toHex(),
                // },
                color: "white",
                bgcolor: "#0004",
                ":hover": {
                  bgcolor: "#0005",
                },
                fontSize: "4vmin",
                // p: 0,
                m: "0.75vmin",
                borderRadius: "100vw",
                WebkitTextStroke: "0px",
              }}
              variant="contained"
              size="small"
            >
              Save Changes
            </LoadingButton>
          ) : null}
          {/* Invisible button for spacing  purposes. Might be a fun easter egg*/}
          <IconButton size="small" sx={{ opacity: "0%" }}>
            <EditIcon sx={{ fontSize: "4vmin", m: "0.5vmin" }} />
          </IconButton>
        </Stack>
      </Stack>
      <Dialog
        open={isEmojiPickerOpen}
        onClose={() => setIsEmojiPickerOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            background: "transparent",
            // width: "80vmin",
            // maxWidth: "100vw",
            // width: "100%",
            // height: "80vmin",
          },
        }}
      >
        <EmojiPicker
          isEmojiPickerOpen={isEmojiPickerOpen}
          emojiLevel={emojiLevel}
          onEmojiSelect={(selectedEmoji) => {
            addToPendingChanges({ icon: selectedEmoji.native });
            setIsEmojiPickerOpen(false);
          }}
        />
      </Dialog>
      <Dialog
        open={isNameInputOpen}
        onClose={() => setIsNameInputOpen(false)}
        PaperProps={{ sx: { borderRadius: "8px" } }}
      >
        <ProfileNameInput
          inputRef={inputRef}
          defaultValue={pendingChanges.playerName || player.playerName}
          onNameSubmit={(name) => {
            addToPendingChanges({ playerName: name });
            setIsNameInputOpen(false);
          }}
        />
      </Dialog>
      <ColorPicker
        open={isColorPickerOpen}
        onClose={() => setIsColorPickerOpen(false)}
        onColorPicked={(color) => {
          addToPendingChanges({ color: color });
          setIsColorPickerOpen(false);
        }}
      />
      <Popover
        open={!!lockedExplainerAnchor}
        anchorEl={lockedExplainerAnchor}
        onClose={() => setLockedExplainerAnchor(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        PaperProps={{
          sx: {
            p: 1,
            mt: ".5rem",
            borderRadius: ".5rem",
          },
        }}
      >
        <Typography variant="body1">
          Editing is currently locked
          <br />
          Please try again later
        </Typography>
      </Popover>
    </Dialog>
  );

  function addToPendingChanges(field) {
    const key = Object.keys(field)[0];
    if (field[key] === player[key]) delete pendingChanges[key];
    else if (field[key] === pendingChanges[key]) return;
    else
      setPendingChanges((changesPending) => ({
        ...changesPending,
        ...field,
      }));
  }

  function submitChanges() {
    setAwaitingDb(true);
    const editProfile = httpsCallable(functions, "editProfile");
    editProfile({ pendingChanges })
      .then((res) => {
        cleanUpState();
        if (res.data.status === "error") handleAlert(res.data);
        else handleAlert({ status: "info", message: "Looking fresh 😏" });
        onSubmitChanges();
      })
      .catch(console.log);
  }
}

export default Profile;
