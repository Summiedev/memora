<div align="center">

# 🌸 Memora

**Your personal memory vault — capture moments, share capsules, relive the past.**

![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)
![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?style=flat-square&logo=socket.io)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-3448C5?style=flat-square&logo=cloudinary)

</div>

---

## ✨ What is Memora?

Memora is a full-stack memory journaling app where you can write diary entries, build photo albums, create time capsules that unlock in the future, and share memories with friends — all in one beautiful place.

---

## 🚀 Features

### 📔 Diary & Photo Memories
- Create rich diary entries with mood tracking
- Build photo albums with captions and cover images
- Browse memories in a filterable grid (All / Diaries / Photos)
- View memories in a full-screen detail modal
- Interactive **Memory Calendar** — highlighted days show where memories live; click any day for a quick preview

### 📦 Time Capsules
- Create time capsules with text, images, and a future unlock date
- Capsules stay locked until their send date — a countdown shows how long remains
- Capsule types: personal, shared, and scheduled
- **Capsule sharing** — send a capsule directly to a friend in chat; they see it as a special bubble and get access when it unlocks

### 👥 Friends & Real-time Messaging
- Search for users and send friend requests
- Real-time friend request notifications with Accept / Decline
- Full real-time chat powered by Socket.io with message history
- **Typing indicators** — see when a friend is writing
- **Read receipts** — double-check marks when messages are read
- Online/offline presence indicators
- Unread message badge per conversation
- Share capsules inline inside any conversation

### 🔔 Notifications
- Live notification bell in the navbar pulls real pending friend requests
- Unread badge animates until cleared
- Click "View all in Friends" to handle requests directly

### 🎨 UI & UX
- Soft pastel design system with Tailwind CSS + custom CSS variables
- Smooth page transitions and modal animations via Framer Motion
- Sticky frosted-glass navbar with active page highlighting
- Responsive layout — mobile hamburger menu collapses cleanly
- Custom scroll bars, gradient text, cloud animations on the home page
- Chewy / Quicksand / Dancing Script font stack for a warm, personal feel

### 🔐 Auth & Accounts
- Email + password registration with JWT sessions
- **Google OAuth** sign-in
- Forgot password → email reset link flow
- Profile settings: update username, avatar, bio, password
- Image uploads via Cloudinary (with compression before upload)

### 📊 Dashboard
- Monthly recap slideshow of your photo memories
- Recent memories quick-view
- Mood tracker log
- Mini capsule cards with countdown timers

---

## 🛠 Tech Stack

| Layer        | Technology |
|--------------|------------|
| Frontend     | React 18, Vite, Tailwind CSS, Framer Motion |
| Backend      | Node.js, Express |
| Database     | MongoDB Atlas (Mongoose) |
| Realtime     | Socket.io |
| Auth         | JWT, Passport.js (Google OAuth) |
| Media        | Cloudinary |
| Email        | Nodemailer |
| Fonts        | Google Fonts (Chewy, Quicksand, Dancing Script, Caveat) |

---

## 📁 Project Structure

```
memora/
├── backend/
│   ├── config/
│   │   ├── db.js            # MongoDB connection
│   │   ├── passport.js      # Google OAuth strategy
│   │   └── socket.js        # Socket.io server logic
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── capsuleController.js
│   │   ├── diaryController.js
│   │   ├── friendRequestController.js
│   │   ├── messageController.js
│   │   ├── moodController.js
│   │   ├── photoController.js
│   │   └── userController.js
│   ├── models/
│   │   ├── capsule.js
│   │   ├── diaryEntry.js
│   │   ├── friendRequest.js
│   │   ├── message.js
│   │   ├── mood.js
│   │   ├── photoAlbum.js
│   │   └── user.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorHandler.js
│   └── routes/
│       ├── authRoutes.js
│       ├── capsuleRoutes.js
│       ├── diaryEntryRoutes.js
│       ├── friendRequestRoutes.js
│       ├── messageRoutes.js
│       ├── moodRoutes.js
│       ├── photoAlbumRoutes.js
│       └── userRoutes.js
│
└── src/
    ├── components/
    │   ├── Navbar_main.jsx       # Sticky navbar + real notifications
    │   ├── MemoryCalendar.jsx    # Interactive calendar with day preview
    │   ├── MonthlyRecap.jsx      # Story-style photo slideshow
    │   ├── CreateCapsuleForm.jsx # Multi-step capsule creator
    │   ├── ViewCapsuleModal.jsx  # Capsule detail + lock/unlock state
    │   ├── MemoryModal.jsx       # Diary / photo memory viewer
    │   ├── DiaryCard.jsx
    │   ├── photoAlbumCard.jsx
    │   ├── MoodTracker.jsx
    │   └── FloatingBtn.jsx
    └── pages/
        ├── Dashboard.jsx
        ├── FriendsPage.jsx       # Chat + friend requests (Socket.io)
        ├── MemoriesPageList.jsx  # Memories grid with tabs
        ├── CapsulesListPage.jsx
        ├── Login.jsx / Register.jsx
        └── Profile_Settings.jsx
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB Atlas cluster
- A Cloudinary account
- A Google OAuth client ID (for Google sign-in)

### 1. Clone & install

```bash
git clone https://github.com/your-username/memora.git
cd memora

# Backend
cd backend && npm install

# Frontend
cd ../  && npm install
```

### 2. Configure environment

Copy `backend/.env.example` to `backend/.env` and fill in:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Run

```bash
# Terminal 1 — backend
cd backend && node index.js

# Terminal 2 — frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🐛 Bug Fixes (recent)

| Bug | Fix |
|-----|-----|
| Navbar showed a hardcoded fake notification | Now fetches real pending friend requests from `/api/friends/pending` |
| Messages sometimes not delivered | Socket `register` now fires on `connect` and `reconnect` events, not just on mount |
| Memories page crashed when editing | `editingAlbum` / `editingDiary` state variables were missing — added |
| Diary delete compared wrong field (`_iD` vs `_id`) | Fixed to use `_id` consistently |
| Memory fetches were sequential | Switched to `Promise.all()` for parallel loading |

---

## 🗺 Roadmap — Planned Features

These are features planned for future releases:

### 🔜 Coming Soon
- [ ] **Collaborative capsules** — invite multiple friends to add content to a single capsule before it locks
- [ ] **Memory search** — full-text search across diary entries and album captions
- [ ] **Reactions** — emoji reactions on memories and messages
- [ ] **Memory reminders** — "On this day" push notification or email
- [ ] **Capsule comments** — friends can leave notes on an unlocked capsule

### 🧪 Experimental
- [ ] **AI memory summary** — auto-generate a monthly recap paragraph from your entries
- [ ] **Voice diary** — record an audio note instead of typing
- [ ] **Map view** — attach a location to memories and browse them on a world map
- [ ] **Streaks** — reward consistent journaling with a streak tracker

### 🛡 Infrastructure
- [ ] Refresh token rotation (replace long-lived JWTs)
- [ ] Rate limiting on auth endpoints
- [ ] End-to-end encrypted messages
- [ ] PWA / offline support

---

## 📸 Screenshots

> *(Add screenshots here once deployed)*

---

## 📄 License

MIT — feel free to fork and build on top of Memora.

---

<div align="center">
Made with 💜 by Summie
</div>
