import type { Dispatch } from "@reduxjs/toolkit"
import { updateCryptos } from "./cryptoSlice"
import type { Crypto } from "./types"

// Generate random price fluctuations
function generateRandomPriceChange(currentPrice: number): number {
  const changePercent = (Math.random() * 2 - 1) * 0.005 // -0.5% to +0.5%
  return currentPrice * (1 + changePercent)
}

// Generate random percentage changes
function generateRandomPercentChange(currentPercent: number): number {
  const change = (Math.random() * 2 - 1) * 0.2 // -0.2% to +0.2%
  return currentPercent + change
}

// Generate random volume changes
function generateRandomVolumeChange(currentVolume: number): number {
  const changePercent = (Math.random() * 2 - 1) * 0.01 // -1% to +1%
  return currentVolume * (1 + changePercent)
}

// Update sparkline data
function updateSparkline(currentSparkline: number[], newPrice: number): number[] {
  const newSparkline = [...currentSparkline.slice(1), newPrice]
  return newSparkline
}

export function startWebSocketSimulation(dispatch: Dispatch, cryptos: Crypto[]) {
  // Simulate WebSocket connection with setInterval
  const intervalId = setInterval(() => {
    // Get current state from the store
    const cryptoUpdates = [] as Partial<Crypto>[]

    // For each crypto in the store, generate random updates
    // In a real app, this would come from the WebSocket
    cryptos.forEach((crypto) => {
      if (!crypto || !crypto.id) return

      // Get current crypto data
      const currentPrice = crypto.current_price
      const currentChange1h = crypto.price_change_percentage_1h_in_currency
      const currentChange24h = crypto.price_change_percentage_24h
      const currentChange7d = crypto.price_change_percentage_7d_in_currency
      const currentVolume24h = crypto.total_volume
      const currentSparkline = crypto.sparkline_in_7d?.price || []

      // Generate new values
      const newPrice = generateRandomPriceChange(currentPrice)
      const newChange1h = generateRandomPercentChange(currentChange1h)
      const newChange24h = generateRandomPercentChange(currentChange24h)
      const newChange7d = generateRandomPercentChange(currentChange7d)
      const newVolume24h = generateRandomVolumeChange(currentVolume24h)
      const newSparkline = updateSparkline(currentSparkline, newPrice)

      // Add to updates array
      cryptoUpdates.push({
        id: crypto.id,
        current_price: newPrice,
        price_change_percentage_1h_in_currency: newChange1h,
        price_change_percentage_24h: newChange24h,
        price_change_percentage_7d_in_currency: newChange7d,
        total_volume: newVolume24h,
        sparkline_in_7d: { price: newSparkline },
      })
    })

    // Dispatch updates to Redux store
    dispatch(updateCryptos(cryptoUpdates))
  }, 800) // Update more frequently (every 800ms) for real-time feel

  // Return a cleanup function
  return () => clearInterval(intervalId)
}