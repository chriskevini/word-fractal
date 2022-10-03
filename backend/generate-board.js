import { readFileSync, writeFileSync } from "fs";

//TODO overrideWordList() which changes WordsEN

const data = readFileSync("./backend/organized-en-words.json", "utf-8");
const WordsEN = JSON.parse(data);

const data2 = readFileSync("./backend/organized-jp-words.json", "utf-8");
const WordsJP = JSON.parse(data2);

//TODO overrideLenghtWeights
//weights should add up to 1.000
const LetterWeights = {
  e: 0.097,
  a: 0.092,
  s: 0.085,
  o: 0.079,
  l: 0.06,
  t: 0.057,
  r: 0.056,
  i: 0.052,
  n: 0.044,
  u: 0.04,
  d: 0.039,
  p: 0.039,
  m: 0.035,
  c: 0.03,
  b: 0.03,
  g: 0.028,
  h: 0.027,
  k: 0.025,
  f: 0.023,
  w: 0.019,
  y: 0.018,
  v: 0.01,
  j: 0.006,
  z: 0.004,
  x: 0.004,
  q: 0.001,
};

const LengthWeights = {
  3: 0.04,
  4: 0.22,
  5: 0.24,
  6: 0.24,
  7: 0.12,
  8: 0.08,
  9: 0.04,
  10: 0.02,
};

//TODO useDictionary(language):
// changes wordlist and weights depending on language
// should call in other file

const randomWeighted = (weights, fallback) => {
  const target = Math.random();
  let sum = 0;
  for (let item in weights) {
    sum += weights[item];
    if (sum >= target) return item;
  }
  return fallback;
};

//Refactor as init and then save as state in react component
const initBoard = (boardSize) =>
  Array(boardSize)
    .fill(null)
    .map(
      () => Array(boardSize).fill(null)
      // .map(() => null)
    );

const printBoard = (board) =>
  board.map((r) => {
    console.log(r.map((e) => (e ? e.toUpperCase() : ".")).join(""));
  });

// get tile from board, return null if out of bounds
const getTile = (board, [x, y]) => {
  if (x < 0 || x >= board.length || y < 0 || y >= board.length) return null;
  return board[y][x];
};

const isEnglish = (letter) =>
  "abcdefghijklmnopqrstuvwxyz".includes(letter.toLowerCase());

//insane speed boost by grouping the words by length before searching
//old method just randomly picked from the huge list until exhausted
const getRandomWord = (startsWith, length) => {
  let dummyWords = isEnglish(startsWith)
    ? WordsEN[length].slice(0)
    : WordsJP[length].slice(0);

  const isValid = (word) => startsWith === word[0] && length === word.length;
  let word;
  do {
    const i = Math.floor(Math.random() * dummyWords.length);
    word = dummyWords[i];
    dummyWords.splice(i, 1);
    if (dummyWords.length === 0) return null;
  } while (!isValid(word));
  return word;
};

const shuffle = (arr) => {
  const shuffled = [];
  const length = arr.length;
  for (let i = 0; i < length; i++) {
    const rand = Math.floor(Math.random() * arr.length);
    shuffled.push(arr[rand]);
    arr.splice(rand, 1);
  }

  return shuffled;
};

//get four adjacent tiles except any that are in array tail
const getNeighbors = ([x, y], boardSize, tail = []) => {
  const neighs = [
    y === 0 ? null : [x, y - 1], //up
    y === boardSize - 1 ? null : [x, y + 1], //down
    x === 0 ? null : [x - 1, y], //left
    x === boardSize - 1 ? null : [x + 1, y], //right
  ].filter((e) => e && !isCoordInList(e, tail));

  return neighs;
};

const isCoordInList = (targetCoord, list) => {
  for (const coord of list) {
    if (coord[0] === targetCoord[0] && coord[1] === targetCoord[1]) return true;
  }
  return false;
};

//returns path that can fit word if found
const insertRestOfWord = (board, letters, todo, solution) => {
  if (letters.length == 0) return solution;
  if (todo.length == 0) return null;

  for (const tile of todo) {
    const [x, y] = tile;
    //could also do :
    // if (board[y][x]) continue;
    // to disallow crossing words
    if (board[y][x] && board[y][x] !== letters[0]) continue;
    else board[y][x] = letters[0];

    const neighbors = shuffle(getNeighbors([x, y], board.length, solution));
    const result = insertRestOfWord(board, letters.slice(1), neighbors, [
      ...solution,
      [x, y],
    ]);

    // break out of recursion
    if (result) return result;
  }

  return null;
};

// mutates board and returns coords of the end of the word
const insertWord = (board, word, [x, y]) => {
  //check that letter at x,y is the same as start of word
  if (word && getTile(board, [x, y]) === word[0]) {
    //dummy so original board isn't obliterated
    const dummyBoard = board.map((r) => r.slice(0));
    const restOfWord = word.slice(1).split("");
    const shuffledNeighbors = shuffle(getNeighbors([x, y], board.length));
    //try to insert the rest of the word recursively
    const solution = insertRestOfWord(
      dummyBoard,
      restOfWord,
      shuffledNeighbors,
      [[x, y]]
    );
    if (solution) {
      //apply solution to board
      solution.map(([x, y], i) => (board[y][x] = word[i]));
      return solution[solution.length - 1];
    }
  }

  return null;
};

//returns number of blanks filled
const fillBlanks = (board, letter) => {
  let count = 0;
  for (let x = 0; x < board.length; x++) {
    for (let y = 0; y < board.length; y++) {
      if (!board[y][x]) {
        count++;
        board[y][x] = letter;
        //TODO change back to letter
      }
    }
  }

  return count;
};

// todo is an array of groups of letters and nodes e.g. ["a",[5,5]]
const pack = (board, todo) => {
  const originLetter = todo[0][0];
  const insertedInfo = {
    wordsInserted: 0,
    blanksFilled: 0,
    nodesAtBottomEdge: 0,
    log: "",
    lengths: {},
    firstLetter: {},
    lastLetter: {},
  };
  while (todo.length > 0) {
    const [letter, node] = todo.splice(0, 1)[0]; //shift?
    let length = randomWeighted(LengthWeights);
    // try to insert smaller and smaller words
    for (length; length >= 3; length--) {
      const word = getRandomWord(letter, length);
      //didn't find a word with that length so skip to shorter length
      if (word === null) continue;
      const newNode = insertWord(board, word, node);
      const inserted = !!newNode;
      if (inserted) {
        const newLine = `${word}\t${node}\t${newNode}\n`;
        const previousLine = insertedInfo.log.slice(
          insertedInfo.log.length - newLine.length
        );
        // if same as previous insert then skip to next item in todo
        if (newLine === previousLine) continue;
        // generate info about inserted word
        insertedInfo.log += newLine;
        insertedInfo.wordsInserted++;

        const [x, y] = newNode;
        if (
          // x === 0 ||
          // x === board.length - 1 ||
          // y === 0 ||
          y ===
          board.length - 1
        )
          insertedInfo.nodesAtBottomEdge++;

        if (insertedInfo.lengths[length]) insertedInfo.lengths[length]++;
        else insertedInfo.lengths[length] = 1;

        if (insertedInfo.firstLetter[word[0]])
          insertedInfo.firstLetter[word[0]]++;
        else insertedInfo.firstLetter[word[0]] = 1;

        const lastLetter = word[word.length - 1];
        if (insertedInfo.lastLetter[lastLetter])
          insertedInfo.lastLetter[lastLetter]++;
        else insertedInfo.lastLetter[lastLetter] = 1;

        // add three tentacles to the word we just inserted
        if (y != board.length - 1)
          //no new todos if node is at finish line
          todo = [...todo, ...Array(4).fill([lastLetter, newNode])];
        // stop checking smaller words for this todo item
        break;
      }
    }
  }
  insertedInfo.blanksFilled = fillBlanks(board, originLetter);

  const { log, ...info } = insertedInfo;
  return { words: log, info: info };
};

export { initBoard, printBoard, pack };
