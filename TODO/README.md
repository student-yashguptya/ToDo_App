# Todo App - Production Ready Task Management

A fully functional, production-ready task management app with robust timer system, day-based scheduling, subtasks with auto-completion, background survival, and notification system.

## Features

- ✅ **Robust Timer System** - Persistent timers that survive app closure
- ✅ **Day-based Scheduling** - Organize tasks by day (today/tomorrow)
- ✅ **Subtasks with Auto-completion** - Tasks auto-complete when all subtasks are done
- ✅ **Background & App-closed Survival** - Timers continue in background
- ✅ **Notification System** - Timer alerts and notifications
- ✅ **Persistent Storage** - SQLite backend with REST API
- ✅ **One-time Login** - Token-based authentication (no repeated auth)

## Tech Stack

### Frontend
- React Native (Expo)
- TypeScript
- Context API (single source of truth)
- Gesture Handler + Reanimated
- Expo Notifications
- Expo Background Tasks

### Backend
- Node.js + Express
- SQLite (primary persistence)
- REST APIs
- JWT Authentication

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator / Android Emulator / Physical Device

### Backend Setup

1. Navigate to server directory:
```bash
cd server
npm install
```

2. Start the backend server:
```bash
npm start
```

The server runs on `http://localhost:3000` by default.

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Start Expo:
```bash
npm start
```

3. For physical device testing, update `API_BASE_URL` in `src/services/api.ts` to use your computer's local IP address instead of `localhost`.

4. Run on iOS/Android:
```bash
npm run ios
# or
npm run android
```

## First Time Setup

1. Launch the app
2. You'll be prompted to login
3. Click "Don't have an account? Register" to create an account
4. After registration, you're logged in and will stay logged in (one-time login)

## Architecture

### Frontend Structure
```
src/
  ├── components/     # UI components
  ├── context/        # TaskContext (state management)
  ├── services/       # API, notifications, background tasks
  ├── storage/        # Local storage (legacy, now uses API)
  ├── types/          # TypeScript types
  └── utils/          # Utility functions
```

### Backend Structure
```
server/
  ├── index.js        # Express server
  ├── database.js     # SQLite setup
  ├── auth.js         # Authentication logic
  ├── tasks.js        # Task CRUD operations
  └── focus.js        # Focus history operations
```

## Key Features Explained

### Timer System
- Timers continue running when app is in background
- Background tasks sync timer state every 15 seconds
- Timer state persisted to SQLite database
- Notifications sent when timer completes

### Subtask Auto-completion
- When all subtasks are marked complete, parent task auto-completes
- Task status updates in real-time

### Day-based Scheduling
- Tasks scheduled for specific dates (YYYY-MM-DD)
- Exhausted tasks (timer finished) move to next day
- Completed tasks stay on their completion date

### Background Survival
- Uses Expo Task Manager and Background Fetch
- Timers sync with backend every 15 seconds minimum
- Works when app is closed (iOS/Android)

### Notifications
- Timer completion notifications
- Background sync notifications
- Permission handling included

## API Configuration

For physical device testing, update the API URL in `src/services/api.ts`:

```typescript
const API_BASE_URL = __DEV__
  ? 'http://YOUR_LOCAL_IP:3000'  // e.g., 'http://192.168.1.100:3000'
  : 'https://your-production-api.com'
```

## Development

- Backend auto-reload: `cd server && npm run dev`
- Frontend: `npm start` (Expo dev server)
- Linting: `npm run lint`

## Production Deployment

### Backend
1. Set `JWT_SECRET` environment variable
2. Deploy to your server (Heroku, Railway, AWS, etc.)
3. Update `API_BASE_URL` in frontend

### Frontend
1. Build with Expo: `expo build`
2. Submit to App Store / Play Store
3. Configure production API URL

## License

Private - All rights reserved
