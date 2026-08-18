# SyncFlow

A collaborative code editor application built with React, Vite, Express, Socket.IO, Yjs, and Monaco. It allows multiple users to join a shared editing session, see who is online, and work on the same document in real time.

This project includes:
- A React + Vite frontend for the editor UI
- An Express backend with Socket.IO and Yjs synchronization
- AWS identity health checks via STS
- Docker support for running the app as a single container

---

## Project Overview

The app lets users enter a display name and join a synchronized editor session. Once joined, the Monaco editor stays in sync across connected clients using Yjs awareness and Socket.IO collaboration.

Core features:
- Shared collaborative text editing
- User list with names from the session
- Real-time updates across clients
- Backend health endpoints
- AWS status check for deployment validation

---

## Tech Stack

Frontend:
- React 19
- Vite
- Monaco Editor
- Yjs
- Socket.IO client integration
- Tailwind CSS

Backend:
- Node.js
- Express
- Socket.IO
- Yjs server support
- AWS SDK for STS

Containerization:
- Docker
- Multi-stage Dockerfile

---

## Repository Structure

```text
Docker-Aws/
├── README.md
├── dockerfile
├── Backend/
│   ├── package.json
│   ├── server.js
│   └── public/
│       └── index.html
├── Frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── eslint.config.js
│   ├── public/
│   └── src/
│       ├── main.jsx
│       └── app/
│           ├── App.jsx
│           └── App.css
└── .gitignore (if present in your local repo)
```

---

## Prerequisites

Before running the project, install:
- Node.js 20 or newer
- npm
- Docker (optional, for containerized deployment)

---

## Backend Setup

From the project root:

```bash
cd Backend
npm install
npm run dev
```

The backend runs on port 3000 by default.

Environment variables:
- PORT: backend port (default: 3000)
- AWS_REGION or AWS_DEFAULT_REGION: used for AWS STS lookup

Example:

```bash
PORT=3000
AWS_REGION=us-east-1
```

---

## Frontend Setup

From the project root:

```bash
cd Frontend
npm install
npm run dev
```

The Vite dev server usually runs at:

```text
http://localhost:5173
```

The frontend is configured to connect to the backend at:

```text
http://localhost:3000
```

---

## Running the Application

### Option 1: Run backend and frontend separately

1. Start the backend:

```bash
cd Backend
npm run dev
```

2. Start the frontend:

```bash
cd Frontend
npm run dev
```

3. Open the frontend in the browser and enter your name to join the shared editor.

### Option 2: Run with Docker

From the project root:

```bash
docker build -t syncflow .
docker run -p 4000:3000 -e AWS_REGION=us-east-1 syncflow
```

This Dockerfile builds the frontend, copies the production bundle into the backend public folder, and serves the app through the backend on port 3000.

---

## Available Scripts

### Backend

```bash
cd Backend
npm run dev    # runs with nodemon
npm start      # starts production server
```

### Frontend

```bash
cd Frontend
npm run dev    # starts Vite dev server
npm run build  # creates production build
npm run preview # previews built app
npm run lint   # runs ESLint checks
```

---

## API Endpoints

The backend exposes these routes:

### Health check

```http
GET /health
```

Returns:

```json
{
  "message": "ok",
  "success": true
}
```

### AWS health check

```http
GET /aws/health
```

Returns AWS identity details if configured correctly:

```json
{
  "success": true,
  "aws": {
    "ok": true,
    "region": "us-east-1",
    "account": "123456789012",
    "arn": "arn:aws:iam::123456789012:user/example",
    "userId": "AIDATESTUSER"
  }
}
```

If AWS credentials or region are missing, the response returns an error with details.

---

## Collaboration Behavior

The app uses Yjs and awareness to synchronize shared text state among clients.

Important notes:
- Users join by entering a username in the frontend
- Each client stores local awareness state with its username
- The backend uses Socket.IO and Yjs server support for real-time data syncing
- The editor state is bound to Monaco through `MonacoBinding`

---

## Docker Notes

The Docker image performs the following:
1. Installs frontend dependencies
2. Builds the React app
3. Copies the built frontend bundle to the backend's public folder
4. Installs backend production dependencies
5. Starts the backend with `npm start`

This is useful for deploying the app as a single service.

---

## Production Notes

For production deployment, ensure:
- The backend can access AWS credentials if `/aws/health` is used
- Required environment variables are set
- The app is served from the backend on port 3000
- CORS is configured correctly for cross-origin Socket.IO traffic

---

## Troubleshooting

### Frontend cannot connect to backend
- Make sure the backend is running on port 3000
- Confirm the frontend is pointing to `http://localhost:4000`
- Check browser console and backend terminal logs

### AWS health endpoint fails
- Verify `AWS_REGION` or `AWS_DEFAULT_REGION` is set
- Ensure your machine or container has valid AWS credentials
- Confirm the IAM principal has permission to call STS `GetCallerIdentity`

### Docker build issues
- Run `docker build` from the project root
- Ensure both `Frontend` and `Backend` directories are present
- Check Node version compatibility

---

## Summary

SyncFlow is a lightweight collaborative editing app that combines React, Monaco, Yjs, and Socket.IO for real-time multi-user editing with a simple backend health and AWS validation layer. It is ready for local development and can also be containerized with Docker for deployment.

---

## License

This project currently does not specify a custom license in the package metadata. Check with the repository owner or add your preferred license before production use.
