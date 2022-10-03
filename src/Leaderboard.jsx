import { Container, Dialog } from "@mui/material";
import React from "react";

function LeaderboardCard({ player }) {
  return <div></div>;
}

function Leaderboard({ open, onClose }) {
  //query players order by points descending
  return (
    <Dialog open={open} onClose={onClose}>
      <Container sx={{ textAlign: "center", p: "40px", pt: "20px" }}>
        <h2>🏆</h2>
        <div>🚧 Under Construction 🚧</div>
      </Container>
    </Dialog>
  );
}

export default Leaderboard;
