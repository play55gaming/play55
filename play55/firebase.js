// firebase.js - FINAL 20-50 RANDOM VERSION
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

// === 9TH POINT - 20-50 RANDOM AUTO BETS ===
export function createDream11Template(matchData) {
  const t1 = matchData.team1 || "Team A";
  const t2 = matchData.team2 || "Team B";
  const now = Date.now();
  const tpls = [
    {title:`Match Winner - ${t1}`, market:"Match Winner", team:t1, side:"team1", bet:"100", win:"185", odds:"1.85"},
    {title:`Match Winner - ${t2}`, market:"Match Winner", team:t2, side:"team2", bet:"100", win:"190", odds:"1.90"},
    {title:`Total Sixes Over 8.5`, market:"Over", team:"Over", side:"single", bet:"100", win:"195", odds:"1.95"},
    {title:`Total Sixes Over 10.5`, market:"Over", team:"Over", side:"single", bet:"100", win:"195", odds:"1.95"},
    {title:`Total Fours Over 15.5`, market:"Over", team:"Over", side:"single", bet:"100", win:"190", odds:"1.90"},
    {title:`Total Runs Over 150.5`, market:"Over", team:"Over", side:"single", bet:"100", win:"180", odds:"1.80"},
    {title:`Total Runs Over 300.5`, market:"Over", team:"Over", side:"single", bet:"100", win:"195", odds:"1.95"},
    {title:`Powerplay 45.5 Over`, market:"Over", team:"Over", side:"single", bet:"100", win:"185", odds:"1.85"},
    {title:`Top Batsman - ${t1}`, market:"Top Batsman", team:t1, side:"single", bet:"50", win:"350", odds:"3.50"},
    {title:`Top Batsman - ${t2}`, market:"Top Batsman", team:t2, side:"single", bet:"50", win:"350", odds:"3.50"},
    {title:`Total Wickets Over 12.5`, market:"Over", team:"Over", side:"single", bet:"100", win:"190", odds:"1.90"},
    {title:`1st Over Runs Over 6.5`, market:"Over", team:"Over", side:"single", bet:"100", win:"200", odds:"2.00"},
  ];
  let count = Math.floor(Math.random()*31)+20; // 20-50
  let out=[];
  for(let i=0;i<count;i++){
    let p = tpls[Math.floor(Math.random()*tpls.length)];
    out.push({
      id: "auto_" + now + "_" + i,
      title: p.title,
      market: p.market,
      team: p.team,
      side: p.side,
      bet: p.bet,
      win: p.win,
      odds: p.odds,
      isAuto: true,
      bets: Math.floor(Math.random()*400)+50,
      amount: Math.floor(Math.random()*15000)+2000
    });
  }
  return out;
}

// --- CLIENT SYSTEM (Username wala) ---
export async function createClientUser({mobile, username, password, coins, ref}) {
  const userId = username.toLowerCase();
  const userRef = doc(db, "clients", userId);
  const snap = await getDoc(userRef);
  if(snap.exists()) throw new Error("Username already exists");
  const now = new Date();
  const historyEntry = {
    type: "OPEN",
    amount: Math.floor(coins),
    reason: "ID Created",
    ref: ref || "OPEN-"+Date.now(),
    time: now.toLocaleString("en-IN"),
    iso: now.toISOString(),
    date: now.toLocaleDateString("en-IN")
  };
  await setDoc(userRef, {
    mobile, username: userId, displayName: username,
    password,
    coins: Math.floor(Number(coins)) || 0,
    history: [historyEntry],
    isSuspended: false,
    createdAt: now.toISOString(),
    createdBy: ADMIN_EMAIL
  });
  return userId;
}

export async function addCoinsToClient(username, amount, reason, refNo){
  const userRef = doc(db, "clients", username.toLowerCase());
  const now = new Date();
  await updateDoc(userRef, {
    coins: increment(Math.floor(Number(amount))),
    history: arrayUnion({
      type: Number(amount) > 0? "ADD" : "CUT",
      amount: Math.floor(Number(amount)),
      reason: reason || "Admin Update",
      ref: refNo || "TXN-"+Date.now(),
      time: now.toLocaleString("en-IN"),
      iso: now.toISOString(),
      date: now.toLocaleDateString("en-IN"),
      admin: ADMIN_EMAIL
    })
  });
}

export async function loginClient(username, password){
  const q = query(collection(db, "clients"), where("username","==",username.toLowerCase()), where("password","==",password));
  const snap = await getDocs(q);
  if(snap.empty) return null;
  const docSnap = snap.docs[0];
  return { id: docSnap.id,...docSnap.data() };
}

export async function getClientBalance(username){
  const snap = await getDoc(doc(db, "clients", username.toLowerCase()));
  return snap.exists()? Math.floor(snap.data().coins || 0) : 0;
}
export async function updateClientBalance(username, newBalance){
  const userRef = doc(db, "clients", username.toLowerCase());
  await updateDoc(userRef, { coins: Math.floor(Number(newBalance)) });
}
export async function getClientBalanceSafe(username){
  const snap = await getDoc(doc(db, "clients", username.toLowerCase()));
  if(!snap.exists()) return 0;
  return Math.floor(snap.data().coins || 0);
}