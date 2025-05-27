// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBeWW8s26a2i_TAKjTxO6bEvqTAkbesa8I",
  authDomain: "anton-stansgard-js.firebaseapp.com",
  databaseURL: "https://anton-stansgard-js-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "anton-stansgard-js",
  storageBucket: "anton-stansgard-js.firebasestorage.app",
  messagingSenderId: "232450883279",
  appId: "1:232450883279:web:3be66ac2d101d70f5d41ba"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };