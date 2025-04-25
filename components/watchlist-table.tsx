"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Bookmark, Info, RefreshCw } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import SparklineChart from "@/components/sparkline-chart"
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils"
import { fetchCryptosByIds } from "@/lib/api"
import type { Crypto } from "@/lib/types"

interface WatchlistTableProps {
  searchTerm: string
}

export default function WatchlistTable({ searchTerm }: WatchlistTableProps) {
  const router = useRouter()
  const [watchlistIds, setWatchlistIds] = useState<string[]>([])
  const [watchlistCryptos, setWatchlistCryptos] = useState<Crypto[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedWatchlist = JSON.parse(localStorage.getItem("watchlist") || "[]")
    setWatchlistIds(storedWatchlist)
  }, [])

  useEffect(() => {
    const fetchWatchlistData = async () => {
      if (watchlistIds.length === 0) {
        setWatchlistCryptos([])
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const data = await fetchCryptosByIds(watchlistIds)
        setWatchlistCryptos(data)
      } catch (error) {
        console.error("Failed to fetch watchlist data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWatchlistData()
  }, [watchlistIds])

  const filteredCryptos = watchlistCryptos.filter(
    (crypto) =>
      crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const removeFromWatchlist = (id: string) => {
    const newWatchlist = watchlistIds.filter((item) => item !== id)
    localStorage.setItem("watchlist", JSON.stringify(newWatchlist))
    setWatchlistIds(newWatchlist)
  }

  const refreshWatchlist = async () => {
    if (watchlistIds.length === 0) return

    try {
      setIsLoading(true)
      const data = await fetchCryptosByIds(watchlistIds)
      setWatchlistCryptos(data)
    } catch (error) {
      console.error("Failed to refresh watchlist data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const InfoTooltip = ({ content }: { content: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-4 w-4 ml-1 text-gray-500 inline cursor-help" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs bg-gray-800 text-gray-200 border-gray-700">
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  if (isLoading) {
    return <WatchlistSkeleton />
  }

  if (watchlistIds.length === 0) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-100">Your Watchlist</CardTitle>
          <CardDescription className="text-gray-400">
            You haven't added any cryptocurrencies to your watchlist yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <Bookmark className="h-16 w-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-medium mb-2 text-gray-200">Your watchlist is empty</h3>
            <p className="text-gray-400 text-center max-w-md mb-6">
              Add cryptocurrencies to your watchlist by clicking the bookmark icon next to any cryptocurrency.
            </p>
            <Button onClick={() => router.push("/")} className="bg-purple-600 hover:bg-purple-700">
              Browse Cryptocurrencies
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden bg-gray-900 border-gray-800">
      <CardHeader className="pb-0">
        <div className="flex justify-between items-center">
          <CardTitle className="text-gray-100">Your Watchlist</CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
            onClick={refreshWatchlist}
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>
      </CardHeader>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-900">
            <TableRow className="border-gray-800 hover:bg-gray-800">
              <TableHead className="w-[60px] text-gray-400">#</TableHead>
              <TableHead className="text-gray-400">Name</TableHead>
              <TableHead className="text-right text-gray-400">Price</TableHead>
              <TableHead className="text-right text-gray-400">24h %</TableHead>
              <TableHead className="text-right text-gray-400">7d %</TableHead>
              <TableHead className="text-right text-gray-400">
                Market Cap
                <InfoTooltip content="Market capitalization is the total value of a cryptocurrency. It is calculated by multiplying the price of the cryptocurrency with its circulating supply." />
              </TableHead>
              <TableHead className="text-right text-gray-400">
                Circulating Supply
                <InfoTooltip content="The number of coins or tokens that are circulating in the market and are available for trading." />
              </TableHead>
              <TableHead className="text-center w-[120px] text-gray-400">Last 7 Days</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCryptos.length === 0 ? (
              <TableRow className="border-gray-800 hover:bg-gray-800">
                <TableCell colSpan={9} className="text-center py-8 text-gray-400">
                  No cryptocurrencies found in your watchlist
                </TableCell>
              </TableRow>
            ) : (
              filteredCryptos.map((crypto, index) => (
                <TableRow
                  key={crypto.id}
                  className="cursor-pointer border-gray-800 hover:bg-gray-800"
                  onClick={() => router.push(`/crypto/${crypto.id}`)}
                >
                  <TableCell className="font-medium text-gray-300">{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <img
                        src={crypto.image || "/placeholder.svg"}
                        alt={crypto.name}
                        className="w-6 h-6 rounded-full"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=24&width=24"
                        }}
                      />
                      <span className="font-medium text-gray-200">{crypto.name}</span>
                      <span className="text-gray-400">{crypto.symbol.toUpperCase()}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium text-gray-200">
                    {formatCurrency(crypto.current_price)}
                  </TableCell>
                  <TableCell
                    className={`text-right ${crypto.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"}`}
                  >
                    {formatPercent(crypto.price_change_percentage_24h)}
                  </TableCell>
                  <TableCell
                    className={`text-right ${crypto.price_change_percentage_7d_in_currency >= 0 ? "text-green-500" : "text-red-500"}`}
                  >
                    {formatPercent(crypto.price_change_percentage_7d_in_currency)}
                  </TableCell>
                  <TableCell className="text-right text-gray-200">{formatCurrency(crypto.market_cap)}</TableCell>
                  <TableCell className="text-right text-gray-200">
                    {formatNumber(crypto.circulating_supply)} {crypto.symbol.toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <SparklineChart
                      data={crypto.sparkline_in_7d?.price || []}
                      change={crypto.price_change_percentage_7d_in_currency}
                    />
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFromWatchlist(crypto.id)
                      }}
                    >
                      <Bookmark className="h-4 w-4 text-purple-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}

function WatchlistSkeleton() {
  return (
    <Card className="overflow-hidden bg-gray-900 border-gray-800">
      <CardHeader>
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32 bg-gray-800" />
          <Skeleton className="h-8 w-24 bg-gray-800" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-full bg-gray-800" />
                <Skeleton className="h-6 w-32 bg-gray-800" />
              </div>
              <Skeleton className="h-6 w-24 bg-gray-800" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
