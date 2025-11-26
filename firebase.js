// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { browserLocalPersistence, setPersistence } from "firebase/auth";



// ✅ JOUW Firebase config (met correcte storage bucket)
const firebaseConfig = {
  apiKey:,
  authDomain: "whatsapp-lite-app.firebaseapp.com",
  projectId: "whatsapp-lite-app",
  storageBucket: "whatsapp-lite-app.appspot.com",
  messagingSenderId: "904691731392",
  appId: "1:904691731392:web:d38d4d1a1254e4f7f19625",
  measurementId: "G-DYC4N5E7TQ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ⬇️ Wanneer user inlogt, updaten we online status
export const attachAuthListener = () => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split("@")[0],
          online: true,
          lastSeen: serverTimestamp(),
        },
        { merge: true }
      );
    }
  });
};

setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Firebase auth persistence enabled.");
  })
  .catch((error) => {
    console.log("Persistence error:", error);
  });

// ⬇️ Bij uitloggen → markeer user offline
export const setUserOffline = async (user) => {
  if (!user) return;
  const userRef = doc(db, "users", user.uid);
  await setDoc(
    userRef,
    {
      online: false,
      lastSeen: serverTimestamp(),
    },
    { merge: true }
  );
};
