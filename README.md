# Crypto-Tracker

A responsive application that simulates **real-time cryptocurrency price tracking** similar to CoinMarketCap. It features a clean, interactive UI, live updates via a simulated WebSocket, and full state management using Redux Toolkit.

🌐 **Live Demo**: [https://crypto-tracker-hj.vercel.app]
---

## 🎯 Objective

Build a modern front-end application that:
- Displays a table of top 5 cryptocurrencies (e.g., BTC, ETH, USDT).
- Simulates live price updates using a mocked WebSocket.
- Manages all application state via Redux Toolkit.

---

## 🛠️ Tech Stack

- **Frontend**: [Next.js 14]
- **React**: [React 18]
- **Language**: [TypeScript]
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Mocking**: `setInterval` for WebSocket simulation

---

## 🧱 Features

### 📊 Crypto Table UI
| # | Logo | Name | Symbol | Price | 1h % | 24h % | 7d % | Market Cap | 24h Volume | Circulating Supply | Max Supply | 7D Chart |
|---|------|------|--------|-------|------|--------|------|-------------|-------------|---------------------|-------------|-----------|

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
git clone https://github.com/your-username/crypto-tracker.git
cd crypto-tracker

# 2. Install dependencies
npm install

# 3. Run the development server
npm run dev

# 4. Open in browser
http://localhost:3000
