# SevaSetu  🤝
> **A Digital Bridge Between Care and Need**

SevaSetu connects donors directly with verified orphanages and old-age homes across India, ensuring complete transparency, trust, and direct impact without middlemen.

---

## ✨ Key Features

- **Unified Role-Based Authentication**:
  - Donors, Orphanages, Old-Age Homes, and Admins can seamlessly register and log in.
  - Automatic dashboard redirection based on role.

- **Admin Approval & Verification Workflow**:
  - New organization registrations enter a pending queue.
  - Dedicated Admin Portal for reviewing and approving/rejecting care homes.
  - Real-time status sync via WebSockets.

- **Direct Online Donations with Razorpay**:
  - Secure integration with Razorpay Checkout for direct monetary contributions.
  - Instant verifiable 80G tax exemption receipt generation.

- **Real-Time Live Chat**:
  - Live customer support chat widget powered by Socket.io.
  - Direct communication between donors, homes, and support staff.

- **Password Reset via Registered Email**:
  - 6-digit OTP verification powered by Nodemailer.
  - Secure password reset flow with timing expirations.

- **Needs & Inventory Posting**:
  - Care homes can list real-time urgent needs (Food, Medicine, Education, Clothes).
  - Donors can browse and fulfill specific requirements.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3 (Modern Glassmorphic UI), JavaScript (ES6+), FontAwesome Icons
- **Backend**: Node.js & Express.js
- **Database**: Native SQLite (`sevasetu.db`)
- **Real-Time Engine**: Socket.io (WebSockets)
- **Payment Processing**: Razorpay Node SDK
- **Mailing**: Nodemailer (SMTP / Gmail)

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/sevasetu.git
cd sevasetu
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Copy the example environment file:
```bash
cp .env.example .env
```
Open `.env` and fill in your configuration:
```env
PORT=5000
JWT_SECRET=your_jwt_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 4. Run the Server
```bash
npm start
```
The server will start on `http://localhost:5000` and automatically initialize the SQLite database tables.

### 5. Open the Application
Open `Homepage.html` in your browser or serve it via a local web server:
- Default Admin Email: `admin@sevasetu.org`
- Default Admin Password: `admin123`

---

## 📂 Project Structure
```text
├── Dashboard/               # Donor dashboard, Payment, History, Receipts
├── legal-links/             # Terms, Privacy Policy, Help, About, Contact
├── old-ageDashbord/         # Old-age home management portal
├── Registration/            # Registration views for Donors & Care Homes
├── Homepage.html            # Main landing page & unified authentication modal
├── admin.html               # Admin portal & verification review panel
├── orphanage.html           # Orphanage management dashboard
├── Role.html                # Role selection portal
├── forgot-password.html     # OTP email verification & password reset
├── server.js                # Full Node/Express API server & Socket.io backend
├── chat-widget.js           # Live floating chat client
├── realtime.js              # Socket.io notification & synchronization client
├── .gitignore               # Files excluded from git tracking
├── .env.example             # Environment configuration template
└── README.md                # Project documentation
```

---

## 📄 License
This project is licensed under the ISC License.
