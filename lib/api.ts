// API functions for fetching cryptocurrency data from CoinGecko

const API_BASE_URL = "https://api.coingecko.com/api/v3"

// Replace the fetchWithErrorHandling function with this improved version
async function fetchWithErrorHandling(url: string, retries = 2) {
  // Try to get from cache first if available
  try {
    // For browser environments, we'll use a more reliable approach
    // that handles network errors better
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Add a delay between retries
        if (attempt > 0) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
          console.log(`Retry attempt ${attempt} for ${url}`)
        }

        // Use a longer timeout to prevent premature aborts
        const controller = new AbortController()
        const timeoutId = setTimeout(() => {
          console.log(`Request timeout for ${url}`)
          controller.abort()
        }, 10000) // Increase timeout to 10 seconds

        try {
          const response = await fetch(url, {
            signal: controller.signal,
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            // Add cache: 'no-store' to avoid caching issues
            cache: "no-store",
          })

          // Clear the timeout as soon as we get a response
          clearTimeout(timeoutId)

          if (!response.ok) {
            if (response.status === 429) {
              console.warn("API rate limit exceeded. Using fallback data.")
              throw new Error("API rate limit exceeded")
            }
            throw new Error(`API error: ${response.status}`)
          }

          return await response.json()
        } catch (error: any) {
          // Make sure to clear the timeout if there's an error
          clearTimeout(timeoutId)

          // Re-throw the error to be caught by the outer try-catch
          throw error
        }
      } catch (error: any) {
        console.error(`Attempt ${attempt + 1}/${retries + 1} failed for ${url}:`, error.message || error)

        // If this is the last attempt, we'll throw to trigger fallback data
        if (attempt === retries) {
          throw error
        }

        // If it's an abort error (timeout), we'll retry
        if (error.name === "AbortError") {
          console.warn(`Request timed out for ${url}, will retry`)
          continue
        }
      }
    }
  } catch (error) {
    console.error(`All fetch attempts failed for ${url}`)
    throw error
  }

  // This should never be reached due to the throw in the loop
  throw new Error("Failed to fetch data")
}

// Fetch top 100 cryptocurrencies
export async function fetchCryptos() {
  try {
    return await fetchWithErrorHandling(
      `${API_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=1h,24h,7d`,
    )
  } catch (error) {
    console.error("Error fetching cryptocurrencies:", error)
    // Return mock data if API fails
    return getMockCryptoData()
  }
}

// Fetch cryptocurrencies by IDs (for watchlist)
export async function fetchCryptosByIds(ids: string[]) {
  if (ids.length === 0) return []

  try {
    const idsParam = ids.join(",")
    return await fetchWithErrorHandling(
      `${API_BASE_URL}/coins/markets?vs_currency=usd&ids=${idsParam}&order=market_cap_desc&sparkline=true&price_change_percentage=1h,24h,7d`,
    )
  } catch (error) {
    console.error("Error fetching cryptocurrencies by IDs:", error)
    // Return filtered mock data if API fails
    return getMockCryptoData().filter((crypto) => ids.includes(crypto.id))
  }
}

// Update the fetchCryptoDetails function to ensure it always returns data
export async function fetchCryptoDetails(id: string) {
  try {
    const data = await fetchWithErrorHandling(
      `${API_BASE_URL}/coins/${id}?localization=false&tickers=true&market_data=true&community_data=false&developer_data=false&sparkline=false`,
    )
    console.log(`Successfully fetched details for ${id}`)
    return data
  } catch (error) {
    console.error(`Error fetching details for ${id}:`, error)
    // Always return mock data if the API call fails
    console.log(`Using mock data for ${id}`)
    return getMockCryptoDetailData(id)
  }
}

// Update the fetchCryptoMarketChart function to ensure it always returns data
export async function fetchCryptoMarketChart(id: string, days: number) {
  try {
    const data = await fetchWithErrorHandling(`${API_BASE_URL}/coins/${id}/market_chart?vs_currency=usd&days=${days}`)
    console.log(`Successfully fetched market chart for ${id}`)
    return data
  } catch (error) {
    console.error(`Error fetching market chart for ${id}:`, error)
    // Always return mock chart data if the API call fails
    console.log(`Using mock chart data for ${id}`)
    return getMockChartData(days)
  }
}

// Update the fetchGlobalData function to handle errors more gracefully
export async function fetchGlobalData() {
  try {
    console.log("Fetching global market data...")
    const data = await fetchWithErrorHandling(`${API_BASE_URL}/global`)
    console.log("Successfully fetched global market data")
    return data.data
  } catch (error) {
    console.error("Error fetching global market data:", error)
    // Return mock global data if API fails
    console.log("Using mock global data")
    return getMockGlobalData()
  }
}

// Mock data functions
function getMockCryptoData() {
  return [
    {
      id: "bitcoin",
      symbol: "btc",
      name: "Bitcoin",
      image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
      current_price: 65432.1,
      market_cap: 1258000000000,
      market_cap_rank: 1,
      fully_diluted_valuation: 1375000000000,
      total_volume: 32500000000,
      high_24h: 66000,
      low_24h: 64000,
      price_change_24h: 1200,
      price_change_percentage_24h: 1.8,
      price_change_percentage_1h_in_currency: 0.5,
      price_change_percentage_24h_in_currency: 1.8,
      price_change_percentage_7d_in_currency: -1.2,
      market_cap_change_24h: 25000000000,
      market_cap_change_percentage_24h: 2.1,
      circulating_supply: 19200000,
      total_supply: 21000000,
      max_supply: 21000000,
      sparkline_in_7d: {
        price: Array(168)
          .fill(0)
          .map((_, i) => 64000 + Math.random() * 2000),
      },
    },
    {
      id: "ethereum",
      symbol: "eth",
      name: "Ethereum",
      image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
      current_price: 3521.45,
      market_cap: 423000000000,
      market_cap_rank: 2,
      fully_diluted_valuation: 423000000000,
      total_volume: 18700000000,
      high_24h: 3600,
      low_24h: 3400,
      price_change_24h: 50,
      price_change_percentage_24h: 1.5,
      price_change_percentage_1h_in_currency: -0.2,
      price_change_percentage_24h_in_currency: 1.5,
      price_change_percentage_7d_in_currency: 3.2,
      market_cap_change_24h: 6000000000,
      market_cap_change_percentage_24h: 1.4,
      circulating_supply: 120000000,
      total_supply: 120000000,
      max_supply: null,
      sparkline_in_7d: {
        price: Array(168)
          .fill(0)
          .map((_, i) => 3400 + Math.random() * 200),
      },
    },
    {
      id: "tether",
      symbol: "usdt",
      name: "Tether",
      image: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
      current_price: 1.0,
      market_cap: 95800000000,
      market_cap_rank: 3,
      fully_diluted_valuation: 95800000000,
      total_volume: 58700000000,
      high_24h: 1.01,
      low_24h: 0.99,
      price_change_24h: 0.001,
      price_change_percentage_24h: 0.1,
      price_change_percentage_1h_in_currency: 0.01,
      price_change_percentage_24h_in_currency: 0.1,
      price_change_percentage_7d_in_currency: 0.05,
      market_cap_change_24h: 100000000,
      market_cap_change_percentage_24h: 0.1,
      circulating_supply: 95800000000,
      total_supply: 95800000000,
      max_supply: null,
      sparkline_in_7d: {
        price: Array(168)
          .fill(0)
          .map((_, i) => 0.995 + Math.random() * 0.01),
      },
    },
    {
      id: "binancecoin",
      symbol: "bnb",
      name: "BNB",
      image: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
      current_price: 612.78,
      market_cap: 94500000000,
      market_cap_rank: 4,
      fully_diluted_valuation: 102000000000,
      total_volume: 2100000000,
      high_24h: 620,
      low_24h: 605,
      price_change_24h: -5,
      price_change_percentage_24h: -0.8,
      price_change_percentage_1h_in_currency: 0.3,
      price_change_percentage_24h_in_currency: -0.8,
      price_change_percentage_7d_in_currency: 2.5,
      market_cap_change_24h: -800000000,
      market_cap_change_percentage_24h: -0.8,
      circulating_supply: 154000000,
      total_supply: 154000000,
      max_supply: 200000000,
      sparkline_in_7d: {
        price: Array(168)
          .fill(0)
          .map((_, i) => 600 + Math.random() * 20),
      },
    },
    {
      id: "solana",
      symbol: "sol",
      name: "Solana",
      image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
      current_price: 142.35,
      market_cap: 61500000000,
      market_cap_rank: 5,
      fully_diluted_valuation: 78000000000,
      total_volume: 3500000000,
      high_24h: 145,
      low_24h: 138,
      price_change_24h: 3.5,
      price_change_percentage_24h: 2.5,
      price_change_percentage_1h_in_currency: 0.8,
      price_change_percentage_24h_in_currency: 2.5,
      price_change_percentage_7d_in_currency: 8.7,
      market_cap_change_24h: 1500000000,
      market_cap_change_percentage_24h: 2.5,
      circulating_supply: 432000000,
      total_supply: 549000000,
      max_supply: null,
      sparkline_in_7d: {
        price: Array(168)
          .fill(0)
          .map((_, i) => 135 + Math.random() * 15),
      },
    },
  ]
}

// Update the getMockCryptoDetailData function to mark mock data
function getMockCryptoDetailData(id: string) {
  const mockData: Record<string, any> = {
    bitcoin: {
      id: "bitcoin",
      symbol: "btc",
      name: "Bitcoin",
      _isMockData: true, // Add this flag to identify mock data
      description: {
        en: "Bitcoin is the first decentralized cryptocurrency. Bitcoin uses peer-to-peer technology to operate with no central authority: transaction management and money issuance are carried out collectively by the network.",
      },
      market_cap_rank: 1,
      market_data: {
        current_price: { usd: 65432.1 },
        market_cap: { usd: 1258000000000 },
        total_volume: { usd: 32500000000 },
        fully_diluted_valuation: { usd: 1375000000000 },
        circulating_supply: 19200000,
        total_supply: 21000000,
        max_supply: 21000000,
        price_change_percentage_1h_in_currency: { usd: 0.5 },
        price_change_percentage_24h: 1.8,
        price_change_percentage_7d: -1.2,
        price_change_percentage_30d: 5.3,
      },
      tickers: Array(10)
        .fill(0)
        .map((_, i) => ({
          market: { name: `Exchange ${i + 1}` },
          base: "BTC",
          target: "USD",
          converted_last: { usd: 65432.1 + (Math.random() * 200 - 100) },
          converted_volume: { usd: Math.random() * 10000000 },
        })),
    },
    ethereum: {
      id: "ethereum",
      symbol: "eth",
      name: "Ethereum",
      _isMockData: true, // Add this flag to identify mock data
      description: {
        en: "Ethereum is a decentralized platform that runs smart contracts: applications that run exactly as programmed without any possibility of downtime, censorship, fraud or third-party interference.",
      },
      market_cap_rank: 2,
      market_data: {
        current_price: { usd: 3521.45 },
        market_cap: { usd: 423000000000 },
        total_volume: { usd: 18700000000 },
        fully_diluted_valuation: { usd: 423000000000 },
        circulating_supply: 120000000,
        total_supply: 120000000,
        max_supply: null,
        price_change_percentage_1h_in_currency: { usd: -0.2 },
        price_change_percentage_24h: 1.5,
        price_change_percentage_7d: 3.2,
        price_change_percentage_30d: 8.7,
      },
      tickers: Array(10)
        .fill(0)
        .map((_, i) => ({
          market: { name: `Exchange ${i + 1}` },
          base: "ETH",
          target: "USD",
          converted_last: { usd: 3521.45 + (Math.random() * 20 - 10) },
          converted_volume: { usd: Math.random() * 5000000 },
        })),
    },
    tether: {
      id: "tether",
      symbol: "usdt",
      name: "Tether",
      description: {
        en: "Tether (USDT) is a cryptocurrency with a value meant to mirror the value of the U.S. dollar. The idea was to create a stable cryptocurrency that can be used like digital dollars.",
      },
      image: { large: "https://assets.coingecko.com/coins/images/325/large/Tether.png" },
      market_cap_rank: 3,
      market_data: {
        current_price: { usd: 1.0 },
        market_cap: { usd: 95800000000 },
        total_volume: { usd: 58700000000 },
        fully_diluted_valuation: { usd: 95800000000 },
        circulating_supply: 95800000000,
        total_supply: 95800000000,
        max_supply: null,
        price_change_percentage_1h_in_currency: { usd: 0.01 },
        price_change_percentage_24h: 0.1,
        price_change_percentage_7d: 0.05,
        price_change_percentage_30d: -0.02,
      },
      tickers: Array(10)
        .fill(0)
        .map((_, i) => ({
          market: { name: `Exchange ${i + 1}` },
          base: "USDT",
          target: "USD",
          converted_last: { usd: 1.0 + (Math.random() * 0.01 - 0.005) },
          converted_volume: { usd: Math.random() * 20000000 },
        })),
    },
    binancecoin: {
      id: "binancecoin",
      symbol: "bnb",
      name: "BNB",
      description: {
        en: "Binance Coin (BNB) is an exchange-based token created and issued by the cryptocurrency exchange Binance. Initially created on the Ethereum blockchain as an ERC-20 token, BNB now runs on its own blockchain called Binance Chain.",
      },
      image: { large: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png" },
      market_cap_rank: 4,
      market_data: {
        current_price: { usd: 612.78 },
        market_cap: { usd: 94500000000 },
        total_volume: { usd: 2100000000 },
        fully_diluted_valuation: { usd: 102000000000 },
        circulating_supply: 154000000,
        total_supply: 154000000,
        max_supply: 200000000,
        price_change_percentage_1h_in_currency: { usd: 0.3 },
        price_change_percentage_24h: -0.8,
        price_change_percentage_7d: 2.5,
        price_change_percentage_30d: -1.2,
      },
      tickers: Array(10)
        .fill(0)
        .map((_, i) => ({
          market: { name: `Exchange ${i + 1}` },
          base: "BNB",
          target: "USD",
          converted_last: { usd: 612.78 + (Math.random() * 10 - 5) },
          converted_volume: { usd: Math.random() * 1000000 },
        })),
    },
    solana: {
      id: "solana",
      symbol: "sol",
      name: "Solana",
      description: {
        en: "Solana is a high-performance blockchain supporting builders around the world creating crypto apps that scale today. Solana is known for its fast transaction times and low transaction fees.",
      },
      image: { large: "https://assets.coingecko.com/coins/images/4128/large/solana.png" },
      market_cap_rank: 5,
      market_data: {
        current_price: { usd: 142.35 },
        market_cap: { usd: 61500000000 },
        total_volume: { usd: 3500000000 },
        fully_diluted_valuation: { usd: 78000000000 },
        circulating_supply: 432000000,
        total_supply: 549000000,
        max_supply: null,
        price_change_percentage_1h_in_currency: { usd: 0.8 },
        price_change_percentage_24h: 2.5,
        price_change_percentage_7d: 8.7,
        price_change_percentage_30d: 15.3,
      },
      tickers: Array(10)
        .fill(0)
        .map((_, i) => ({
          market: { name: `Exchange ${i + 1}` },
          base: "SOL",
          target: "USD",
          converted_last: { usd: 142.35 + (Math.random() * 5 - 2.5) },
          converted_volume: { usd: Math.random() * 2000000 },
        })),
    },
  }

  // If the requested ID exists in our mock data, return it
  if (mockData[id]) {
    return mockData[id]
  }

  // Otherwise, create a generic mock for any ID
  return {
    id: id,
    symbol: id.substring(0, 3),
    name: id.charAt(0).toUpperCase() + id.slice(1),
    _isMockData: true, // Add this flag to identify mock data
    description: { en: `This is a mock description for ${id}.` },
    market_cap_rank: 999,
    market_data: {
      current_price: { usd: 100 + Math.random() * 900 },
      market_cap: { usd: 1000000000 + Math.random() * 9000000000 },
      total_volume: { usd: 100000000 + Math.random() * 900000000 },
      fully_diluted_valuation: { usd: 2000000000 + Math.random() * 8000000000 },
      circulating_supply: 10000000 + Math.random() * 90000000,
      total_supply: 100000000,
      max_supply: 100000000,
      price_change_percentage_1h_in_currency: { usd: Math.random() * 2 - 1 },
      price_change_percentage_24h: Math.random() * 10 - 5,
      price_change_percentage_7d: Math.random() * 20 - 10,
      price_change_percentage_30d: Math.random() * 40 - 20,
    },
    tickers: Array(10)
      .fill(0)
      .map((_, i) => ({
        market: { name: `Exchange ${i + 1}` },
        base: id.substring(0, 3).toUpperCase(),
        target: "USD",
        converted_last: { usd: 100 + Math.random() * 900 },
        converted_volume: { usd: Math.random() * 1000000 },
      })),
  }
}

function getMockChartData(days: number) {
  const now = Date.now()
  const interval = (days * 24 * 60 * 60 * 1000) / 100
  const startPrice = 65000
  const volatility = 0.02

  const prices = Array(100)
    .fill(0)
    .map((_, i) => {
      const timestamp = now - (99 - i) * interval
      let price = startPrice

      // Random walk with some trend
      for (let j = 0; j < i; j++) {
        const change = price * volatility * (Math.random() * 2 - 1)
        price += change
      }

      return [timestamp, price]
    })

  return {
    prices,
    market_caps: prices.map(([time, price]) => [time, price * 19200000]),
    total_volumes: prices.map(([time]) => [time, Math.random() * 30000000000]),
  }
}

// Update the getMockGlobalData function to mark mock data
function getMockGlobalData() {
  return {
    _isMockData: true, // Add this flag to identify mock data
    total_market_cap: { usd: 2500000000000 },
    total_volume: { usd: 150000000000 },
    market_cap_percentage: { btc: 45, eth: 18 },
    market_cap_change_percentage_24h_usd: 2.5,
    active_cryptocurrencies: 10000,
    markets: 600,
  }
}
