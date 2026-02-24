// 🔹 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDkzD-_MAZscUk1OTCTdI9tZHZfL4J_u-0",
  authDomain: "matchday-44a3c.firebaseapp.com",
  projectId: "matchday-44a3c",
  storageBucket: "matchday-44a3c.firebasestorage.app",
  messagingSenderId: "810548681671",
  appId: "1:810548681671:web:1483c2f2b0baa9b49cd7e2",
  measurementId: "G-R5M5NVBY92"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Elements
const authSection = document.getElementById("authSection");
const profileSection = document.getElementById("profileSection");
const bookSection = document.getElementById("bookSection");

// 🔹 Sign Up
document.getElementById("signupBtn").addEventListener("click", () => {
  const email = document.getElementById("emailInput").value;
  const password = document.getElementById("passwordInput").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then(uc => {
      alert("Sign Up Successful!");
      const user = uc.user;
      db.collection("players").doc(user.uid).set({
        email: user.email, position: "", name: "", contact: "",
        team: "", jersey: "", gamesPlayed: 0, goals: 0
      });
    }).catch(e => alert(e.message));
});

// 🔹 Login
document.getElementById("loginBtn").addEventListener("click", () => {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(uc => alert("Login Successful!"))
    .catch(e => alert(e.message));
});

// 🔹 Auth state
auth.onAuthStateChanged(user => {
  if (user) {
    authSection.style.display = "none";
    profileSection.style.display = "block";
    bookSection.style.display = "block";

    // Load profile
    db.collection("players").doc(user.uid).get().then(doc => {
      if (doc.exists) {
        const data = doc.data();
        document.getElementById("nameInput").value = data.name;
        document.getElementById("contactInput").value = data.contact;
        document.getElementById("positionInput").value = data.position;
        document.getElementById("teamInput").value = data.team;
        document.getElementById("jerseyInput").value = data.jersey;
        document.getElementById("gamesPlayed").innerText = `Games Played: ${data.gamesPlayed}`;
        document.getElementById("goals").innerText = `Goals: ${data.goals}`;
      }
    });
  } else {
    authSection.style.display = "block";
    profileSection.style.display = "none";
    bookSection.style.display = "none";
  }
});

// 🔹 Save Profile
document.getElementById("saveProfileBtn").addEventListener("click", () => {
  const user = auth.currentUser;
  if (!user) return alert("Not logged in!");
  db.collection("players").doc(user.uid).update({
    name: document.getElementById("nameInput").value,
    contact: document.getElementById("contactInput").value,
    position: document.getElementById("positionInput").value,
    team: document.getElementById("teamInput").value,
    jersey: document.getElementById("jerseyInput").value
  }).then(() => alert("Profile updated!"));
});

// 🔹 Book Match Slot
document.getElementById("bookBtn").addEventListener("click", () => {
  const user = auth.currentUser;
  if (!user) return alert("Not logged in!");
  const date = document.getElementById("matchDate").value;
  const time = document.getElementById("matchTime").value;
  const payment = document.getElementById("paymentMethod").value;

  db.collection("bookings").add({
    userId: user.uid, date, time, payment, createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => alert(`Slot booked! Payment: ${payment}`));
});
