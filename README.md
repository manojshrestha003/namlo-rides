#  Namlo Rides — Real-Time Ride Sharing Simulator

A production-grade real-time ride-sharing simulation platform built for the **Namlo Technologies Frontend Intern Challenge**. The application simulates both Rider and Driver experiences within a single unified React codebase, synchronized live via Firebase Realtime Database.

---

##  Links

| | |
|---|---|
| **Live Demo** | https://namlo-rides-two.vercel.app |
| **GitHub Repo** | https://github.com/manojshrestha003/namlo-rides |

---

## 🔐 Test Credentials

```
Email:    intern@namlotech.com
Password: namlo2026
```

---

## 🖥️ How to Test (Two-Tab Simulation)

1. Open the live link in **two browser tabs side by side**
2. **Tab 1** → Login → Select **Rider**
3. **Tab 2** → Login → Select **Driver**
4. **Rider tab** — tap anywhere on the map to set a pickup location
5. **Rider tab** — click **Request Ride**
6. **Driver tab** — incoming request appears instantly
7. **Driver tab** — click **Accept** (or Reject)
8. Watch the **green driver marker** move toward pickup in real time on both maps
9. **Driver tab** — click **Start Ride** → **Complete Ride**
10. Ride is automatically saved to history via MockAPI REST
11. Click **History** in the navbar to view all past rides

---

##  Features

### Rider
- Tap map to set pickup location with reverse geocoding (real place names)
- Request, track, and cancel rides in real time
- Live driver location shown on map as green moving marker
- Ride status updates instantly — Requesting → Accepted → Active → Completed
- View full ride history fetched from MockAPI

### Driver
- Incoming ride requests appear automatically
- Accept or reject rides
- Simulated movement toward pickup location
- Start and complete rides
- View ride history

### General
- Secure login with hardcoded test credentials
- Auth state persists across page reloads via localStorage
- Reverse geocoding via Nominatim (OpenStreetMap) with localStorage cache
- Real-time sync via Firebase Realtime Database WebSocket
- Ride history persisted to MockAPI REST on terminal state
- Full ride lifecycle state machine with transition guards
- Responsive split-panel layout (controls left, map right)
- Dark glassmorphism UI throughout

---

##  Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | React 18 + TypeScript | UI and type safety |
| Build tool | Vite | Fast dev server and bundling |
| Styling | Tailwind CSS | Utility-first styling |
| Icons | Lucide React | Consistent icon set |
| Routing | React Router v6 | Client-side navigation |
| Map | React-Leaflet + OpenStreetMap | Interactive map, no API key needed |
| Real-time | Firebase Realtime Database | WebSocket-based live sync |
| History API | MockAPI.io | Free REST mock for ride persistence |
| Geocoding | Nominatim (OpenStreetMap) | Reverse geocoding coordinates to place names |
| Deployment | Vercel | CI/CD from GitHub |

---

##  Architecture

### Hybrid Data Architecture

The app cleanly separates two distinct data concerns:

**Firebase Realtime Database** (WebSocket — high frequency)
- Live driver location updates pushed every 2 seconds
- Ride status changes (requesting → accepted → active → terminal)
- Sub-second sync between Rider and Driver tabs
- Data is transient — only active ride state lives here

**MockAPI REST** (HTTP — archival)
- Triggered once when a ride reaches a terminal state (completed / cancelled / rejected)
- Single `POST /rides` call persists the full ride record
- `GET /rides` fetches history list on the History page
- Acts as the permanent paper trail

This separation means Firebase handles what needs to be **fast**, and MockAPI handles what needs to **persist**.

---

### Ride State Machine

All ride lifecycle transitions are guarded by `canTransition()` in `src/utils/stateMachine.ts` — illegal state jumps are blocked at the source.

```
idle
  └─▶ requesting
        ├─▶ rejected   (terminal) ──▶ MockAPI POST
        ├─▶ cancelled  (terminal) ──▶ MockAPI POST
        └─▶ accepted
              ├─▶ cancelled  (terminal) ──▶ MockAPI POST
              └─▶ active
                    ├─▶ cancelled  (terminal) ──▶ MockAPI POST
                    └─▶ completed  (terminal) ──▶ MockAPI POST
```

Terminal states automatically trigger the REST persistence call — this is the bridge between the two data layers.

---



## 📁 Project Structure

```
src/
├── api/
│   └── mockapi.ts          # REST calls to MockAPI (save + fetch rides)
├── components/
│   ├── Map/
│   │   └── RideMap.tsx     # React-Leaflet map, Kathmandu center
│   └── NavBar.tsx          # Shared dark navbar with role badge
├── context/
│   ├── authContext.tsx     # Login state, persisted in localStorage
│   └── RideContext.tsx     # Firebase sync, state machine, MockAPI trigger
├── firebase/
│   └── config.ts           # Firebase initialization
├── hooks/
│   └── usePlaceName.ts     # Reverse geocoding hook with cleanup
├── pages/
│   ├── LoginPage.tsx       # Dark glassmorphism login
│   ├── SelectRolePage.tsx  # Role picker (Rider / Driver)
│   ├── RiderPage.tsx       # Split layout — controls left, map right
│   ├── DriverPage.tsx      # Incoming requests, movement simulation
│   └── HistoryPage.tsx     # Past rides fetched from MockAPI
├── types/
│   └── index.ts            # Shared TypeScript interfaces
└── utils/
    ├── stateMachine.ts     # Ride lifecycle transitions + guards
    └── geocode.ts          # Nominatim fetcher with queue + persistent cache
```

---

## ⚙️ Local Setup

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

## 📋 Submission Checklist

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

Built by **Manoj Shrestha** for the Namlo Technologies Frontend Intern Challenge.