// Profile
document.getElementById("saveProfileBtn").addEventListener("click", () => {
  const profile = {
    name: document.getElementById("nameInput").value,
    contact: document.getElementById("contactInput").value,
    position: document.getElementById("positionInput").value,
    team: document.getElementById("teamInput").value,
    jersey: document.getElementById("jerseyInput").value,
    gamesPlayed: document.getElementById("gamesPlayed").value,
    goals: document.getElementById("goals").value
  };
  localStorage.setItem("playerProfile", JSON.stringify(profile));
  alert("Profile saved locally!");
});

// Load profile if exists
window.addEventListener("load", () => {
  const profile = JSON.parse(localStorage.getItem("playerProfile"));
  if(profile){
    document.getElementById("nameInput").value = profile.name;
    document.getElementById("contactInput").value = profile.contact;
    document.getElementById("positionInput").value = profile.position;
    document.getElementById("teamInput").value = profile.team;
    document.getElementById("jerseyInput").value = profile.jersey;
    document.getElementById("gamesPlayed").value = profile.gamesPlayed;
    document.getElementById("goals").value = profile.goals;
  }
});

// Match Booking
document.getElementById("bookBtn").addEventListener("click", () => {
  const booking = {
    date: document.getElementById("matchDate").value,
    time: document.getElementById("matchTime").value,
    payment: document.getElementById("paymentMethod").value
  };
  
  let bookings = JSON.parse(localStorage.getItem("matchBookings") || "[]");
  bookings.push(booking);
  localStorage.setItem("matchBookings", JSON.stringify(bookings));
  
  alert(`Slot booked! Payment: ${booking.payment}`);
});
