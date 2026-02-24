# 🏟️ MatchDay – Football Match Booking Web App
Dark Theme • Firebase Auth • Firestore • PWA • Admin Dashboard • Real‑Time Bookings

MatchDay is a football match booking platform for organizing matches, booking slots, posting announcements, and coordinating with teammates. It uses a **dark green + mint** theme and supports **Admin** + **Player** roles with real-time updates and PWA installability.

---

## ✨ Features

### Admin
- Email/password login (hardcoded admin email).
- Create matches (date/time/location/slots/status).
- Close matches.
- Post announcements.
- See live bookings and **kick** players.

### Players
- Sign up / login (email+password) or Google Sign-In.
- Edit profile (name/contact).
- See the **upcoming match** (nearest open).
- Book one slot per match (bKash or On-spot).
- Cancel own booking.
- See who booked (real-time).
- Read announcements.

### Tech
- Firebase Auth (Email/Password, Google).
- Firestore (real-time + offline persistence).
- PWA (service worker + manifest).

---

## 🧩 Project Structure

```
/ (repo root)
  README.md
  index.html
  styles.css
  app.js
  manifest.json
  sw.js
  logo.png
```

---

## 🔧 Setup

1. **Firebase Console**
   - Create a project → Add web app.
   - Enable **Authentication** → Providers:
     - Email/Password: **Enabled**
     - Google: **Enabled**
   - Create **Firestore Database**.

2. **Your Firebase Config**  
   Already included in `app.js`:
   ```js
   const firebaseConfig = {
     apiKey: "AIzaSyDkzD-_MAZscUk1OTCTdI9tZHZfL4J_u-0",
     authDomain: "matchday-44a3c.firebaseapp.com",
     projectId: "matchday-44a3c",
     storageBucket: "matchday-44a3c.firebasestorage.app",
     messagingSenderId: "810548681671",
     appId: "1:810548681671:web:1483c2f2b0baa9b49cd7e2",
     measurementId: "G-R5M5NVBY92"
   };
   ```

3. **Admin Account (hardcoded)**
   Create a user in Firebase Auth:
   ```
   Email: ikshihab2002@gmail.com
   Password: your_password
   ```
   Cannot login with Google.

4. **Run locally**
   ```
   npx serve .
   ```

5. **Deploy**
   ```
   firebase deploy
   ```

---

## 🔒 Firestore Rules (Optional Recommended)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signed() { return request.auth != null; }

    match /users/{u} {
      allow read, update: if signed() && u == request.auth.uid;
      allow create: if signed();
    }

    match /announcements/{a} {
      allow read: if signed();
      allow write: if signed(); // MVP; admin enforced client-side
    }

    match /matches/{m} {
      allow read: if signed();
      allow write: if signed(); // MVP

      match /bookings/{b} {
        allow read: if signed();
        allow create: if signed() && b == request.auth.uid;
        allow delete: if signed() && b == request.auth.uid;
      }
    }
  }
}
```

---

## ⚙️ Notes
- MatchDay supports offline caching + Firestore offline persistence.
- For large teams, consider Cloud Functions for strict slot limits.

---

## 🆘 Help
Need enhancements (team split, payment verification, Bengali labels, etc.)  
Just ask.
