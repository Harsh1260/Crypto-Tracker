"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Bookmark, BookmarkCheck, ExternalLink, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import Header from "@/components/header"
import AnimatedBackground from "@/components/animated-background"
import PriceChart from "@/components/price-chart"
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils"
import { fetchCryptoDetails, fetchCryptoMarketChart } from "@/lib/api"

export default function CryptoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [crypto, setCrypto] = useState<any>(null)
  const [marketData, setMarketData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeframe, setTimeframe] = useState("7d")
  const [isWatchlisted, setIsWatchlisted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const id = typeof params.id === "string" ? params.id : ""

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        console.log(`Loading data for ${id}...`)

        // Fetch crypto details with better error handling
        let cryptoData
        try {
          cryptoData = await fetchCryptoDetails(id)
          setCrypto(cryptoData)
        } catch (error) {
          console.error("Failed to load crypto details:", error)
          // We'll continue with the mock data that should have been returned
        }

        // Fetch chart data based on selected timeframe
        try {
          const days = timeframe === "24h" ? 1 : timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : 365
          const chartData = await fetchCryptoMarketChart(id, days)
          setMarketData(chartData)
        } catch (error) {
          console.error("Failed to load market chart:", error)
          // We'll continue with the mock data that should have been returned
        }

        // Check if this crypto is in the watchlist
        const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]")
        setIsWatchlisted(watchlist.includes(id))

        // If we got this far but are using mock data, show a notification
        if (!cryptoData || cryptoData._isMockData) {
          setError("Using fallback data due to API limitations. Some information may not be current.")
          toast({
            title: "Notice",
            description: "Using fallback data due to API limitations. Some information may not be current.",
            variant: "default",
          })
        }
      } catch (error) {
        console.error("Failed to load crypto data:", error)
        setError("Failed to load cryptocurrency data. Using fallback data.")
        toast({
          title: "Notice",
          description: "Using fallback data due to API limitations. Some information may not be current.",
          variant: "default",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      loadData()
    }
  }, [id, timeframe, toast])

  const toggleWatchlist = () => {
    const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]")
    let newWatchlist

    if (isWatchlisted) {
      newWatchlist = watchlist.filter((item: string) => item !== id)
      toast({
        title: "Removed from watchlist",
        description: `${crypto?.name} has been removed from your watchlist.`,
      })
    } else {
      newWatchlist = [...watchlist, id]
      toast({
        title: "Added to watchlist",
        description: `${crypto?.name} has been added to your watchlist.`,
      })
    }

    localStorage.setItem("watchlist", JSON.stringify(newWatchlist))
    setIsWatchlisted(!isWatchlisted)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 relative overflow-hidden">
      <AnimatedBackground />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <Header />

        <div className="mt-8">
          <Button
            variant="ghost"
            className="mb-4 flex items-center gap-2 hover:bg-gray-800 text-gray-300"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>

          {error && (
            <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-800 rounded-md text-yellow-200">
              <p>{error}</p>
            </div>
          )}

          {isLoading ? (
            <CryptoDetailSkeleton />
          ) : crypto ? (
            <>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <img
                    src={crypto.image?.large || "/placeholder.svg?height=48&width=48"}
                    alt={crypto.name}
                    className="w-12 h-12 rounded-full"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=48&width=48"
                    }}
                  />
                  <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-100">
                      {crypto.name}
                      <span className="text-gray-400 text-lg font-normal">{crypto.symbol?.toUpperCase()}</span>
                      <span className="text-sm px-2 py-1 bg-gray-800 rounded-md">Rank #{crypto.market_cap_rank}</span>
                    </h1>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 bg-gray-800 border-gray-700"
                    onClick={toggleWatchlist}
                  >
                    {isWatchlisted ? (
                      <>
                        <BookmarkCheck className="h-4 w-4 text-green-500" /> Watchlisted
                      </>
                    ) : (
                      <>
                        <Bookmark className="h-4 w-4" /> Add to Watchlist
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 bg-gray-800 border-gray-700"
                    onClick={() => window.open(`https://www.coingecko.com/en/coins/${id}`, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" /> View on CoinGecko
                  </Button>
                </div>
              </div>

              {/* Rest of the component remains the same */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-gray-400">Current Price</CardDescription>
                    <CardTitle className="text-2xl text-gray-100">
                      {formatCurrency(crypto.market_data?.current_price?.usd || 0)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`flex items-center ${crypto.market_data?.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"}`}
                    >
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {formatPercent(crypto.market_data?.price_change_percentage_24h || 0)} (24h)
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-gray-400">Market Cap</CardDescription>
                    <CardTitle className="text-2xl text-gray-100">
                      {formatCurrency(crypto.market_data?.market_cap?.usd || 0)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-gray-400">
                      Fully Diluted: {formatCurrency(crypto.market_data?.fully_diluted_valuation?.usd || 0)}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-gray-400">Trading Volume (24h)</CardDescription>
                    <CardTitle className="text-2xl text-gray-100">
                      {formatCurrency(crypto.market_data?.total_volume?.usd || 0)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-gray-400">
                      Volume/Market Cap:{" "}
                      {(
                        (crypto.market_data?.total_volume?.usd || 0) / (crypto.market_data?.market_cap?.usd || 1)
                      ).toFixed(4)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="mb-6 bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-gray-100">Price Chart</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant={timeframe === "24h" ? "default" : "outline"}
                      size="sm"
                      className={
                        timeframe === "24h"
                          ? "bg-purple-600 hover:bg-purple-700"
                          : "bg-gray-800 border-gray-700 text-gray-300"
                      }
                      onClick={() => setTimeframe("24h")}
                    >
                      24h
                    </Button>
                    <Button
                      variant={timeframe === "7d" ? "default" : "outline"}
                      size="sm"
                      className={
                        timeframe === "7d"
                          ? "bg-purple-600 hover:bg-purple-700"
                          : "bg-gray-800 border-gray-700 text-gray-300"
                      }
                      onClick={() => setTimeframe("7d")}
                    >
                      7d
                    </Button>
                    <Button
                      variant={timeframe === "30d" ? "default" : "outline"}
                      size="sm"
                      className={
                        timeframe === "30d"
                          ? "bg-purple-600 hover:bg-purple-700"
                          : "bg-gray-800 border-gray-700 text-gray-300"
                      }
                      onClick={() => setTimeframe("30d")}
                    >
                      30d
                    </Button>
                    <Button
                      variant={timeframe === "1y" ? "default" : "outline"}
                      size="sm"
                      className={
                        timeframe === "1y"
                          ? "bg-purple-600 hover:bg-purple-700"
                          : "bg-gray-800 border-gray-700 text-gray-300"
                      }
                      onClick={() => setTimeframe("1y")}
                    >
                      1y
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    {marketData ? (
                      <PriceChart
                        data={marketData.prices}
                        timeframe={timeframe}
                        color={crypto.market_data?.price_change_percentage_24h >= 0 ? "#10b981" : "#ef4444"}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-400">Loading chart data...</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="overview" className="mb-6">
                <TabsList className="grid grid-cols-3 mb-4 bg-gray-800">
                  <TabsTrigger
                    value="overview"
                    className="data-[state=active]:bg-gray-700 data-[state=active]:text-gray-100"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="markets"
                    className="data-[state=active]:bg-gray-700 data-[state=active]:text-gray-100"
                  >
                    Markets
                  </TabsTrigger>
                  <TabsTrigger
                    value="about"
                    className="data-[state=active]:bg-gray-700 data-[state=active]:text-gray-100"
                  >
                    About
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-gray-900 border-gray-800">
                      <CardHeader>
                        <CardTitle className="text-gray-100">Supply Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Circulating Supply</span>
                            <span className="text-gray-200">
                              {formatNumber(crypto.market_data?.circulating_supply || 0)} {crypto.symbol?.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Total Supply</span>
                            <span className="text-gray-200">
                              {crypto.market_data?.total_supply ? formatNumber(crypto.market_data.total_supply) : "∞"}{" "}
                              {crypto.symbol?.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Max Supply</span>
                            <span className="text-gray-200">
                              {crypto.market_data?.max_supply ? formatNumber(crypto.market_data.max_supply) : "∞"}{" "}
                              {crypto.symbol?.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-900 border-gray-800">
                      <CardHeader>
                        <CardTitle className="text-gray-100">Price Change</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-gray-400">1h</span>
                            <span
                              className={
                                crypto.market_data?.price_change_percentage_1h_in_currency?.usd >= 0
                                  ? "text-green-500"
                                  : "text-red-500"
                              }
                            >
                              {formatPercent(crypto.market_data?.price_change_percentage_1h_in_currency?.usd || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">24h</span>
                            <span
                              className={
                                crypto.market_data?.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"
                              }
                            >
                              {formatPercent(crypto.market_data?.price_change_percentage_24h || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">7d</span>
                            <span
                              className={
                                crypto.market_data?.price_change_percentage_7d >= 0 ? "text-green-500" : "text-red-500"
                              }
                            >
                              {formatPercent(crypto.market_data?.price_change_percentage_7d || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">30d</span>
                            <span
                              className={
                                crypto.market_data?.price_change_percentage_30d >= 0 ? "text-green-500" : "text-red-500"
                              }
                            >
                              {formatPercent(crypto.market_data?.price_change_percentage_30d || 0)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="markets">
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-gray-100">Top Markets</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-800">
                              <th className="text-left py-3 px-4 text-gray-400">#</th>
                              <th className="text-left py-3 px-4 text-gray-400">Exchange</th>
                              <th className="text-left py-3 px-4 text-gray-400">Pair</th>
                              <th className="text-right py-3 px-4 text-gray-400">Price</th>
                              <th className="text-right py-3 px-4 text-gray-400">Volume (24h)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {crypto.tickers?.slice(0, 10).map((ticker: any, index: number) => (
                              <tr key={index} className="border-b border-gray-800 hover:bg-gray-800">
                                <td className="py-3 px-4 text-gray-300">{index + 1}</td>
                                <td className="py-3 px-4 text-gray-300">{ticker.market.name}</td>
                                <td className="py-3 px-4 text-gray-300">
                                  {ticker.base}/{ticker.target}
                                </td>
                                <td className="py-3 px-4 text-right text-gray-300">
                                  {formatCurrency(ticker.converted_last.usd)}
                                </td>
                                <td className="py-3 px-4 text-right text-gray-300">
                                  {formatCurrency(ticker.converted_volume.usd)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="about">
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-gray-100">About {crypto.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div
                        className="prose prose-invert max-w-none text-gray-300"
                        dangerouslySetInnerHTML={{ __html: crypto.description?.en || "No description available." }}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-100">Cryptocurrency not found</h2>
              <p className="text-gray-400 mt-2">
                The cryptocurrency you're looking for doesn't exist or couldn't be loaded.
              </p>
              <Button className="mt-4 bg-purple-600 hover:bg-purple-700" onClick={() => router.push("/")}>
                Return to Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CryptoDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-full bg-gray-800" />
        <div>
          <Skeleton className="h-8 w-48 bg-gray-800" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-32 bg-gray-800" />
        <Skeleton className="h-32 bg-gray-800" />
        <Skeleton className="h-32 bg-gray-800" />
      </div>

      <Skeleton className="h-[450px] bg-gray-800" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-64 bg-gray-800" />
        <Skeleton className="h-64 bg-gray-800" />
      </div>
    </div>
  )
}
