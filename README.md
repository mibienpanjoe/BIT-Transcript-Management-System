# BIT Transcript Management System (BIT TMS)

BIT TMS is a MERN application for managing academic structures, grades, attendance, and transcript generation for the Burkina Institute of Technology.

## Project Layout

```
bit-tms/
├── backend/   # Node.js + Express API
├── frontend/  # React + Vite client
└── docs/      # Product, developer, and user documentation
```

## Quick Start (Local)

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Backend runs on `http://localhost:5000` and frontend on `http://localhost:5173`.

## Docker (Optional)

```bash
docker compose up --build
```

## Documentation

Start here: `docs/README.md`.

## Utility Scripts

Scripts live under `backend/scripts/`. For example:

```bash
node backend/scripts/createAdmin.js
```

See `docs/developer/` for details.
