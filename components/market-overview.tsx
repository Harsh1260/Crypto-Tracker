"use client"

import { useEffect, useState } from "react"
import { ArrowDownRight, ArrowUpRight, Bitcoin, DollarSign, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchGlobalData } from "@/lib/api"
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils"

// Fallback data in case API fails
const fallbackData = {
  total_market_cap: { usd: 2500000000000 },
  total_volume: { usd: 150000000000 },
  market_cap_percentage: { btc: 45, eth: 18 },
  market_cap_change_percentage_24h_usd: 2.5,
  active_cryptocurrencies: 10000,
  markets: 600,
}

export default function MarketOverview() {
  const [globalData, setGlobalData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(false)

        console.log("Fetching global market data in component...")

        // Add a small delay before fetching to avoid race conditions
        await new Promise((resolve) => setTimeout(resolve, 100))

        try {
          const data = await fetchGlobalData()

          // Check if we got valid data
          if (!data || !data.total_market_cap) {
            console.warn("Invalid global data received, using fallback")
            setError(true)
            setGlobalData(fallbackData)
          } else {
            setGlobalData(data)

            // If we got data but it's marked as mock, show error state
            if (data._isMockData) {
              setError(true)
            }
          }
        } catch (error) {
          console.error("Failed to fetch global market data:", error)
          setError(true)
          // Use fallback data
          setGlobalData(fallbackData)
        }
      } catch (error) {
        console.error("Error in fetchData:", error)
        setError(true)
        // Use fallback data
        setGlobalData(fallbackData)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return <MarketOverviewSkeleton />
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">Total Market Cap</CardTitle>
          <DollarSign className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-100">
            {formatCurrency(globalData?.total_market_cap?.usd || 0)}
          </div>
          <div
            className={`flex items-center text-xs ${globalData?.market_cap_change_percentage_24h_usd >= 0 ? "text-green-500" : "text-red-500"}`}
          >
            {globalData?.market_cap_change_percentage_24h_usd >= 0 ? (
              <ArrowUpRight className="mr-1 h-4 w-4" />
            ) : (
              <ArrowDownRight className="mr-1 h-4 w-4" />
            )}
            {formatPercent(globalData?.market_cap_change_percentage_24h_usd || 0)}
            <span className="text-gray-500 ml-1">vs yesterday</span>
          </div>
          {error && <div className="text-xs text-gray-500 mt-2">Using estimated data</div>}
        </CardContent>
      </Card>
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">24h Trading Volume</CardTitle>
          <TrendingUp className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-100">{formatCurrency(globalData?.total_volume?.usd || 0)}</div>
          <p className="text-xs text-gray-500">
            {(((globalData?.total_volume?.usd || 0) / (globalData?.total_market_cap?.usd || 1)) * 100).toFixed(2)}% of
            market cap
          </p>
        </CardContent>
      </Card>
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">BTC Dominance</CardTitle>
          <Bitcoin className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-100">
            {formatPercent(globalData?.market_cap_percentage?.btc || 0)}
          </div>
          <p className="text-xs text-gray-500">ETH: {formatPercent(globalData?.market_cap_percentage?.eth || 0)}</p>
        </CardContent>
      </Card>
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">Active Cryptocurrencies</CardTitle>
          <TrendingUp className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-100">
            {formatNumber(globalData?.active_cryptocurrencies || 0)}
          </div>
          <p className="text-xs text-gray-500">Markets: {formatNumber(globalData?.markets || 0)}</p>
        </CardContent>
      </Card>
    </div>
  )
}

function MarketOverviewSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24 bg-gray-800" />
            <Skeleton className="h-4 w-4 rounded-full bg-gray-800" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-full mb-2 bg-gray-800" />
            <Skeleton className="h-4 w-28 bg-gray-800" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
