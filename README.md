# ⛓ CertChain — Blockchain-Based Event Certificate Generator

A modern, full-stack web application for generating, issuing, and verifying digital certificates using blockchain technology. Tamper-proof, secure, and professional.

![Tech Stack](https://img.shields.io/badge/React-18-blue?logo=react)
![Tech Stack](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)
![Tech Stack](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen?logo=mongodb)
![Tech Stack](https://img.shields.io/badge/Blockchain-SHA256-orange)

---

## 🚀 Features

### Admin Dashboard
- 📊 Analytics overview (events, participants, certificates, blockchain blocks)
- 📅 Create & manage events with full CRUD operations
- 👥 Add participants manually or via CSV upload (drag & drop)
- 📜 Generate certificates for all participants in one click
- 📋 Activity logging for all actions

### Certificate Generation
- 🎨 Professional PDF certificates (A4 landscape) with blue/gold design
- 📱 QR codes embedded in every certificate for instant verification
- 🔒 SHA-256 hash of certificate data stored on blockchain
- 📥 Download certificates as PDF

### Blockchain Integration
- ⛓ Simulated blockchain ledger with SHA-256 hashing
- 🔗 Each certificate gets a unique transaction hash
- ✅ Chain integrity verification
- 📋 Block details viewable in verification portal

### Public Verification Portal
- 🔍 Verify any certificate by ID or QR code scan
- ✅ Shows "Valid / Invalid" status with blockchain proof
- 📋 Displays full certificate details + blockchain transaction info
- 📥 Download verified certificate PDF

### Security
- 🔐 JWT-based authentication
- 🔒 Bcrypt password hashing
- 🛡️ SHA-256 certificate data hashing
- 🚫 Duplicate prevention (participant per event)

---

## 📁 Folder Structure

```
EVENT/
├── backend/
│   ├── server.js              # Express server entry
│   ├── .env                   # Environment config
│   ├── package.json
│   ├── models/
│   │   ├── Admin.js           # Admin user model
│   │   ├── Event.js           # Event model
│   │   ├── Participant.js     # Participant model
│   │   ├── Certificate.js     # Certificate model
│   │   └── ActivityLog.js     # Activity log model
│   ├── routes/
│   │   ├── authRoute.js       # Login/Register
│   │   ├── eventRoute.js      # Event CRUD
│   │   ├── participantRoute.js # Participants + CSV
│   │   ├── certificateRoute.js # Certificate generation
│   │   ├── verifyRoute.js     # Public verification
│   │   └── statsRoute.js      # Dashboard analytics
│   ├── middlewares/
│   │   └── authMiddleware.js  # JWT auth middleware
│   ├── services/
│   │   ├── blockchainService.js # Simulated blockchain
│   │   └── certificateService.js # PDF + QR + hashing
│   └── generated/             # Generated PDF certificates
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx            # Routing & layout
│       ├── index.css          # Complete design system
│       ├── context/
│       │   └── AuthContext.jsx # Auth state management
│       ├── services/
│       │   └── api.js         # API service layer
│       ├── components/
│       │   ├── Navbar.jsx
│       │   └── ToastProvider.jsx
│       └── pages/
│           ├── Landing.jsx    # Public landing page
│           ├── Login.jsx      # Admin login
│           ├── Register.jsx   # Admin registration
│           ├── VerifyPage.jsx # Public verification
│           └── admin/
│               ├── Dashboard.jsx    # Analytics dashboard
│               ├── Events.jsx       # Event management
│               ├── EventDetail.jsx  # Participants + certs
│               └── Certificates.jsx # All certificates
│
├── sample_participants.csv    # Sample CSV for testing
└── README.md
```

---

## 🛠️ Setup Instructions

### Prerequisites
- **Node.js** (v18 or higher) — [Download](https://nodejs.org/)
- **MongoDB** — [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/atlas)

### Step 1: Clone or Navigate to the Project
```bash
cd EVENT
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### Step 4: Start MongoDB
Make sure MongoDB is running locally on port 27017:
```bash
# If installed as a service, it may already be running.
# Otherwise:
mongod
```

Or update `backend/.env` with your MongoDB Atlas connection string.

### Step 5: Start the Backend Server
```bash
cd backend
npm run dev
```
You should see:
```
✅ Connected to MongoDB
🚀 Server running on http://localhost:5000
```

### Step 6: Start the Frontend Dev Server
Open a **new terminal**:
```bash
cd frontend
npm run dev
```
You should see:
```
  VITE v5.x.x  ready in XXms
  ➜  Local:   http://localhost:5173/
```

### Step 7: Open the App
Navigate to **http://localhost:5173** in your browser.

---

## 📋 Quick Start Guide

1. **Register** — Go to the app and click "Get Started" → Create an admin account
2. **Create Event** — In the dashboard, go to Events → Create Event
3. **Add Participants** — Click on your event → Upload the `sample_participants.csv` file (or add manually)
4. **Generate Certificates** — Click "Generate Certificates" to create PDFs and store hashes on blockchain
5. **Download PDFs** — Go to the Certificates tab and click "PDF" to download
6. **Verify** — Go to the Verification Portal and enter a Certificate ID to see blockchain verification

---

## 🔧 Environment Variables

Edit `backend/.env` to customize:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Backend server port |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/event-certificates` | MongoDB connection string |
| `JWT_SECRET` | `blockchain_cert_secret_key_2024` | JWT signing secret |
| `FRONTEND_URL` | `http://localhost:5173` | Frontend URL (for QR codes) |

---

## 🧪 Sample Data

A sample CSV file (`sample_participants.csv`) is included with 10 test participants. Use it to quickly test the CSV upload feature.

---

## 💡 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, Vanilla CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| PDF | pdf-lib |
| QR Codes | qrcode |
| CSV | csv-parser, multer |
| Blockchain | Custom SHA-256 chain (simulated) |

---

## 📜 License

This project is open-source and available under the MIT License.
