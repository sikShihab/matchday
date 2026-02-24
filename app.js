
// =========================================================
// MATCHDAY — FULL APP (ADMIN + PLAYER)
// DARK THEME VERSION — HARDCODED ADMIN EMAIL
// Firebase SDK: v10+ modular (ES modules from CDN)
// =========================================================

// ------------------------
// Firebase Modular SDK
// ------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  updateProfile,
  sendPasswordResetEmail
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
// YOUR FIREBASE CONFIG (from you)
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

// ------------------------
// Initialize Firebase services
// ------------------------
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Offline cache for Firestore (PWA-friendly)
enableIndexedDbPersistence(db).catch(() => {
  // Multiple tabs can cause this to fail — not fatal.
  console.warn("Firestore offline persistence could not be enabled.");
});

// ------------------------
// Hardcoded Admin Email
// ------------------------
const ADMIN_EMAIL = "ikshihab2002@gmail.com";

/************************************************************
 * ADMIN BOOTSTRAP (ONE-TIME)
 * - Create the admin account with a chosen password (once).
 * - Or send a reset email if the admin already exists.
 * - After successful bootstrap: set SETUP_MODE=false and redeploy.
 ************************************************************/

// 🚨 Keep FALSE in production. Enable temporarily only for one-time bootstrap.
const SETUP_MODE = false;

// Optional buttons (add to index.html if desired)
const bootstrapAdminBtn = document.getElementById("bootstrapAdminBtn");
const resetAdminBtn     = document.getElementById("resetAdminBtn");

if (bootstrapAdminBtn) {
  bootstrapAdminBtn.style.display = SETUP_MODE ? "block" : "none";
}

// One-time Admin Creation
async function bootstrapCreateAdmin() {
  if (!SETUP_MODE) {
    alert("Setup mode is disabled. Edit app.js to enable (SETUP_MODE=true) for one-time bootstrap.");
    return;
  }

  const initPassword = prompt("Enter a temporary admin password (minimum 6 characters):")?.trim() || "";
  if (initPassword.length < 6) {
    alert("Password must be at least 6 characters.");
    return;
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, initPassword);
    try { await updateProfile(cred.user, { displayName: "Admin" }); } catch {}
    try {
      await setDoc(doc(db, "users", cred.user.uid), {
        email: ADMIN_EMAIL,
        name: "Admin",
        contact: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch {}
    alert("✅ Admin account created successfully.

Now set SETUP_MODE=false in app.js and redeploy.");
    await signOut(auth);
  } catch (e) {
    console.error("Bootstrap admin error:", e.code, e.message);
    if (e.code === "auth/email-already-in-use") {
      alert("Admin already exists. Use 'Send Admin Reset Email' (or window.__resetAdmin()) to set a new password.");
    } else {
      alert(`Failed to create admin: ${e.code || e.message}`);
    }
  }
}

// Send password reset email for admin
async function sendAdminReset() {
  try {
    await sendPasswordResetEmail(auth, ADMIN_EMAIL);
    alert(`Password reset email sent to ${ADMIN_EMAIL}.
Open the link and set your password.`);
  } catch (e) {
    console.error("Reset admin password error:", e.code, e.message);
    alert(`Failed to send reset email: ${e.code || e.message}`);
  }
}

bootstrapAdminBtn?.addEventListener("click", bootstrapCreateAdmin);
resetAdminBtn?.addEventListener("click", sendAdminReset);

// Expose helpers for DevTools
if (SETUP_MODE) {
  window.__createAdmin = bootstrapCreateAdmin;
  window.__resetAdmin  = sendAdminReset;
}

// ------------------------
// DOM Helper
// ------------------------
const $ = (id) => document.getElementById(id);

// Sections
const loginSection     = $("loginSection");
const adminDashboard   = $("adminDashboard");
const playerDashboard  = $("playerDashboard");

// Login elements
const emailEl          = $("email");
const passwordEl       = $("password");
const loginBtn         = $("loginBtn");
const signupBtn        = $("signupBtn");
const googleBtn        = $("googleSignInBtn");
const logoutBtn        = $("logoutBtn");
const logoutBtn2       = $("logoutBtn2");

// Admin controls
const matchDate        = $("matchDate");
const matchTime        = $("matchTime");
const matchLocation    = $("matchLocation");
const matchSlots       = $("matchSlots");
const matchStatus      = $("matchStatus");
const createMatchBtn   = $("createMatchBtn");
const closeMatchBtn    = $("closeMatchBtn");

const announcementInput    = $("announcementInput");
const postAnnouncementBtn  = $("postAnnouncementBtn");
const announcementListAdmin= $("announcementListAdmin");

const matchInfoAdmin   = $("matchInfoAdmin");
const bookingListAdmin = $("bookingListAdmin");

// Player controls
const playerName       = $("playerName");
const playerContact    = $("playerContact");
const saveProfileBtn   = $("saveProfileBtn");

const matchInfoPlayer  = $("matchInfoPlayer");

const bookingOptions   = $("bookingOptions");
const paymentMethod    = $("paymentMethod");
const paymentRef       = $("paymentRef");
const bkashInfo        = $("bkashInfo");

const bookSlotBtn      = $("bookSlotBtn");
const cancelBookingBtn = $("cancelBookingBtn");

const bookedPlayersList= $("bookedPlayersList");
const announcementList = $("announcementList");

// ------------------------
// App State
// ------------------------
let currentUser        = null;
let isAdmin            = false;
let currentMatchId     = null;

let unsubscribeBookings     = null;
let unsubscribeAnnouncements= null;

// ------------------------
// Utility helpers
// ------------------------
function showOnly(section) {
  if (loginSection)    loginSection.hidden = true;
  if (adminDashboard)  adminDashboard.hidden = true;
  if (playerDashboard) playerDashboard.hidden = true;
  if (section)         section.hidden = false;
}

function notify(msg) { alert(msg); }

function formatTS(ts) {
  try {
    if (!ts) return "";
    if (typeof ts.toDate === "function") return ts.toDate().toLocaleString();
    return new Date(ts).toLocaleString();
  } catch { return ""; }
}

// ------------------------
// Auth state listener
// ------------------------
onAuthStateChanged(auth, async (user) => {
  currentUser = user || null;

  if (!user) { showOnly(loginSection); return; }

  isAdmin = (user.email || "").toLowerCase() === ADMIN_EMAIL.toLowerCase();

  await ensureProfile(user);

  startAnnouncementsListener();
  await loadUpcomingMatch();
  await loadProfile();

  showOnly(isAdmin ? adminDashboard : playerDashboard);
});

// ------------------------
// Ensure user profile exists in Firestore
// ------------------------
async function ensureProfile(user) {
  const uref = doc(db, "users", user.uid);
  const snap = await getDoc(uref);
  if (!snap.exists()) {
    await setDoc(uref, {
      email: user.email,
      name: user.displayName || "",
      contact: "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
}

// ------------------------
// Login / Signup / Google
// ------------------------
loginBtn?.addEventListener("click", async () => {
  const email = (emailEl.value || "").trim();
  const password = (passwordEl.value || "").trim();
  if (!email || !password) return notify("Enter email and password.");
  try { await signInWithEmailAndPassword(auth, email, password); }
  catch (e) { console.error(e); notify("Login failed."); }
});

signupBtn?.addEventListener("click", async () => {
  const email = (emailEl.value || "").trim();
  const password = (passwordEl.value || "").trim();
  if (!email || !password) return notify("Enter email and password.");
  if (email === ADMIN_EMAIL) return notify("This email is reserved for admin.");
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const name    = prompt("Your name:") || "";
    const contact = prompt("Contact number:") || "";
    if (name) await updateProfile(cred.user, { displayName: name });
    await setDoc(doc(db, "users", cred.user.uid), {
      email, name, contact,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
    notify("Account created!");
  } catch (e) { console.error(e); notify("Sign-up failed."); }
});

googleBtn?.addEventListener("click", async () => {
  try {
    const provider = new GoogleAuthProvider();
    const res = await signInWithPopup(auth, provider);
    const gUser = res.user;
    if ((gUser.email || "").toLowerCase() === ADMIN_EMAIL.toLowerCase()) { await signOut(auth); return notify("Admin cannot use Google login."); }
    await ensureProfile(gUser);
  } catch (e) { console.error(e); notify("Google login failed."); }
});

logoutBtn?.addEventListener("click", () => signOut(auth));
logoutBtn2?.addEventListener("click", () => signOut(auth));

// ------------------------
// Profile load/save
// ------------------------
async function loadProfile() {
  if (!currentUser) return;
  const snap = await getDoc(doc(db, "users", currentUser.uid));
  if (snap.exists()) {
    const d = snap.data();
    if (playerName)    playerName.value = d.name || "";
    if (playerContact) playerContact.value = d.contact || "";
  }
}

saveProfileBtn?.addEventListener("click", async () => {
  if (!currentUser) return;
  const name    = (playerName.value || "").trim();
  const contact = (playerContact.value || "").trim();
  await updateDoc(doc(db, "users", currentUser.uid), { name, contact, updatedAt: serverTimestamp() });
  notify("Profile saved.");
});

// ------------------------
// Announcements (real-time)
// ------------------------
function startAnnouncementsListener() {
  const qRef = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
  if (unsubscribeAnnouncements) unsubscribeAnnouncements();
  unsubscribeAnnouncements = onSnapshot(qRef, (snap) => {
    const target = isAdmin ? announcementListAdmin : announcementList;
    if (!target) return;
    target.innerHTML = "";
    snap.forEach((docSnap) => {
      const a = docSnap.data();
      const li = document.createElement("li");
      li.textContent = `${formatTS(a.createdAt)} — ${a.text}`;
      target.appendChild(li);
    });
  });
}

postAnnouncementBtn?.addEventListener("click", async () => {
  if (!isAdmin) return notify("Admins only.");
  const text = (announcementInput.value || "").trim();
  if (!text) return;
  await addDoc(collection(db, "announcements"), { text, createdAt: serverTimestamp(), createdBy: currentUser?.uid || "" });
  announcementInput.value = "";
});

// ------------------------
// Upcoming match (nearest open)
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
    if (matchInfoPlayer) matchInfoPlayer.textContent = "No upcoming match.";
    if (matchInfoAdmin)  matchInfoAdmin.textContent  = "No upcoming match.";
    if (bookingOptions)  bookingOptions.hidden = true;
    if (bookedPlayersList) bookedPlayersList.innerHTML = "";
    if (bookingListAdmin) bookingListAdmin.innerHTML = "";
    currentMatchId = null;
    return;
  }

  const docSnap = snap.docs[0];
  currentMatchId = docSnap.id;
  const m = docSnap.data();

  const info = `📅 ${m.date}  ⏰ ${m.time}  📍 ${m.location} | Slots: ${m.slots}`;
  if (matchInfoPlayer) matchInfoPlayer.textContent = info;
  if (matchInfoAdmin)  matchInfoAdmin.textContent  = info;

  startBookingsListener();
  updateBookingUI();
}

// ------------------------
// Create/Close match (Admin)
// ------------------------
createMatchBtn?.addEventListener("click", async () => {
  if (!isAdmin) return notify("Admins only.");
  const date     = (matchDate.value || "").trim();
  const time     = (matchTime.value || "").trim();
  const location = (matchLocation.value || "").trim();
  const slots    = Number(matchSlots.value || 0);
  const status   = (matchStatus.value || "open").trim();

  if (!date || !time || !location || !slots || slots < 1) {
    return notify("Please fill all match fields with valid values.");
  }

  await addDoc(collection(db, "matches"), { date, time, location, slots, status, createdAt: serverTimestamp() });

  notify("Match created.");
  if (matchDate) matchDate.value = "";
  if (matchTime) matchTime.value = "";
  if (matchLocation) matchLocation.value = "";
  if (matchSlots) matchSlots.value = "";
  if (matchStatus) matchStatus.value = "open";

  await loadUpcomingMatch();
});

closeMatchBtn?.addEventListener("click", async () => {
  if (!isAdmin) return notify("Admins only.");
  if (!currentMatchId) return notify("No open match to close.");
  await updateDoc(doc(db, "matches", currentMatchId), { status: "closed", updatedAt: serverTimestamp() });
  notify("Match closed.");
  await loadUpcomingMatch();
});

// ------------------------
// Bookings (real-time list)
// ------------------------
function startBookingsListener() {
  if (!currentMatchId) return;
  if (unsubscribeBookings) unsubscribeBookings();

  const qRef = query(collection(db, "matches", currentMatchId, "bookings"), orderBy("createdAt", "asc"));

  unsubscribeBookings = onSnapshot(qRef, async (snap) => {
    if (bookedPlayersList) bookedPlayersList.innerHTML = "";
    if (bookingListAdmin)  bookingListAdmin.innerHTML  = "";

    for (const d of snap.docs) {
      const b = d.data();
      const userSnap = await getDoc(doc(db, "users", b.uid));
      const u = userSnap.exists() ? userSnap.data() : { name: b.uid, contact: "" };

      if (bookedPlayersList) {
        const li = document.createElement("li");
        li.textContent = `${u.name || b.uid} — ${u.contact || ""}`;
        bookedPlayersList.appendChild(li);
      }

      if (isAdmin && bookingListAdmin) {
        const div = document.createElement("div");
        div.className = "bookingItem";

        const title = document.createElement("strong");
        title.textContent = u.name || b.uid;
        div.appendChild(title);

        if (u.contact) {
          div.appendChild(document.createTextNode(` (${u.contact})`));
        }

        const payment = document.createElement("small");
        payment.className = "muted";
        payment.textContent = `${b.paymentMethod}${b.paymentRef ? " — " + b.paymentRef : ""}`;
        div.appendChild(payment);

        const actions = document.createElement("div");
        const kickBtn = document.createElement("button");
        kickBtn.className = "danger small";
        kickBtn.setAttribute("data-uid", b.uid);
        kickBtn.textContent = "Kick";
        actions.appendChild(kickBtn);
        div.appendChild(actions);

        bookingListAdmin.appendChild(div);
      }
    }

    if (isAdmin && bookingListAdmin) {
      bookingListAdmin.querySelectorAll("button.danger.small").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          const uid = e.currentTarget.getAttribute("data-uid");
          if (!confirm("Remove this booking?")) return;
          await deleteDoc(doc(db, "matches", currentMatchId, "bookings", uid));
        });
      });
    }
  });
}

// ------------------------
// Booking UI state
// ------------------------
async function updateBookingUI() {
  if (!currentUser || !currentMatchId) { if (bookingOptions) bookingOptions.hidden = true; return; }

  const myRef = doc(db, "matches", currentMatchId, "bookings", currentUser.uid);
  const snap = await getDoc(myRef);

  if (bookingOptions) bookingOptions.hidden = false;

  if (bkashInfo && paymentRef && paymentMethod) {
    const isBkash = paymentMethod.value === "bkash";
    bkashInfo.style.display = isBkash ? "block" : "none";
    paymentRef.style.display = isBkash ? "block" : "none";
  }

  if (snap.exists()) {
    if (bookSlotBtn) { bookSlotBtn.disabled = true; bookSlotBtn.textContent = "Already Booked"; }
    if (cancelBookingBtn) cancelBookingBtn.disabled = false;
  } else {
    if (bookSlotBtn) { bookSlotBtn.disabled = false; bookSlotBtn.textContent = "Book Slot"; }
    if (cancelBookingBtn) cancelBookingBtn.disabled = true;
  }
}

paymentMethod?.addEventListener("change", updateBookingUI);

// ------------------------
// Book slot
// ------------------------
bookSlotBtn?.addEventListener("click", async () => {
  if (!currentUser) return notify("Not signed in.");
  if (!currentMatchId) return notify("No open match to book.");

  const method = paymentMethod?.value || "onSpot";
  const refID  = (paymentRef?.value || "").trim();

  try {
    await runTransaction(db, async (tx) => {
      const matchRef = doc(db, "matches", currentMatchId);
      const mSnap = await tx.get(matchRef);
      if (!mSnap.exists()) throw new Error("Match not found.");

      const m = mSnap.data();
      if (m.status !== "open") throw new Error("Match is closed.");

      const all = await getDocs(collection(db, "matches", currentMatchId, "bookings"));
      if (all.size >= (m.slots || 0)) throw new Error("No slots left.");

      const myRef = doc(db, "matches", currentMatchId, "bookings", currentUser.uid);
      const mySnap = await tx.get(myRef);
      if (mySnap.exists()) throw new Error("You already booked.");

      tx.set(myRef, { uid: currentUser.uid, paymentMethod: method, paymentRef: refID, createdAt: serverTimestamp() });
    });

    notify("Booking successful!");
    updateBookingUI();
  } catch (e) { console.error(e); notify(e.message || String(e) || "Booking failed."); }
});

// ------------------------
// Cancel booking
// ------------------------
cancelBookingBtn?.addEventListener("click", async () => {
  if (!currentUser || !currentMatchId) return;
  if (!confirm("Cancel your booking?")) return;
  await deleteDoc(doc(db, "matches", currentMatchId, "bookings", currentUser.uid));
  notify("Your booking was cancelled.");
  updateBookingUI();
});
