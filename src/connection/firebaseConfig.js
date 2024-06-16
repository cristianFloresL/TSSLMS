import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCTcw-LCjieEWpV2Rw2-xyD15l7hR6qbVY",
  authDomain: "tms-f9a2c.firebaseapp.com",
  projectId: "tms-f9a2c",
  storageBucket: "tms-f9a2c.appspot.com",
  messagingSenderId: "1013559615097",
  appId: "1:1013559615097:web:e68497ac932b82957e3ea8",
  measurementId: "G-455FFSVVM4"
};

// Inicializa Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); // if already initialized, use that one
}

// Exporta las instancias de Firebase que necesites
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

export default app;