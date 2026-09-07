# FLOWSTATE — Personal Time Intelligence Platform

FLOWSTATE is a full-stack personal productivity and time-intelligence platform. It provides precision focus session tracking, daily/weekly/monthly analytics, behavioral insights, goal tracking, and deterministic baseline comparisons.

---

## ⚡ Tech Stack

- **Frontend**: React (v19), TypeScript, Vite, Recharts, Lucide Icons, Vanilla CSS Design System
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.io
- **AI Engine**: Groq SDK (`llama-3.3-70b-versatile`) with deterministic rule-based fallback
- **Testing**: Vitest

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas account or local MongoDB instance

### 2. Installation
Install dependencies for both client and server from the root directory:

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 3. Environment Variables
Create a `.env` file inside the `server/` directory based on `.env.example`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
GROQ_API_KEY=your_groq_api_key
```

### 4. Running Locally
Run the server and client concurrently or in separate terminals:

```bash
# Start backend (http://localhost:5000)
npm run server

# Start frontend (http://localhost:5173)
npm run client
```

---

## 🧪 Testing

Run the backend unit and integration test suite:

```bash
npm run test:server
```

---

## 📁 Monorepo Structure

```
FlowState/
├── client/                 # React + TypeScript Vite frontend
│   ├── src/
│   │   ├── api/            # API client layer
│   │   ├── components/     # UI components (activities, analytics, goals, sessions)
│   │   ├── context/        # Auth, Session, and Socket contexts
│   │   ├── pages/          # Dashboard, Timeline, Analytics, Goals, Auth
│   │   └── types/          # Shared TypeScript interfaces
├── server/                 # Express + Mongoose backend
│   ├── analytics/          # Analytics computation engine
│   ├── config/             # Database connection & config
│   ├── controllers/        # Express route controllers
│   ├── middleware/         # Auth & error handling middleware
│   ├── models/             # Mongoose schemas (User, Activity, Session, Goal, Insight)
│   ├── routes/             # REST API routes
│   ├── services/           # Business logic & AI insight engine
│   └── tests/              # Test suites
└── package.json            # Monorepo root scripts
```
