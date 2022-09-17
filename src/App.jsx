import {
  Box,
  createTheme,
  CssBaseline,
  GlobalStyles,
  ThemeProvider,
} from "@mui/material";
import {initializeApp} from "firebase/app";
import {getAuth, onAuthStateChanged, signInAnonymously} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
import {getFunctions} from "firebase/functions";
import {createContext, useState} from "react";
import {Alerts} from "./Alerts";
import Game from "./Game";
import GameSelector from "./GameSelector";
import {useLocalStorage} from "./useLocalStorage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
signInAnonymously(auth);
export const db = getFirestore(app);
export const functions = getFunctions(app);

let baseTheme = {
  typography: {
    fontFamily: "ubuntu, arial",
  },
  components: {
    // Name of the component ⚛️
    MuiButtonBase: {
      defaultProps: {
        // The props to apply
        disableRipple: true, // No more ripple, on the whole application 💣!
      },
    },
  },
};

let darkTheme = createTheme({
  ...baseTheme,

  palette: {
    mode: "dark",
    background: {
      default: "#010112",
      paper: "#02021D",
    },
    primary: {
      main: "#02021D",
      // dark: "red",
    },
  },
});

let lightTheme = createTheme({
  ...baseTheme,

  palette: {
    mode: "light",
    background: {
      default: "#fff",
      paper: "#f5f5f5",
    },
    primary: {
      main: "#f5f5f5",
    },
  },
});

export const DarkModeContext = createContext();
export const AlertsContext = createContext();

function App() {
  const [gameId, setGameId] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const handleAlert = ({status, message}) => {
    setAlerts((prev) => [{status, message}, ...prev]);
    setIsAlertOpen(true);
  };
  // useWindowSize();
  const handleChooseGame = (gameID) => {
    // document.querySelector("body").requestFullscreen();
    setGameId(gameID);
  };

  const [darkMode, setDarkMode] = useLocalStorage("darkMode", true);
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <AlertsContext.Provider value={[alerts, setAlerts, handleAlert]}>
      <DarkModeContext.Provider value={[darkMode, toggleDarkMode]}>
        <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
          <CssBaseline />
          <GlobalStyles
            styles={{
              body: {WebkitTextStroke: darkMode ? "0.5px #111" : ""},
            }}
          />
          <Box className="App">
            {gameId ? (
              <Game
                gameId={gameId}
                setGameId={setGameId}></Game>
            ) : (
              <GameSelector handleChooseGame={handleChooseGame}></GameSelector>
            )}
            <Alerts
              alerts={alerts}
              isAlertOpen={isAlertOpen}
              setIsAlertOpen={setIsAlertOpen}></Alerts>
          </Box>
        </ThemeProvider>
      </DarkModeContext.Provider>
    </AlertsContext.Provider>
  );
}

export default App;
