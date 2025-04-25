"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { ArrowDown, ArrowUp, Bookmark, BookmarkCheck, Info } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import SparklineChart from "@/components/sparkline-chart"
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils"
import { selectLoading } from "@/lib/cryptoSlice"
import type { Crypto } from "@/lib/types"

type SortField =
  | "rank"
  | "name"
  | "price"
  | "change1h"
  | "change24h"
  | "change7d"
  | "marketCap"
  | "volume24h"
  | "circulatingSupply"

interface CryptoTableProps {
  cryptos: Crypto[]
}

export default function CryptoTable({ cryptos }: CryptoTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const isLoading = useSelector(selectLoading)
  const [sortField, setSortField] = useState<SortField>("rank")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("watchlist") || "[]")
    }
    return []
  })

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedCryptos = [...cryptos].sort((a, b) => {
    let comparison = 0

    switch (sortField) {
      case "rank":
        comparison = a.market_cap_rank - b.market_cap_rank
        break
      case "name":
        comparison = a.name.localeCompare(b.name)
        break
      case "price":
        comparison = a.current_price - b.current_price
        break
      case "change1h":
        comparison = a.price_change_percentage_1h_in_currency - b.price_change_percentage_1h_in_currency
        break
      case "change24h":
        comparison = a.price_change_percentage_24h - b.price_change_percentage_24h
        break
      case "change7d":
        comparison = a.price_change_percentage_7d_in_currency - b.price_change_percentage_7d_in_currency
        break
      case "marketCap":
        comparison = a.market_cap - b.market_cap
        break
      case "volume24h":
        comparison = a.total_volume - b.total_volume
        break
      case "circulatingSupply":
        comparison = a.circulating_supply - b.circulating_supply
        break
      default:
        comparison = 0
    }

    return sortDirection === "asc" ? comparison : -comparison
  })

  const toggleWatchlist = (id: string, name: string) => {
    let newWatchlist

    if (watchlist.includes(id)) {
      newWatchlist = watchlist.filter((item) => item !== id)
      toast({
        title: "Removed from watchlist",
        description: `${name} has been removed from your watchlist.`,
      })
    } else {
      newWatchlist = [...watchlist, id]
      toast({
        title: "Added to watchlist",
        description: `${name} has been added to your watchlist.`,
      })
    }

    localStorage.setItem("watchlist", JSON.stringify(newWatchlist))
    setWatchlist(newWatchlist)
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (field !== sortField) return null
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 h-4 w-4 inline" />
    ) : (
      <ArrowDown className="ml-1 h-4 w-4 inline" />
    )
  }

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <div className="flex items-center cursor-pointer" onClick={() => handleSort(field)}>
      {children}
      <SortIcon field={field} />
    </div>
  )

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
    return <CryptoTableSkeleton />
  }

  return (
    <Card className="overflow-hidden bg-gray-900 border-gray-800">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-900">
            <TableRow className="border-gray-800 hover:bg-gray-800">
              <TableHead className="w-[60px] text-gray-400">
                <SortableHeader field="rank">#</SortableHeader>
              </TableHead>
              <TableHead className="text-gray-400">
                <SortableHeader field="name">Name</SortableHeader>
              </TableHead>
              <TableHead className="text-right text-gray-400">
                <SortableHeader field="price">Price</SortableHeader>
              </TableHead>
              <TableHead className="text-right text-gray-400">
                <SortableHeader field="change1h">1h %</SortableHeader>
              </TableHead>
              <TableHead className="text-right text-gray-400">
                <SortableHeader field="change24h">24h %</SortableHeader>
              </TableHead>
              <TableHead className="text-right text-gray-400">
                <SortableHeader field="change7d">7d %</SortableHeader>
              </TableHead>
              <TableHead className="text-right text-gray-400">
                <SortableHeader field="marketCap">
                  Market Cap
                  <InfoTooltip content="Market capitalization is the total value of a cryptocurrency. It is calculated by multiplying the price of the cryptocurrency with its circulating supply." />
                </SortableHeader>
              </TableHead>
              <TableHead className="text-right text-gray-400">
                <SortableHeader field="volume24h">
                  Volume (24h)
                  <InfoTooltip content="The total amount of the cryptocurrency that has been traded in the past 24 hours." />
                </SortableHeader>
              </TableHead>
              <TableHead className="text-right text-gray-400">
                <SortableHeader field="circulatingSupply">
                  Circulating Supply
                  <InfoTooltip content="The number of coins or tokens that are circulating in the market and are available for trading." />
                </SortableHeader>
              </TableHead>
              <TableHead className="text-center w-[120px] text-gray-400">Last 7 Days</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCryptos.length === 0 ? (
              <TableRow className="border-gray-800 hover:bg-gray-800">
                <TableCell colSpan={11} className="text-center py-8 text-gray-400">
                  No cryptocurrencies found
                </TableCell>
              </TableRow>
            ) : (
              sortedCryptos.map((crypto, index) => (
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
                    className={`text-right ${crypto.price_change_percentage_1h_in_currency >= 0 ? "text-green-500" : "text-red-500"}`}
                  >
                    {formatPercent(crypto.price_change_percentage_1h_in_currency)}
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
                  <TableCell className="text-right text-gray-200">{formatCurrency(crypto.total_volume)}</TableCell>
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
                        toggleWatchlist(crypto.id, crypto.name)
                      }}
                    >
                      {watchlist.includes(crypto.id) ? (
                        <BookmarkCheck className="h-4 w-4 text-green-500" />
                      ) : (
                        <Bookmark className="h-4 w-4 text-gray-400" />
                      )}
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

function CryptoTableSkeleton() {
  return (
    <Card className="overflow-hidden bg-gray-900 border-gray-800">
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32 bg-gray-800" />
          <Skeleton className="h-8 w-24 bg-gray-800" />
        </div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-full bg-gray-800" />
              <Skeleton className="h-6 w-32 bg-gray-800" />
            </div>
            <Skeleton className="h-6 w-24 bg-gray-800" />
          </div>
        ))}
      </div>
    </Card>
  )
}
