// Firebase setup
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Replace with your Firebase API key
  authDomain: "matchday-44a3c.firebaseapp.com",
  projectId: "matchday-44a3c",
  storageBucket: "matchday-44a3c.appspot.com",
  messagingSenderId: "810548681671",
  appId: "1:810548681671:web:1483c2f2b0baa9b49cd7e2"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let currentUser = null;

// Admin credentials
const adminEmail = "ikshihab2002@gmail.com";
const adminPassword = "01012002pdl";

// --- Login ---
document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Admin login check
  if(email === adminEmail && password === adminPassword){
    currentUser = {email: adminEmail, name: "Admin", uid: "admin"};
    showAdminDashboard();
    return;
  }

  // Player login
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

  // Prevent signing up as admin
  if(email === adminEmail){
    alert("This email is reserved for admin!");
    return;
  }

  // Check if user already exists
  const snapshot = await db.collection("users").where("email","==",email).get();
  if(!snapshot.empty){
    alert("User already exists, please login");
    return;
  }

  // Add new player to Firestore
  await db.collection("users").add({email, password, name, contact});
  alert("Sign-up successful! You can now login.");
});

// --- Admin Dashboard ---
function showAdminDashboard(){
  document.getElementById("loginSection").style.display="none";
  document.getElementById("adminDashboard").style.display="block";

  document.getElementById("createMatchBtn").onclick = async () => {
    const date = document.getElementById("matchDate").value;
    const time = document.getElementById("matchTime").value;
    const location = document.getElementById("matchLocation").value;
    const slots = parseInt(document.getElementById("matchSlots").value);
    await db.collection("matches").add({date, time, location, maxSlots: slots});
    alert("Match created!");
    loadBookings();
  };

  document.getElementById("postAnnouncementBtn").onclick = async () => {
    const text = document.getElementById("announcementInput").value;
    await db.collection("announcements").add({text, timestamp: Date.now()});
    alert("Announcement posted!");
  };

  loadBookings();
}

async function loadBookings(){
  const bookingsDiv = document.getElementById("bookingListAdmin");
  bookingsDiv.innerHTML = "<h4>Bookings:</h4>";
  const bookingsSnap = await db.collection("bookings").get();
  bookingsSnap.forEach(async doc => {
    const booking = doc.data();
    const playerSnap = await db.collection("users").doc(booking.userId).get();
    const player = playerSnap.data();
    const div = document.createElement("div");
    div.innerHTML = `${player.name} - ${booking.paymentMethod} 
      <button onclick="kickPlayer('${doc.id}')">Kick</button>`;
    bookingsDiv.appendChild(div);
  });
}

async function kickPlayer(bookingId){
  await db.collection("bookings").doc(bookingId).delete();
  alert("Player removed!");
  loadBookings();
}

// --- Player Dashboard ---
function showPlayerDashboard(){
  document.getElementById("loginSection").style.display="none";
  document.getElementById("playerDashboard").style.display="block";

  const playerId = currentUser.uid;
  document.getElementById("playerName").value = currentUser.name;
  document.getElementById("playerContact").value = currentUser.contact;

  document.getElementById("saveProfileBtn").onclick = async () => {
    const name = document.getElementById("playerName").value;
    const contact = document.getElementById("playerContact").value;
    await db.collection("users").doc(playerId).update({name, contact});
    alert("Profile updated!");
  };

  loadUpcomingMatch();
  loadAnnouncements();
}

async function loadUpcomingMatch(){
  const matchSnap = await db.collection("matches").orderBy("date").limit(1).get();
  const matchInfoDiv = document.getElementById("matchInfoPlayer");
  const bookedList = document.getElementById("bookedPlayersList");
  bookedList.innerHTML = "";
  if(matchSnap.empty){
    matchInfoDiv.innerText = "No upcoming matches.";
    document.getElementById("bookingOptions").style.display="none";
    return;
  }

  const match = matchSnap.docs[0].data();
  matchInfoDiv.innerText = `Next Match: ${match.date} @ ${match.time}, ${match.location}`;
  document.getElementById("bookingOptions").style.display="block";

  document.getElementById("bookSlotBtn").onclick = async () => {
    const payment = document.getElementById("paymentMethod").value;
    await db.collection("bookings").add({
      userId: currentUser.uid,
      matchId: matchSnap.docs[0].id,
      paymentMethod: payment,
      confirmed:true
    });
    if(payment==="bkash") alert("Send payment to 01623729249 and confirm!");
    else alert("Booking confirmed! On-spot cash.");
    loadUpcomingMatch();
  };

  const bookingsSnap = await db.collection("bookings").where("matchId","==",matchSnap.docs[0].id).get();
  let count = 1;
  bookingsSnap.forEach(async doc => {
    const player = await db.collection("users").doc(doc.data().userId).get();
    const li = document.createElement("li");
    li.innerText = `${count}. ${player.data().name} (${doc.data().paymentMethod})`;
    bookedList.appendChild(li);
    count++;
  });
}

async function loadAnnouncements(){
  const snap = await db.collection("announcements").orderBy("timestamp","desc").get();
  const list = document.getElementById("announcementList");
  list.innerHTML = "";
  snap.forEach(doc => {
    const li = document.createElement("li");
    li.innerText = doc.data().text;
    list.appendChild(li);
  });
}
