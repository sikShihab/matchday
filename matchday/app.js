// Firebase setup
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Replace with your Firebase API Key
  authDomain: "matchday-44a3c.firebaseapp.com",
  projectId: "matchday-44a3c",
  storageBucket: "matchday-44a3c.appspot.com",
  messagingSenderId: "810548681671",
  appId: "1:810548681671:web:1483c2f2b0baa9b49cd7e2"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

let currentUser = null;
const adminEmail = "ikshihab2002@gmail.com";
const adminPassword = "01012002pdl";

// --- Login ---
document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if(email === adminEmail && password === adminPassword){
    currentUser = {email: adminEmail, name: "Admin", uid: "admin"};
    showAdminDashboard();
    return;
  }

  const snapshot = await db.collection("users").where("email","==",email).get();
  if(snapshot.empty){
    alert("User not found, please sign up first");
    return;
  }
  const user = snapshot.docs[0].data();
  if(user.password !== password){
    alert("Wrong password");
    return;
  }
  currentUser = {...user, uid: snapshot.docs[0].id};
  showPlayerDashboard();
});

// --- Sign Up ---
document.getElementById("signupBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const name = prompt("Enter your name:");
  const contact = prompt("Enter your contact number:");

  if(!email || !password || !name || !contact){
    alert("All fields are required!");
    return;
  }

  if(email === adminEmail){
    alert("This email is reserved for admin!");
    return;
  }

  const snapshot = await db.collection("users").where("email","==",email).get();
  if(!snapshot.empty){
    alert("User already exists, please login");
    return;
  }

  await db.collection("users").add({email, password, name, contact});
  alert("Sign-up successful! You can now login.");
});

// --- Google Sign-In ---
document.getElementById("googleSignInBtn").addEventListener("click", async () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    const result = await auth.signInWithPopup(provider);
    const user = result.user;
    if(user.email === adminEmail){
      alert("Use email/password for admin login.");
      await auth.signOut();
      return;
    }

    const snapshot = await db.collection("users").where("email","==",user.email).get();
    if(snapshot.empty){
      await db.collection("users").add({
        email: user.email,
        name: user.displayName,
        contact: "",
        password: ""
      });
    }

    currentUser = {email: user.email, name: user.displayName, uid: user.uid};
    showPlayerDashboard();
  } catch(err){
    console.log(err);
    alert("Google Sign-In failed.");
  }
});

// --- Admin & Player Dashboard functions remain same ---
// showAdminDashboard()
// showPlayerDashboard()
// loadBookings()
// loadUpcomingMatch()
// loadAnnouncements()
// kickPlayer() ...
