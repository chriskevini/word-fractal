import {loadEnv} from "vite";
import commandLineArgs from "command-line-args";

import {initBoard, printBoard, pack} from "./generate-board.js";
import {writeFileSync} from "fs";
import {initializeApp} from "firebase/app";
import {getFirestore} from "firebase/firestore";
import {serverTimestamp, writeBatch, collection, doc} from "firebase/firestore";

import path from "path";
import {fileURLToPath} from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const optionDefinitions = [
  {name: "name", alias: "n", type: String},
  {name: "icon", alias: "i", type: String},
  {name: "size", alias: "s", type: Number},
  {name: "origin", alias: "o", type: String},
  {name: "mode", alias: "m", type: String},
  {name: "dontcommit", alias: "d", type: Boolean},
  {name: "print", alias: "p", type: Boolean},
];

const options = commandLineArgs(optionDefinitions);

if (!["production", "development"].includes(options.mode)) {
  console.log("Invalid argument: mode");
  process.exit(1);
}

process.env = loadEnv(options.mode, "./", "");

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// qxyz are banned
const AlphabetEN = "abcdefghijklmnoprstuvw";
// るぬんを are banned
const AlphabetJP =
  "あいうえおかきくけこさしすせそたちつてとなにねのはひふへほまみむめもやゆよらりれろわ";

options.origin = options.origin.toLowerCase();

if (options.origin === "en") {
  options.origin = AlphabetEN[Math.floor(Math.random() * AlphabetEN.length)];
} else if (options.origin === "jp") {
  options.origin = AlphabetJP[Math.floor(Math.random() * AlphabetJP.length)];
}

options.origin = options.origin[0];

const isValidLetter =
  AlphabetEN.includes(options.origin) || AlphabetJP.includes(options.origin);

if (!isValidLetter) {
  console.log("Invalid argument: origin");
  process.exit();
}

if (!options.size) {
  console.log("Invalid argument: size");
  process.exit();
}

const boardCenter = Math.floor(options.size / 2);
let myBoard = initBoard(options.size);

myBoard[0][boardCenter] = options.origin;

const todo = [...Array(10).fill([options.origin, [boardCenter, 0]])];

console.time("Packed board in");
const {words, info} = pack(myBoard, todo);
console.timeEnd("Packed board in");
if (options.print) printBoard(myBoard);

if (!options.icon || options.icon.length > 2) {
  console.log("Invalid argument: icon");
  process.exit();
}

writeFileSync(path.join(__dirname, `./logs/${options.icon}-words.tsv`), words);

writeFileSync(
  path.join(__dirname, `./logs/${options.icon}-info.json`),
  JSON.stringify(info, null, 2)
);

const boardString = myBoard.map((e) => e.join("")).join(" ");
writeFileSync(
  path.join(__dirname, `./logs/${options.icon}-board.txt`),
  boardString
);

if (options.dontcommit) process.exit();

const batch = writeBatch(db);

const newGameRef = doc(collection(db, "games"));
const newGameID = newGameRef.id;
batch.set(newGameRef, {
  id: newGameID,
  name: options.name || "",
  icon: options.icon || "",
  state: "live",
  createdAt: serverTimestamp(),
  board: boardString,
  nodes: `${boardCenter},0`,
});

const newGameStateRef = doc(db, "gameStates", newGameID);
batch.set(newGameStateRef, {
  id: newGameID,
  name: options.name || "",
  icon: options.icon || "",
  state: "live",
  createdAt: serverTimestamp(),
});

batch
  .commit()
  .then(() => console.log("Added game to DB"))
  .catch((e) => console.log(e));
