# 🌿 PlantTrust — Blockchain-Powered Deed Verification (PoC)

A full-stack Proof of Concept demonstrating the complete data pipeline from a React frontend through an Express backend, integrating OCR text extraction, XRPL blockchain anchoring, and PostgreSQL storage.

## Architecture

```
[React SPA Frontend]
        │  (Uploads Deed / Submits Form via HTTP Fetch)
        ▼
[Express Backend API]
   ├──► [Tesseract.js OCR Engine] ── (Extracts Text from Deed)
   ├──► [XRPL Blockchain]         ── (Hashes Text & Anchors to Testnet)
   └──► [PostgreSQL Database]      ── (Saves Record & TX Hash)
```

## Tech Stack

| Layer      | Technology          | Purpose                                   |
| ---------- | ------------------- | ----------------------------------------- |
| Frontend   | React + Vite        | SPA with file upload & results display    |
| Backend    | Node.js + Express   | REST API orchestrating all modules        |
| OCR        | Tesseract.js        | Text extraction from deed images          |
| Blockchain | xrpl.js (XRPL)      | SHA-256 hashing & Testnet memo anchoring  |
| Database   | PostgreSQL + pg     | ACID-compliant record storage             |

## Prerequisites

- **Node.js** v18+ and npm
- **PostgreSQL** installed and running locally
- Internet connection (for XRPL Testnet faucet)

## Setup & Run

### 1. Database Setup

```bash
# Connect to PostgreSQL and create the database
psql -U postgres
CREATE DATABASE planttrust;
\q
```

### 2. Backend (Express Server)

```bash
cd server

# Create your .env file (or edit the existing one)
# Default values: DB_HOST=localhost, DB_PORT=5432, DB_USER=postgres, DB_PASSWORD=postgres, DB_NAME=planttrust

npm install
npm start
# Server runs on http://localhost:3001
```

### 3. Frontend (React SPA)

```bash
cd client
npm install
npm run dev
# App runs on http://localhost:5173
```

### 4. Test the Pipeline

1. Open `http://localhost:5173` in your browser
2. Upload a deed image (JPG, PNG, etc.)
3. Wait for the pipeline to complete (~15–30 seconds)
4. View extracted text, SHA-256 hash, and click the XRPL Explorer link

## API Endpoints

### `GET /api/health`
Health check endpoint.

### `POST /api/deed`
Upload a deed image for processing.

- **Content-Type**: `multipart/form-data`
- **Field**: `deed` (file)
- **Response**: JSON with extracted text, SHA-256 hash, XRPL TX hash, explorer URL, and database record ID.

## Environment Variables (server/.env)

```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=planttrust
XRPL_NETWORK=wss://s.altnet.rippletest.net:51233
```

## Project Structure

```
PlantTrust/
├── client/                    # React SPA (Vite)
│   ├── src/
│   │   ├── App.jsx            # Main application component
│   │   ├── components/
│   │   │   ├── FileUpload.jsx # Drag-and-drop file upload
│   │   │   └── ResultsDisplay.jsx # Pipeline results viewer
│   │   ├── App.css
│   │   └── index.css          # Global design system
│   ├── index.html
│   └── package.json
│
├── server/                    # Express Backend
│   ├── index.js               # Server entry point
│   ├── routes/
│   │   └── deed.js            # POST /api/deed pipeline
│   ├── modules/
│   │   ├── ocr.js             # Tesseract.js OCR engine
│   │   ├── blockchain.js      # XRPL transaction logic
│   │   └── database.js        # PostgreSQL queries
│   ├── .env                   # Environment config
│   └── package.json
│
└── README.md
```

## Technical Justifications

### React SPA vs. Next.js
We chose a pure React SPA over Next.js to enforce strict architectural boundaries. Separating React from Express forces true REST API calls with CORS, fulfilling the requirement to demonstrate how frontends and backends connect. PlantTrust is primarily an authenticated dashboard, so Next.js's SSR/SEO benefits are not required for the MVP.

### Express vs. Django
Express was selected for its lightweight, un-opinionated nature and the advantage of keeping the entire stack in JavaScript, reducing the team's learning curve. The API is defined as the HTTP contract between the React client and the Express server.

### PostgreSQL vs. MongoDB
A relational SQL database was chosen for ACID compliance (Atomicity, Consistency, Isolation, Durability). A financial escrow state machine cannot risk the flexible, schema-less nature of MongoDB. The `plant_records` table enforces strict data types and constraints.

## License

ISC
