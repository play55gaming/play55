// firebase.js - FINAL ALL CLEAR VERSION
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment, arrayUnion, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCgdsWp2ickEEUCxQtwORZrvSQT_v6Uqds",
  authDomain: "play55-fea54.firebaseapp.com",
  projectId: "play55-fea54",
  storageBucket: "play55-fea54.firebasestorage.app",
  messagingSenderId: "462267275634",
  appId: "1:462267275634:web:3f86b340d1c45464eda5eb"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const ADMIN_EMAIL = "aviatorgame128@gmail.com";

// --- CLIENT SYSTEM (Username wala) ---
// Naya client ID banao - kisi bhi device pe same rahega
export async function createClientUser({mobile, username, password, coins, ref}) {
  const userId = username.toLowerCase();
  const userRef = doc(db, "clients", userId);
  const snap = await getDoc(userRef);
  if(snap.exists()) throw new Error("Username already exists");

  const now = new Date();
  const historyEntry = {
    type: "OPEN",
    amount: coins,
    reason: "ID Created",
    ref: ref || "OPEN-"+Date.now(),
    time: now.toLocaleString("en-IN"),
    iso: now.toISOString(),
    date: now.toLocaleDateString("en-IN")
  };

  await setDoc(userRef, {
    mobile, username: userId, displayName: username,
    password, // Note: production me hash karna chahiye
    coins: Number(coins) || 0,
    history: [historyEntry],
    isSuspended: false,
    createdAt: now.toISOString(),
    createdBy: ADMIN_EMAIL
  });
  return userId;
}

// Coin Add/Cut with Date + Ref Record
export async function addCoinsToClient(username, amount, reason, refNo){
  const userRef = doc(db, "clients", username.toLowerCase());
  const now = new Date();
  await updateDoc(userRef, {
    coins: increment(Number(amount)),
    history: arrayUnion({
      type: Number(amount) > 0? "ADD" : "CUT",
      amount: Number(amount),
      reason: reason || "Admin Update",
      ref: refNo || "TXN-"+Date.now(),
      time: now.toLocaleString("en-IN"),
      iso: now.toISOString(),
      date: now.toLocaleDateString("en-IN"),
      admin: ADMIN_EMAIL
    })
  });
}

// Client Login - kisi bhi device se
export async function loginClient(username, password){
  const q = query(collection(db, "clients"), where("username","==",username.toLowerCase()), where("password","==",password));
  const snap = await getDocs(q);
  if(snap.empty) return null;
  const docSnap = snap.docs[0];
  return { id: docSnap.id,...docSnap.data() };
}

// Balance Get / Set
export async function getClientBalance(username){
  const snap = await getDoc(doc(db, "clients", username.toLowerCase()));
  return snap.exists()? snap.data().coins : 0;
}

// Game me jeeta/haara
export async function updateClientBalance(username, newBalance, gameInfo="Game Result"){
  const userRef = doc(db, "clients", username.toLowerCase());
  const now = new Date();
  await updateDoc(userRef, {
    coins: newBalance,
    history: arrayUnion({
      type: "GAME",
      amount: newBalance,
      reason: gameInfo,
      ref: "GAME-"+Date.now(),
      time: now.toLocaleString("en-IN"),
      iso: now.toISOString(),
      date: now.toLocaleDateString("en-IN")
    })
  });
}