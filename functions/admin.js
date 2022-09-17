// The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
const functions = require("firebase-functions");

// const firebaseConfig = {
//   apiKey: "AIzaSyAdxXQbK4geJhOtrY1qIN_L3H0CnPf2qUo",
//   authDomain: "test-43d5b.firebaseapp.com",
//   projectId: "test-43d5b",
//   storageBucket: "test-43d5b.appspot.com",
//   messagingSenderId: "315631544796",
//   appId: "1:315631544796:web:b9023e25c2c560f3df4719",
// };

// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");
const app = admin.initializeApp();
const db = admin.firestore(app);

module.exports = {
  functions,
  admin,
  app,
  db,
};
