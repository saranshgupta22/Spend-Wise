# SpendWise 🚀

## 📖 Project Overview
SpendWise is a comprehensive, visually immersive "Spatial Fintech" personal finance application. It aims to provide users with a luxury-grade, high-performance command center for tracking their expenses, monitoring subscriptions, analyzing financial health, and scanning receipts. Built with a robust backend and an interactive frontend, SpendWise empowers users to manage their finances effortlessly with modern UI/UX design.

## 🛠 Tech Stack Used

**Frontend (Mobile App):**
- **React Native (Expo):** Core framework for building the universal mobile application.
- **NativeWind (Tailwind CSS):** For styling and consistent UI utility classes.
- **React Native Reanimated & Skia:** For high-performance, fluid micro-animations and custom graphics.
- **Zustand:** For global state management.
- **TanStack React Query:** For data fetching, caching, and state synchronization.

**Backend (Server & Database - DBMS):**
- **Node.js & Express:** For the RESTful API server.
- **Database:** SQLite (development) and MySQL (production-ready) managed via **Sequelize ORM**.
- **Authentication:** JWT (JSON Web Tokens) and bcrypt for secure user authentication.
- **Firebase Admin:** For push notifications and additional backend services.
- **Twilio:** For SMS notifications and verifications.

## ✨ Features and Functionality
- **User Authentication:** Secure signup and login with encrypted passwords.
- **Interactive Dashboard:** A visual command center showing total balance, income, and expenses with fluid animations.
- **Receipt Scanner:** Built-in spatial scanner to extract and log data directly from physical receipts.
- **Financial Health Report:** Deep analytics and insights into user spending habits.
- **Expense Ledger & Tracking:** Add, categorize, and track daily expenses and income.
- **BankWise Integration:** A centralized view for managing bank and financial connections.
- **Dark Mode Aesthetic:** Premium glassmorphic design system tailored for "Spatial Intelligence."

## 🚀 Steps to Run the Project

### Prerequisites
- [Node.js](https://nodejs.org/) installed (v18+ recommended)
- [npm](https://www.npmjs.com/) or yarn installed
- [Expo Go](https://expo.dev/go) app installed on your physical device, or an iOS Simulator / Android Emulator set up.

### 1. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install backend dependencies:
   ```bash
   npm install
   ```
3. Set up the environment variables:
   - Copy `.env.example` to `.env` and fill in your database credentials and secret keys.
4. Start the backend server:
   ```bash
   node server.js
   ```
   *(Ensure the database is running or the SQLite file is accessible).*

### 2. Frontend Setup
1. Open a new terminal and navigate to the root directory of the project:
   ```bash
   # Make sure you are in the Spendwise-main directory
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npm run start
   ```
4. Scan the QR code shown in the terminal using the **Expo Go** app on your physical device, or press `i` for iOS simulator or `a` for Android emulator.

---

### 👥 Group Members
1. AGAM GHOTRA - IIT2024226
2. JASHAN GOYAL - IIT2024223
3. SARANSH GUPTA - IIB2024030
4. CHUNIT BANSAL - IIT2024233
5. PARAS BANSAL - IIT2024221
