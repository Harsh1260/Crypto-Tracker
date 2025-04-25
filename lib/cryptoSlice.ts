import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "./store"
import type { Crypto, Filters } from "./types"

interface CryptoState {
  cryptos: Crypto[]
  loading: boolean
  filters: Filters
}

const initialState: CryptoState = {
  cryptos: [],
  loading: false,
  filters: {
    sortBy: "market_cap_desc",
    priceMin: 0,
    priceMax: 100000,
    marketCapMin: 0,
    marketCapMax: 1000000000000,
    showOnlyGainers: false,
    showOnlyLosers: false,
  },
}

export const cryptoSlice = createSlice({
  name: "crypto",
  initialState,
  reducers: {
    setCryptos: (state, action: PayloadAction<Crypto[]>) => {
      state.cryptos = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setFilters: (state, action: PayloadAction<Filters>) => {
      state.filters = action.payload
    },
    updateCrypto: (state, action: PayloadAction<Partial<Crypto> & { id: string }>) => {
      const index = state.cryptos.findIndex((crypto) => crypto.id === action.payload.id)
      if (index !== -1) {
        state.cryptos[index] = { ...state.cryptos[index], ...action.payload }
      }
    },
    updateCryptos: (state, action: PayloadAction<Partial<Crypto>[]>) => {
      action.payload.forEach((update) => {
        if (!update.id) return
        const index = state.cryptos.findIndex((crypto) => crypto.id === update.id)
        if (index !== -1) {
          state.cryptos[index] = { ...state.cryptos[index], ...update }
        }
      })
    },
  },
})

export const { setCryptos, setLoading, setFilters, updateCrypto, updateCryptos } = cryptoSlice.actions

export const selectAllCryptos = (state: RootState) => {
  const { cryptos, filters } = state.crypto

  return cryptos.filter((crypto) => {
    // Apply price filter
    if (crypto.current_price < filters.priceMin || crypto.current_price > filters.priceMax) {
      return false
    }

    // Apply market cap filter
    if (crypto.market_cap < filters.marketCapMin || crypto.market_cap > filters.marketCapMax) {
      return false
    }

    // Apply gainers/losers filter
    if (filters.showOnlyGainers && crypto.price_change_percentage_24h < 0) {
      return false
    }

    if (filters.showOnlyLosers && crypto.price_change_percentage_24h >= 0) {
      return false
    }

    return true
  })
}

export const selectLoading = (state: RootState) => state.crypto.loading
export const selectCryptoById = (state: RootState, id: string) =>
  state.crypto.cryptos.find((crypto) => crypto.id === id)

export default cryptoSlice.reducer
