---

## Local Setup

### Prerequisites
- Node.js 18+
- npm 9+
- Firebase project with Realtime Database enabled
- MockAPI.io project with a `rides` resource

### 1. Clone the repository

```bash
git clone https://github.com/manojshrestha003/namlo-rides
cd namlo-rides
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_MOCKAPI_URL=https://YOUR_ID.mockapi.io/api/v1
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 5. Build for production

```bash
npm run build
```

---

## 🚀 Deployment (Vercel)

1. Push your repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import repo
3. Framework preset auto-detects **Vite**
4. Add all `.env` variables under **Environment Variables**
5. Click **Deploy**

> Make sure your MockAPI resource remains active and your Firebase Realtime Database is in **test mode** or has appropriate read/write rules.

---

## 🔥 Firebase Setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a project → Register a web app
3. Go to **Build → Realtime Database → Create Database**
4. Choose a region → Start in **test mode**
5. Copy the config values into your `.env`

**Database rules (test mode):**
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

---

## 🌐 MockAPI Setup

1. Go to [mockapi.io](https://mockapi.io) → Create a project
2. Add a resource named `rides` with these fields:

| Field | Type |
|---|---|
| id | String (auto) |
| riderId | String |
| driverId | String |
| status | String |
| pickup | Object |
| createdAt | String |

3. Copy your base URL into `VITE_MOCKAPI_URL`

---

##  Submission Checklist

- [x] Login works with hardcoded test credentials
- [x] Two browser tabs sync in real time (Rider + Driver)
- [x] Driver marker moves on map toward pickup
- [x] Completed/cancelled/rejected rides saved to MockAPI
- [x] History page fetches and displays past rides
- [x] Reverse geocoding shows real place names
- [x] Auth persists across page reloads
- [x] All Firebase listeners cleaned up on unmount
- [x] No custom backend — Firebase + MockAPI only
- [x] Live Vercel deployment working
- [x] GitHub repository is public
- [x] README complete

---

## 👤 Author

Built by **[Your Name]** for the Namlo Technologies Frontend Intern Challenge.