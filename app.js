// =========================================================
// MATCHDAY — FULL APP (ADMIN + PLAYER)
// DARK THEME VERSION — HARDCODED ADMIN EMAIL
// =========================================================

// ------------------------
// Firebase Modular SDK
// ------------------------
import { 
  initializeApp 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  enableIndexedDbPersistence,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  limit,
  orderBy,
  serverTimestamp,
  onSnapshot,
  runTransaction
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ------------------------
// YOUR FIREBASE CONFIG
// ------------------------
const firebaseConfig = {
  apiKey: "AIzaSyDkzD-_MAZscUk1OTCTdI9tZHZfL4J_u-0",
  authDomain: "matchday-44a3c.firebaseapp.com",
  projectId: "matchday-44a3c",
  storageBucket: "matchday-44a3c.firebasestorage.app",
  messagingSenderId: "810548681671",
  appId: "1:810548681671:web:1483c2f2b0baa9b49cd7e2",
  measurementId: "G-R5M5NVBY92"
};

// Initialize
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable offline cache
enableIndexedDbPersistence(db).catch(() => {
  console.warn("Offline persistence unavailable.");
});

// ------------------------
// HARDCODED ADMIN EMAIL
// ------------------------
const ADMIN_EMAIL = "ikshihab2002@gmail.com";

// ------------------------
// DOM HELPER
// ------------------------
const $ = (id) => document.getElementById(id);

// Sections
const loginSection = $("loginSection");
const adminDashboard = $("adminDashboard");
const playerDashboard = $("playerDashboard");

// Login
const emailEl = $("email");
const passwordEl = $("password");
const loginBtn = $("loginBtn");
const signupBtn = $("signupBtn");
const googleBtn = $("googleSignInBtn");
const logoutBtn = $("logoutBtn");
const logoutBtn2 = $("logoutBtn2");

// Admin inputs
const matchDate = $("matchDate");
const matchTime = $("matchTime");
const matchLocation = $("matchLocation");
const matchSlots = $("matchSlots");
const matchStatus = $("matchStatus");

const createMatchBtn = $("createMatchBtn");
const closeMatchBtn = $("closeMatchBtn");

const announcementInput = $("announcementInput");
const postAnnouncementBtn = $("postAnnouncementBtn");
const announcementListAdmin = $("announcementListAdmin");

const matchInfoAdmin = $("matchInfoAdmin");
const bookingListAdmin = $("bookingListAdmin");

// Player inputs
const playerName = $("playerName");
const playerContact = $("playerContact");
const saveProfileBtn = $("saveProfileBtn");

const matchInfoPlayer = $("matchInfoPlayer");

const bookingOptions = $("bookingOptions");
const paymentMethod = $("paymentMethod");
const paymentRef = $("paymentRef");
const bkashInfo = $("bkashInfo");

const bookSlotBtn = $("bookSlotBtn");
const cancelBookingBtn = $("cancelBookingBtn");

const bookedPlayersList = $("bookedPlayersList");
const announcementList = $("announcementList");

// ------------------------
// STATE
// ------------------------
let currentUser = null;
let isAdmin = false;
let currentMatchId = null;

let unsubscribeBookings = null;
let unsubscribeAnnouncements = null;

// ------------------------
// UTIL FUNCTIONS
// ------------------------
function showOnly(section) {
  loginSection.hidden = true;
  adminDashboard.hidden = true;
  playerDashboard.hidden = true;

  section.hidden = false;
}

function notify(msg) {
  alert(msg);
}

function formatTS(ts) {
  try {
    if (ts?.toDate) return ts.toDate().toLocaleString();
    return "";
  } catch {
    return "";
  }
}

// ------------------------
// AUTH LISTENER
// ------------------------
onAuthStateChanged(auth, async (user) => {
  currentUser = user || null;

  if (!user) {
    showOnly(loginSection);
    return;
  }

  // Determine admin
  isAdmin = user.email === ADMIN_EMAIL;

  // Ensure profile exists
  await ensureProfile(user);

  // Start monitoring announcements & match
  startAnnouncements();
  await loadUpcomingMatch();
  await loadProfile();

  // Show dashboard
  showOnly(isAdmin ? adminDashboard : playerDashboard);
});

// ------------------------
// ENSURE USER PROFILE EXISTS
// ------------------------
async function ensureProfile(user) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      email: user.email,
      name: user.displayName || "",
      contact: "",
      createdAt: serverTimestamp()
    });
  }
}

// ------------------------
// LOGIN
// ------------------------
loginBtn.onclick = async () => {
  const email = emailEl.value.trim();
  const password = passwordEl.value.trim();

  if (!email || !password) return notify("Enter email and password.");

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch {
    notify("Login failed.");
  }
};

// ------------------------
// SIGN UP
// ------------------------
signupBtn.onclick = async () => {
  const email = emailEl.value.trim();
  const password = passwordEl.value.trim();

  if (email === ADMIN_EMAIL) return notify("This email is reserved for admin.");

  if (!email || !password) return notify("Enter email and password.");

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    const name = prompt("Your name:");
    const contact = prompt("Contact number:");

    await updateProfile(cred.user, { displayName: name });

    await setDoc(doc(db, "users", cred.user.uid), {
      email,
      name,
      contact,
      createdAt: serverTimestamp()
    });

    notify("Account created!");
  } catch {
    notify("Sign-up failed.");
  }
};

// ------------------------
// GOOGLE SIGN-IN (PLAYERS ONLY)
// ------------------------
googleBtn.onclick = async () => {
  const prov = new GoogleAuthProvider();

  try {
    const res = await signInWithPopup(auth, prov);
    if (res.user.email === ADMIN_EMAIL) {
      await signOut(auth);
      return notify("Admin cannot use Google login.");
    }
    await ensureProfile(res.user);
  } catch {
    notify("Google login failed.");
  }
};

// ------------------------
// LOGOUT
// ------------------------
logoutBtn.onclick = () => signOut(auth);
logoutBtn2.onclick = () => signOut(auth);

// ------------------------
// LOAD PLAYER PROFILE
// ------------------------
async function loadProfile() {
  if (!currentUser) return;
  const ref = doc(db, "users", currentUser.uid);
  const snap = await getDoc(ref);
  const d = snap.data();

  playerName.value = d.name || "";
  playerContact.value = d.contact || "";
}

saveProfileBtn.onclick = async () => {
  if (!currentUser) return;
  await updateDoc(doc(db, "users", currentUser.uid), {
    name: playerName.value.trim(),
    contact: playerContact.value.trim()
  });
  notify("Profile saved.");
};

// ------------------------
// ANNOUNCEMENTS
// ------------------------
function startAnnouncements() {
  const qRef = query(
    collection(db, "announcements"),
    orderBy("createdAt", "desc")
  );

  if (unsubscribeAnnouncements) unsubscribeAnnouncements();

  unsubscribeAnnouncements = onSnapshot(qRef, (snap) => {
    const target = isAdmin ? announcementListAdmin : announcementList;
    target.innerHTML = "";

    snap.forEach((docSnap) => {
      const d = docSnap.data();
      const li = document.createElement("li");
      li.textContent = `${formatTS(d.createdAt)} — ${d.text}`;
      target.appendChild(li);
    });
  });
}

postAnnouncementBtn.onclick = async () => {
  if (!isAdmin) return;

  const text = announcementInput.value.trim();
  if (!text) return;

  await addDoc(collection(db, "announcements"), {
    text,
    createdAt: serverTimestamp()
  });

  announcementInput.value = "";
};

// ------------------------
// LOAD UPCOMING MATCH
// ------------------------
async function loadUpcomingMatch() {
  const qRef = query(
    collection(db, "matches"),
    where("status", "==", "open"),
    orderBy("date", "asc"),
    orderBy("time", "asc"),
    limit(1)
  );

  const snap = await getDocs(qRef);

  if (snap.empty) {
    matchInfoPlayer.textContent = "No upcoming match.";
    matchInfoAdmin.textContent = "No upcoming match.";
    bookingOptions.hidden = true;
    return;
  }

  const docSnap = snap.docs[0];
  currentMatchId = docSnap.id;

  const m = docSnap.data();
  const info = `📅 ${m.date}  ⏰ ${m.time}  📍 ${m.location} | Slots: ${m.slots}`;

  matchInfoPlayer.textContent = info;
  matchInfoAdmin.textContent = info;

  startBookings();
  updateBookingUI();
}

// ------------------------
// ADMIN CREATE MATCH
// ------------------------
createMatchBtn.onclick = async () => {
  if (!isAdmin) return;

  const date = matchDate.value;
  const time = matchTime.value;
  const loc = matchLocation.value.trim();
  const slots = Number(matchSlots.value);
  const status = matchStatus.value;

  if (!date || !time || !loc || slots < 1) return notify("Fill all fields.");

  await addDoc(collection(db, "matches"), {
    date,
    time,
    location: loc,
    slots,
    status,
    createdAt: serverTimestamp()
  });

  notify("Match created!");
};

// ------------------------
// CLOSE MATCH
// ------------------------
closeMatchBtn.onclick = async () => {
  if (!isAdmin || !currentMatchId) return;

  await updateDoc(doc(db, "matches", currentMatchId), {
    status: "closed"
  });

  notify("Match closed.");
};

// ------------------------
// BOOKINGS LISTENER
// ------------------------
function startBookings() {
  if (!currentMatchId) return;

  const qRef = query(
    collection(db, "matches", currentMatchId, "bookings"),
    orderBy("createdAt", "asc")
  );

  if (unsubscribeBookings) unsubscribeBookings();

  unsubscribeBookings = onSnapshot(qRef, async (snap) => {
    bookedPlayersList.innerHTML = "";
    bookingListAdmin.innerHTML = "";

    for (const d of snap.docs) {
      const b = d.data();
      const userSnap = await getDoc(doc(db, "users", b.uid));
      const u = userSnap.data();

      // Player list
      const li = document.createElement("li");
      li.textContent = `${u.name} — ${u.contact}`;
      bookedPlayersList.appendChild(li);

      // Admin list
      if (isAdmin) {
        const div = document.createElement("div");
        div.className = "bookingItem";
        div.innerHTML = `
          <strong>${u.name}</strong> (${u.contact})<br>
          <small>${b.paymentMethod}${b.paymentRef ? " — " + b.paymentRef : ""}</small>
          <br>
          <button class="danger small" data-uid="${b.uid}">Kick</button>
        `;
        bookingListAdmin.appendChild(div);
      }
    }

    if (isAdmin) {
      document.querySelectorAll(".danger.small").forEach((btn) => {
        btn.onclick = async () => {
          const uid = btn.getAttribute("data-uid");
          await deleteDoc(doc(db, "matches", currentMatchId, "bookings", uid));
        };
      });
    }
  });
}

// ------------------------
// BOOKING UI LOGIC
// ------------------------
async function updateBookingUI() {
  if (!currentUser || !currentMatchId) return;

  const ref = doc(db, "matches", currentMatchId, "bookings", currentUser.uid);
  const snap = await getDoc(ref);

  bookingOptions.hidden = false;

  if (paymentMethod.value === "bkash") {
    bkashInfo.style.display = "block";
    paymentRef.style.display = "block";
  } else {
    bkashInfo.style.display = "none";
    paymentRef.style.display = "none";
  }

  if (snap.exists()) {
    bookSlotBtn.disabled = true;
    bookSlotBtn.textContent = "Already Booked";
    cancelBookingBtn.disabled = false;
  } else {
    bookSlotBtn.disabled = false;
    bookSlotBtn.textContent = "Book Slot";
    cancelBookingBtn.disabled = true;
  }
}

paymentMethod.onchange = () => updateBookingUI();

// ------------------------
// BOOK SLOT
// ------------------------
bookSlotBtn.onclick = async () => {
  if (!currentMatchId) return;

  const method = paymentMethod.value;
  const reference = paymentRef.value.trim();

  try {
    await runTransaction(db, async (tx) => {
      const matchRef = doc(db, "matches", currentMatchId);
      const mSnap = await tx.get(matchRef);

      if (!mSnap.exists()) throw "Match missing.";

      const m = mSnap.data();
      if (m.status !== "open") throw "Match closed.";

      // Count current bookings
      const bSnap = await getDocs(
        collection(db, "matches", currentMatchId, "bookings")
      );

      if (bSnap.size >= m.slots) throw "No slots left.";

      const myRef = doc(
        db,
        "matches",
        currentMatchId,
        "bookings",
        currentUser.uid
      );

      const exists = await tx.get(myRef);
      if (exists.exists()) throw "Already booked.";

      tx.set(myRef, {
        uid: currentUser.uid,
        paymentMethod: method,
        paymentRef: reference,
        createdAt: serverTimestamp()
      });
    });

    notify("Booking successful!");
    updateBookingUI();
  } catch (e) {
    notify(e);
  }
};

// ------------------------
// CANCEL BOOKING
// ------------------------
cancelBookingBtn.onclick = async () => {
  await deleteDoc(
    doc(db, "matches", currentMatchId, "bookings", currentUser.uid)
  );

  notify("Booking cancelled.");
  updateBookingUI();
};
