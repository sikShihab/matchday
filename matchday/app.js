document.addEventListener("DOMContentLoaded", () => {

  const profileSection = document.getElementById("profileSection");
  const matchSection = document.getElementById("matchSection");
  const bookingOptions = document.getElementById("bookingOptions");
  const matchInfo = document.getElementById("matchInfo");

  // Buttons
  const homeBtn = document.getElementById("homeBtn");
  const checkMatchBtn = document.getElementById("checkMatchBtn");
  const saveProfileBtn = document.getElementById("saveProfileBtn");
  const bookBtn = document.getElementById("bookBtn");

  // Load saved profile
  const savedProfile = JSON.parse(localStorage.getItem("playerProfile"));
  if(savedProfile){
    document.getElementById("nameInput").value = savedProfile.name;
    document.getElementById("contactInput").value = savedProfile.contact;
    document.getElementById("positionInput").value = savedProfile.position;
    document.getElementById("teamInput").value = savedProfile.team;
    document.getElementById("jerseyInput").value = savedProfile.jersey;
    document.getElementById("gamesPlayed").value = savedProfile.gamesPlayed;
    document.getElementById("goals").value = savedProfile.goals;
  }

  // Show Home (Profile) section
  homeBtn.addEventListener("click", () => {
    profileSection.style.display = "block";
    matchSection.style.display = "none";
  });

  // Save Profile
  saveProfileBtn.addEventListener("click", () => {
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
    alert("Profile saved!");
  });

  // Check Match availability
  checkMatchBtn.addEventListener("click", () => {
    profileSection.style.display = "none";
    matchSection.style.display = "block";

    // Example: Hard-coded match availability
    const matchAvailable = true; // Set false to hide booking
    if(matchAvailable){
      matchInfo.innerText = "Next Match: 24th Feb, 11:00 PM @ Jaff";
      bookingOptions.style.display = "block";
    } else {
      matchInfo.innerText = "No matches currently available.";
      bookingOptions.style.display = "none";
    }
  });

  // Book Slot
  bookBtn.addEventListener("click", () => {
    const booking = {
      date: document.getElementById("matchDate").value,
      time: document.getElementById("matchTime").value,
      payment: document.getElementById("paymentMethod").value
    };

    if(!booking.date || !booking.time) return alert("Select date and time!");

    let bookings = JSON.parse(localStorage.getItem("matchBookings") || "[]");
    bookings.push(booking);
    localStorage.setItem("matchBookings", JSON.stringify(bookings));

    alert(`Slot booked! Payment: ${booking.payment}`);
  });

  // Show Home by default
  homeBtn.click();

});
