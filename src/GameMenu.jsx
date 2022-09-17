import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import HelpIcon from "@mui/icons-material/Help";
import MenuIcon from "@mui/icons-material/Menu";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import PersonIcon from "@mui/icons-material/Person";
import BugReportIcon from "@mui/icons-material/BugReport";
import {
  Box,
  Button,
  DialogContent,
  Fab,
  ListItemIcon,
  Menu,
  MenuItem,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import React, {useContext, useState} from "react";
import {DarkModeContext} from "./App";
import Profile from "./Profile";
import Tutorial from "./Tutorial";
import {toggleFullscreen} from "./utils";
import Leaderboard from "./Leaderboard";

function GameMenu({setGameId, player, buttonStyle = {}, setIsTutorialOpen}) {
  const [darkMode, toggleDarkMode] = useContext(DarkModeContext);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  return (
    <>
      <Button
        onClick={handleClick}
        sx={{
          bgcolor: "background.paper",
          ":hover": {
            bgcolor: "background.paper",
            boxShadow: 6,
          },
          boxShadow: 3,
          color: player.color,
          width: "min(16vw,4rem)",
          height: "min(16vw,4rem)",
          minWidth: "",
          ...buttonStyle,
        }}>
        <MenuIcon />
      </Button>
      <Menu
        keepMounted
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        // transitionDuration={300}
        // TransitionProps={{
        //   transitionDelay: "2s",
        // }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}>
        <MenuItem
          onClick={(e) => {
            setIsTutorialOpen(true);
          }}>
          <ListItemIcon>
            <HelpIcon />
          </ListItemIcon>
          How To Play
        </MenuItem>
        <MenuItem onClick={() => setIsProfileModalOpen(true)}>
          <ListItemIcon>
            <PersonIcon />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={() => setIsLeaderboardOpen(true)}>
          <ListItemIcon>
            <EmojiEventsIcon />
          </ListItemIcon>
          Leaderboard
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <BugReportIcon />
          </ListItemIcon>
          <Box
            component="a"
            href="mailto:wordfractal@gmail.com?subject=Bug Report"
            sx={{
              color: "text.primary",
              textDecoration: "none",
            }}>
            Report A Bug
          </Box>
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            toggleDarkMode();
            e.stopPropagation();
          }}>
          <ListItemIcon>
            <Brightness4Icon />
          </ListItemIcon>
          Toggle Dark Mode
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            toggleFullscreen();
            // e.stopPropagation();
          }}>
          <ListItemIcon>
            <FullscreenIcon />
          </ListItemIcon>
          Toggle Full Screen
        </MenuItem>
        <MenuItem onClick={() => setGameId("")}>
          <ListItemIcon>
            <ArrowBackIosNewIcon />
          </ListItemIcon>
          Leave Game
        </MenuItem>
        {/* <MenuItem
          onClick={() =>
            fireworks({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
          }>
          <ListItemIcon>
            <ArrowBackIosNewIcon />
          </ListItemIcon>
          Fireowrkds
        </MenuItem> */}
      </Menu>

      <Profile
        player={player}
        editable={true}
        open={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSubmitChanges={() => {
          setIsProfileModalOpen(false);
        }}></Profile>

      <Leaderboard
        open={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />
    </>
  );
}
export default GameMenu;
