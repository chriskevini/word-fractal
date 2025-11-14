# WordFractal

A multiplayer word game where players collaboratively build chains of words and fill up an expansive grid of letters. Form words by selecting adjacent letters, and race to be the first to reach the finish line!

## Game Concept

WordFractal is a unique word puzzle game that combines elements of word-building with a fractal-like board structure. Players:

- Select adjacent letters on a grid to form valid words
- Start from randomly generated "node" positions
- Build chains of words that connect to create paths
- Compete to reach the bottom edge of the board first
- Earn points based on word length and unlock achievements

The game supports both English and Japanese (Hiragana/Katakana) dictionaries.

## Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Material-UI (MUI)** - Component library and styling
- **react-window** - Virtualized grid rendering for performance
- **Firebase SDK** - Authentication, Firestore, and Functions
- **react-firebase-hooks** - React hooks for Firebase
- **pako** - Compression library for efficient data transfer
- **emoji-mart** - Emoji picker component

### Backend
- **Firebase Functions** - Serverless cloud functions
- **Firebase Firestore** - Real-time NoSQL database
- **Firebase Authentication** - Anonymous user authentication
- **Node.js** - Runtime environment
- **node-fetch** - HTTP requests for dictionary validation
- **cheerio** - HTML parsing for dictionary data

### Dictionary APIs
- **ei-navi.jp** - English word validation and definitions
- **jotoba.de** - Japanese word validation and definitions

## Project Structure

```
word-fractal/
├── backend/                    # Board generation scripts
│   ├── generate-board.js       # Algorithm for creating game boards
│   ├── create-and-add-game-to-db.js  # Game initialization
│   ├── organized-en-words.json # English word dictionary
│   └── organized-jp-words.json # Japanese word dictionary
├── functions/                  # Firebase Cloud Functions
│   ├── index.js               # Function exports
│   ├── checkPlayedWord.js     # Word validation logic
│   ├── editProfile.js         # Player profile updates
│   ├── getImage.js           # Image fetching utility
│   └── admin.js              # Firebase Admin SDK setup
├── public/                    # Static assets
│   └── assets/               # Background images
├── src/                      # React frontend
│   ├── App.jsx              # Main app component
│   ├── Game.jsx             # Core game logic and state
│   ├── Board.jsx            # Virtualized game board
│   ├── GameSelector.jsx     # Game lobby/selection
│   ├── WordSubmissionDialog.jsx  # Word submission UI
│   ├── DictionaryView.jsx   # Word definitions display
│   ├── Profile.jsx          # Player profile management
│   ├── Leaderboard.jsx      # Rankings (under construction)
│   ├── Minimap.jsx          # Board overview
│   ├── ColorPicker.jsx      # Player color selection
│   ├── EmojiPicker.jsx      # Player icon selection
│   ├── Tutorial.jsx         # Game instructions
│   └── utils.jsx            # Utility functions
└── index.html               # Entry HTML file
```

## Key Features

### Real-time Multiplayer
- Anonymous authentication for instant play
- Live cursor positions showing other players' selections
- Real-time board updates as words are played
- Collaborative word chains that build on each other

### Word Validation
- Dictionary validation via external APIs
- Support for English and Japanese words
- Stores word metadata (definitions, pronunciations, example sentences)
- Smart handling of Japanese character variants (Hiragana/Katakana)

### Performance Optimizations
- Virtualized grid rendering handles large boards efficiently
- Data compression using pako for Firestore storage
- Stale cursor filtering to reduce unnecessary re-renders
- Memoized style generation for board cells

### Game Mechanics
- Dynamic board generation with weighted letter distribution
- Nodes system for valid starting positions
- Word chaining creates paths across the board
- Point system based on word length
- Medals awarded to game winners
- Progressive icon unlocks based on points

### UI/UX Features
- Dark/light theme toggle
- Responsive design with mobile support
- Animated backgrounds
- Color-coded player indicators
- Minimap for board navigation
- Tutorial for new players
- Profile customization (name, icon, color)

## Setup and Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase account and project

### Environment Variables

Create `.env.development` and `.env.production` files:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Installation

```bash
# Install frontend dependencies
npm install

# Install Firebase Functions dependencies
cd functions
npm install
cd ..
```

### Development

```bash
# Run development server
npm run dev

# Run on network (for testing on mobile devices)
npm run dev -- --host
```

### Building

```bash
# Build for development
npm run build-dev

# Build for production
npm run build-prod
```

### Deployment

```bash
# Deploy hosting (development)
npm run deploy-dev

# Deploy hosting (production)
npm run deploy-prod

# Deploy functions (development)
npm run functions-dev

# Deploy functions (production)
npm run functions-prod

# Build and deploy together
npm run bd-dev    # Development
npm run bd-prod   # Production
```

## Firebase Configuration

### Firestore Collections

- **games** - Active game state
  - board (string) - Letters in space-separated format
  - nodes (string) - Valid starting positions
  - playedWordsDeflated (bytes) - Compressed played words array
  - state (string) - "live" or "dead"
  - winner (object) - Winner information if game is complete
  - winningChain (string) - Coordinates of winning path

- **gameStates** - Game metadata for lobby
  - state, icon, name, createdAt

- **players** - Player profiles
  - playerName, icon, color, points, medals, longestWord

- **games/{gameId}/cursors** - Real-time cursor positions
  - coords, letter, color, playerName, icon, createdBy, state, createdAt

### Firebase Functions

- `checkPlayedWord` - Validates and processes word submissions
- `editProfile` - Updates player profile information
- `getImage` - Fetches external images (if needed)

### Security Rules

Ensure proper Firestore security rules are configured to:
- Allow authenticated users to read games and players
- Restrict writes to authorized operations
- Protect cursor updates from unauthorized access

## Game Board Generation

The board generation algorithm (`backend/generate-board.js`) uses:

- Weighted letter distribution based on language frequency
- Recursive word insertion with backtracking
- Word length probability distribution
- Neighbor-based chain building
- Automatic blank filling
