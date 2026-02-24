🏟️ MatchDay – Football Match Booking Web App
Dark Theme • Firebase Auth • Firestore • PWA • Admin Dashboard • Real‑Time Bookings
MatchDay is a fully functional football match booking platform built with Firebase, designed for teams and friends to organize matches, book slots, manage announcements, and coordinate quickly — all in a dark green mint theme matching your branding.
The app supports Admin and Player roles, Google Login, real‑time Firestore updates, and full PWA installability.

🚀 Features
👑 Admin Features

Login with email/password (hardcoded admin email)
Create a match with:

Date
Time
Location
Maximum slots
Status (open/closed)


Post announcements visible to all players
View complete booking list
Remove (“Kick”) any player from bookings
Close current match instantly


👤 Player Features

Sign up with email/password
Login with email/password or Google Sign‑In
Create & update profile (name + contact)
View upcoming matches (closest open match)
Book a slot using:

bKash (shows your number: 01623729249)
On‑spot cash


Cancel their own booking
See who else booked (real‑time list)
Read announcements


⚡ Real‑Time Firebase Features

Bookings update instantly across all devices
Announcements sync instantly
Firestore offline persistence enabled


📱 PWA (Progressive Web App)

Installable on Android, iOS, and Desktop
Offline support via caching + Firestore persistence
Fast loading after first install


🎨 Dark Theme (Matches Your Logo)
The app uses a clean dark green + mint aesthetic:





























ElementColorBackground#0B1F18Card Panels#0E2F23Mint Accent#8CE9C3Text#E8FFF6Muted Text#88A097

📂 Project Structure
/
│ index.html
│ styles.css
│ app.js
│ manifest.json
│ sw.js
│ logo.png


🔥 Firebase Setup

Create a Firebase project
Enable:

Authentication (Email/Password + Google)
Firestore Database


Add your web app
Replace your Firebase config inside app.js
Deploy via Firebase Hosting:
Shellfirebase deployShow more lines



🔐 Admin Login
The admin is hardcoded for simplicity.
Email: ikshihab2002@gmail.com
Password: (your chosen password)

Admin cannot log in using Google — password login only.

📌 Firestore Collections
users/{uid}
matches/{matchId}
  bookings/{uid}
announcements/{id}


🛡️ Security
Admin:

Only the hardcoded email is treated as admin
Admin UI is locked to that email

Players:

Cannot access admin features
Can only manage their own profile and booking


📦 Installation (Local)
Just open index.html in a browser, or use any local server:
npx serve .

Service worker activates only when served over HTTP/HTTPS.

🔧 Technologies Used

HTML, CSS, JavaScript
Firebase Authentication
Firestore Database
Firestore Offline Persistence
Firebase Hosting (optional)
PWA (Service Worker + Manifest)


⭐ Credits
Designed for personal use by SYED IMRUL KAYES (Shihab)
Logo + theme integrated based on provided branding.

❤️ Support
Need help customizing the app?
Want to add team assignment, match fees, payment verification, or analytics?
Just ask — I can generate upgrades instantly.
