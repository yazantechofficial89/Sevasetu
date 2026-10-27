// Node.js Server-Side Firebase Module
const { initializeApp } = require('firebase/app');

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyBicVo4Ojv2U8_QSUYoqZT50PrEl0-Vujw",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "sevasetu-c2576.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "sevasetu-c2576",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "sevasetu-c2576.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "862872947575",
  appId: process.env.FIREBASE_APP_ID || "1:862872947575:web:b776af76db87aaebfdef72",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-E8GNMDCZRB"
};

let firebaseApp;
try {
  firebaseApp = initializeApp(firebaseConfig);
  console.log("🔥 Node.js Firebase App initialized (Project: sevasetu-c2576)");
} catch (err) {
  console.warn("Node.js Firebase init notice:", err.message);
}

module.exports = { firebaseApp, firebaseConfig };
