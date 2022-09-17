import { Alert, Slide, Snackbar } from "@mui/material";

export function Alerts(props) {
  return (
    <Snackbar
      open={props.isAlertOpen}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      autoHideDuration={6000}
      TransitionComponent={SlideFromRight}
      sx={{
        // transform: "translate(0, 5vh)",
        borderRadius: 1,
        filter: "drop-shadow(2px 4px 4px #0008)", // transition: "box-shadow 0.25s",
        // alignItems: "center",
      }}
      onClose={(e, r) => {
        if (r != "clickaway") props.setIsAlertOpen(false);
      }}>
      <Alert
        onClose={() => props.setIsAlertOpen(false)}
        severity={props.alerts[0]?.status}
        variant="filled"
        sx={{ WebkitTextStroke: "0", whiteSpace: "pre-wrap" }}>
        {props.alerts[0]?.message}
      </Alert>
    </Snackbar>
  );
}
function SlideFromRight(props) {
  return (
    <Slide
      {...props}
      direction="left"
    />
  );
}
