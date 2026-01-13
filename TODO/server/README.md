# Todo App Backend Server

Node.js + Express + SQLite backend server for the Todo App.

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will start on port 3000 (or PORT environment variable).

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Tasks
- `GET /api/tasks` - Get all tasks (optional query: `?scheduledDate=YYYY-MM-DD`)
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/toggle` - Toggle task completion
- `POST /api/tasks/:id/start` - Start task timer
- `POST /api/tasks/:id/pause` - Pause task timer
- `PUT /api/tasks/:id/timer` - Update timer state
- `POST /api/tasks/:id/subtasks` - Add subtask
- `POST /api/tasks/:taskId/subtasks/:subtaskId/toggle` - Toggle subtask
- `DELETE /api/tasks/:taskId/subtasks/:subtaskId` - Delete subtask
- `PUT /api/tasks/reorder` - Reorder tasks

### Focus
- `GET /api/focus` - Get focus history (optional query: `?date=YYYY-MM-DD`)
- `PUT /api/focus` - Update focus seconds

All endpoints except auth require Bearer token in Authorization header.

## Database

SQLite database is stored in `todo.db` in the server directory. The database is automatically initialized on first run.
