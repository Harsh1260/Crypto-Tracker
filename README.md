# Crypto-Tracker

[![GitHub stars](https://img.shields.io/github/stars/Harsh1260/crypto-tracker?style=social)](https://github.com/Harsh1260/crypto-tracker/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Harsh1260/crypto-tracker?style=social)](https://github.com/Harsh1260/crypto-tracker/network/members)
[![GitHub issues](https://img.shields.io/github/issues/Harsh1260/crypto-tracker)](https://github.com/Harsh1260/crypto-tracker/issues)
[![LinkedIn](https://img.shields.io/badge/Connect-Harsh%20Jain-blue?logo=linkedin)](https://www.linkedin.com/in/harsh-jain-b071b424a/)
![Visitor Count](https://komarev.com/ghpvc/?username=Harsh1260&label=Profile%20views&color=0e75b6&style=flat)

---

A responsive application that simulates **real-time cryptocurrency price tracking** similar to CoinMarketCap. It features a clean, interactive UI, live updates via a simulated WebSocket, and full state management using Redux Toolkit.

🌐 **Live Demo**: [Vercel](https://crypto-tracker-gilt-alpha.vercel.app/)
**Video Demo**: [Drive Link](https://drive.google.com/file/d/1Qj1SBMsNiTnL2HiU5Uew5OEOd8UIWGXS/view?usp=sharing)

---

## 🎯 Objective

Build a modern front-end application that:
- Displays a table of top 5 cryptocurrencies (e.g., BTC, ETH, USDT).
- Simulates live price updates using a mocked WebSocket.
- Manages all application state via Redux Toolkit.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14
- **React**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Mocking**: `setInterval` for WebSocket simulation

---

## 🧱 Features

- Color-coded % changes:
  - 🟢 Green = Positive
  - 🔴 Red = Negative
- Fully **responsive design**
- **Static 7D chart**

### 🔄 Real-Time Updates
- Simulated using `setInterval`
- Every 1–2 seconds, randomly update:
  - Price
  - % changes
  - 24h Volume
- Uses **Redux actions only**, no local component state

### 🧠 Redux State Management
- Built using `createSlice` and `configureStore`
- Centralized global store for all crypto asset data
- Optimized re-renders using **selectors**

---

## 🚀 Setup Instructions

```bash
# 1. Clone the repository
git clone https://github.com/Harsh1260/crypto-tracker.git
cd crypto-tracker

# 2. Install dependencies
npm install

# 3. Run the development server
npm run dev

# 4. Open in browser
http://localhost:3000
