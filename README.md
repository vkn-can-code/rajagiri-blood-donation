# RLyfe - Rajagiri Blood Donation Platform

RLyfe is a comprehensive blood donation management web application designed for academic institutions and communities. The platform streamlines urgent blood requirement requests, blood donation camps, donor eligibility tracking, automated communications, and academic/faculty verification workflows.

---

## 🚀 Features

- **Urgent Blood Requests**: Public and authenticated blood requests with compatibility matching, urgency categorization, and hospital/location tracking.
- **Blood Donation Camps**: Management and public registration for institutional blood donation drives with eligibility screening questionnaires.
- **Role-Based Access Control**:
  - **Super Admin & Admin**: Full operations management (users, departments, batches, blood requests, donation camps, email templates, system history, and analytics).
  - **Faculty Admin (HoD / Class Tutor)**: Class batch monitoring, verification and approval of student donation certificates.
  - **Student / Donor**: Profile management, donation history tracking, certificate uploads, eligibility reminders, and urgent request response.
  - **Volunteer**: On-site camp data entry and donor assistance.
- **Automated Email Notifications**: Periodic eligibility reminders (90-day cooldown), urgent blood request alerts, certificate review notices, and monthly administration reports.

---

## 🛠️ Tech Stack

- **Frontend**: React (Create React App), React Router v6, Axios, Lucide React, Leaflet & React-Leaflet.
- **Backend**: Node.js, Express.js, Sequelize ORM, PostgreSQL.
- **Authentication**: JWT (JSON Web Tokens), bcryptjs password hashing.
- **Mailing**: Nodemailer (SMTP / Gmail service integration).
- **File Uploads**: Multer for certificate and document processing.

---

## 📋 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [PostgreSQL](https://www.postgresql.org/) (v14 or higher)
- `npm` or `yarn`

---

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Configure your database credentials, JWT secret, and email service settings.

4. Initialize database schema:
   ```bash
   psql -U postgres -d rajagiri_blood_db -f ../schema.sql
   ```
   *(Or run migrations using Sequelize CLI)*:
   ```bash
   npx sequelize-cli db:migrate
   ```

5. (Optional) Seed initial administrator and dummy data:
   ```bash
   npm run seed:admin
   npm run seed:data
   ```

6. Start the backend development server:
   ```bash
   npm start
   ```
   The backend server runs on `http://localhost:3001`.

---

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Start the frontend application:
   ```bash
   npm start
   ```
   The app will open at `http://localhost:3000`.

---

## 🔒 Security & Privacy

- Sensitive credentials, secrets, and individual environment configs are excluded via `.gitignore`.
- Password hashes and reset tokens are securely hashed and salted.
- Never commit active `.env` files or real database dumps containing personal identifying information (PII) to source control.

---

## 📄 License

This project is licensed under the ISC License.
