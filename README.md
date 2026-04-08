# 🏛️ Yogyatha: Automated Entitlement Intelligence Platform
> Bridging the digital divide for rural citizens through automated data extraction, deterministic eligibility matching, and localized interfaces.

![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue)
![Python](https://img.shields.io/badge/Extraction-Python%20%7C%20Selenium-yellow)
![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)

## 🎯 The Mission
Millions of rural citizens, particularly in communities like Tadikonda, remain unaware of or unable to navigate complex government welfare portals. **Yogyatha** (meaning "Eligibility" or "Worthiness") is a centralized command hub designed to solve this. Instead of forcing users to search through dense government documentation, Yogyatha automates the extraction of scheme data and mathematically matches it against a citizen's demographic profile to guarantee accurate, localized entitlement discovery.

---

## ⚙️ System Architecture & Data Flow

Yogyatha operates on a dual-pipeline architecture, separating the heavy data-gathering processes from the lightning-fast user interface.

### 1. The Extraction Pipeline (Backend/Scraper)
* **Headless Navigation:** A Python-based Selenium automation script securely connects to government portals (e.g., myscheme.gov.in).
* **Semantic Parsing:** The script navigates the DOM to extract raw scheme descriptions, required documents, and critical demographic limits (Min/Max Age, Income Ceilings, Gender Requirements).
* **Data Sanitization & Injection:** Extracted intel is formatted into structured JSON and seamlessly injected directly into the MongoDB Atlas cloud database via automated REST endpoints.

### 2. The Delivery Pipeline (Frontend/User Hub)
* **Deterministic Matching Logic:** When a citizen logs in, the Node.js backend compares their `UserProfile` (Age, Income, Gender, State, Disability Status) against the precise rules of every scraped scheme.
* **Polyglot Interface:** Utilizing `react-i18next`, the interface instantly translates complex navigation and matching parameters into local languages (Telugu/Hindi/English) to ensure accessibility for non-English speakers.
* **Zero-Latency Infrastructure:** The backend API is sustained 24/7 via automated keep-alive cron-jobs, preventing cloud-server sleep cycles and ensuring instant access for rural internet connections.

---

## ✨ Core Features

* **Real-Time Match Confidence:** Citizens do not just see a list of schemes; they see *why* they match. The engine highlights exact eligibility criteria and flags missing profile data that might unlock new entitlements.
* **The Civilian Vault (Saved Schemes):** Users can bookmark specific schemes, creating a persistent, personalized checklist of required documents for offline application at local government offices.
* **Administrative Telemetry:** A dedicated, secured admin dashboard allows system operators to trigger the Python scraper, manually edit scheme intelligence, and oversee database health.
* **Stateless JWT Authentication:** Secure, encrypted login sessions ensure citizen demographic data remains private and protected.

---

## 💻 Tech Stack Breakdown

### Frontend (Client-Side)
* **Framework:** React.js
* **Styling:** Tailwind CSS
* **Localization:** `react-i18next`
* **State Management:** React Hooks & Context API
* **Deployment:** Vercel

### Backend (Server-Side)
* **Environment:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB Atlas (NoSQL)
* **Authentication:** JSON Web Tokens (JWT) & bcrypt.js
* **Deployment:** Render (with Cron-job automated wake cycles)

### Intelligence Engine (Web Scraper)
* **Language:** Python 3
* **Automation:** Selenium WebDriver
* **Parsing:** BeautifulSoup / Regex

---

## 🚀 Local Installation & Setup

### Prerequisites
* Node.js (v16+)
* Python (v3.9+)
* MongoDB Atlas Account (or local MongoDB server)
* Chrome WebDriver (for Selenium)

### 1. Clone the Repository
```bash
git clone [https://github.com/sanjayrahuljanga/yogyatha.git](https://github.com/sanjayrahuljanga/yogyatha.git)
cd yogyatha
2. Backend Environment Setup
Navigate to the backend directory and configure the server.

Bash
cd backend
npm install
Create a .env file in the /backend root:

Code snippet
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_random_secret_key
Start the backend server:

Bash
npm run server
3. Frontend Environment Setup
Open a new terminal and configure the React application.

Bash
cd frontend
npm install
Start the React development server:

Bash
npm start
4. Scraper Initialization (Optional)
To run the automated extraction engine locally:

Bash
cd backend/scraper
pip install selenium webdriver-manager
python scrape_schemes.py
📅 Project Development Lifecycle
Planning & Research: Community consultation (Tadikonda) and parameter definition.

System Design: UI/UX polyglot wireframing and MongoDB schema architecture.

Development: MERN stack coding, JWT routing, and Python scraper integration.

Testing & Debugging: Cross-referencing matching logic against dummy profiles; cloud environment stabilization.

Deployment: Vercel/Render cloud launch, community pilot testing, and finalize documentation.
