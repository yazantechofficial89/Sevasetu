/**
 * SevaSetu Firebase Integration
 * Project: sevasetu-c2576
 * Analytics, Telemetry, Cloud Services, Phone SMS OTP & Google Sign-In
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyBicVo4Ojv2U8_QSUYoqZT50PrEl0-Vujw",
  authDomain: "sevasetu-c2576.firebaseapp.com",
  projectId: "sevasetu-c2576",
  storageBucket: "sevasetu-c2576.firebasestorage.app",
  messagingSenderId: "862872947575",
  appId: "1:862872947575:web:b776af76db87aaebfdef72",
  measurementId: "G-E8GNMDCZRB"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Initialize Analytics (supported in browser environments)
export let analytics = null;
try {
  analytics = getAnalytics(app);
  console.log("🔥 Firebase Initialized successfully (Project: sevasetu-c2576)");
} catch (e) {
  console.warn("Firebase Analytics notice:", e.message);
}

// Global helper to log custom events across SevaSetu
window.logFirebaseEvent = function(eventName, eventParams = {}) {
  if (analytics) {
    try {
      logEvent(analytics, eventName, eventParams);
      console.log(`📊 Firebase Event Logged: ${eventName}`, eventParams);
    } catch (err) {
      console.warn("Event logging error:", err);
    }
  }
};

// ==========================================
// 🌐 GOOGLE SIGN-IN HANDLER
// ==========================================
window.signInWithGoogle = async function() {
  try {
    console.log("🌐 Triggering Firebase Google Sign-In Popup...");
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    console.log("✅ Google Sign-In successful for:", user.displayName, user.email);
    return {
      success: true,
      user: {
        uid: user.uid,
        name: user.displayName || "Google User",
        email: user.email,
        photoURL: user.photoURL || ""
      }
    };
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
};

// ==========================================
// 📱 REAL MOBILE SMS OTP HELPERS (Firebase Auth)
// ==========================================
window.confirmationResult = null;
window.recaptchaVerifier = null;

/**
 * Initialize invisible or normal reCAPTCHA verifier
 */
window.initRecaptcha = function(containerId = "recaptcha-container") {
  try {
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement("div");
      container.id = containerId;
      document.body.appendChild(container);
    }

    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: "invisible",
        callback: () => {
          console.log("🛡️ reCAPTCHA verified successfully for SMS OTP.");
        },
        "expired-callback": () => {
          console.warn("⚠️ reCAPTCHA expired, resetting...");
          if (window.recaptchaVerifier) {
            try { window.recaptchaVerifier.clear(); } catch (_) {}
            window.recaptchaVerifier = null;
          }
        }
      });
      window.recaptchaVerifier.render();
    }
    return window.recaptchaVerifier;
  } catch (err) {
    console.error("Recaptcha Init Error:", err);
    throw err;
  }
};

/**
 * Send real 6-digit SMS OTP to any mobile phone
 * @param {string} phoneNumber 10-digit number or with country code (+91...)
 * @param {string} containerId DOM ID for reCAPTCHA widget
 */
window.sendMobileOtp = async function(phoneNumber, containerId = "recaptcha-container") {
  let cleaned = (phoneNumber || "").toString().replace(/[^0-9+]/g, "").trim();
  if (!cleaned.startsWith("+")) {
    if (cleaned.length === 10) {
      cleaned = "+91" + cleaned;
    } else if (cleaned.length === 12 && cleaned.startsWith("91")) {
      cleaned = "+" + cleaned;
    } else {
      throw new Error("Please enter a valid 10-digit mobile number.");
    }
  }

  const verifier = window.initRecaptcha(containerId);
  console.log(`📲 Dispatching real SMS OTP to ${cleaned}...`);
  const confirmationResult = await signInWithPhoneNumber(auth, cleaned, verifier);
  window.confirmationResult = confirmationResult;
  console.log("✅ SMS OTP dispatched successfully by Firebase!");
  return { success: true, formattedPhone: cleaned, confirmationResult };
};

/**
 * Verify the 6-digit SMS OTP received on phone
 * @param {string} otpCode 6-digit OTP string
 */
window.verifyMobileOtp = async function(otpCode) {
  if (!window.confirmationResult) {
    throw new Error("No active OTP request found. Please click 'Send OTP' first.");
  }
  const cleanOtp = (otpCode || "").toString().trim();
  if (cleanOtp.length !== 6) {
    throw new Error("Please enter all 6 digits of the SMS OTP.");
  }

  console.log("🔐 Verifying Mobile SMS OTP with Firebase...");
  const userCredential = await window.confirmationResult.confirm(cleanOtp);
  console.log("🎉 Mobile OTP Verified successfully for user:", userCredential.user.phoneNumber);
  return { success: true, user: userCredential.user };
};

// Expose globally for convenience
window.firebaseApp = app;
window.firebaseAuth = auth;
window.googleProvider = googleProvider;
window.firebaseAnalytics = analytics;
window.firebaseConfig = firebaseConfig;
