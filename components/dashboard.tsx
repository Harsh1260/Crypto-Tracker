"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, SlidersHorizontal } from "lucide-react"
import CryptoTable from "@/components/crypto-table"
import MarketOverview from "@/components/market-overview"
import WatchlistTable from "@/components/watchlist-table"
import FilterDialog from "@/components/filter-dialog"
import { selectAllCryptos, setCryptos, setLoading } from "@/lib/cryptoSlice"
import { fetchCryptos } from "@/lib/api"
import { startWebSocketSimulation } from "@/lib/webSocketService"

export default function Dashboard() {
  const dispatch = useDispatch()
  const cryptos = useSelector(selectAllCryptos)
  const [searchTerm, setSearchTerm] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const loadCryptos = async () => {
      try {
        dispatch(setLoading(true))

        // Add a small delay before fetching to avoid race conditions
        await new Promise((resolve) => setTimeout(resolve, 200))

        try {
          const data = await fetchCryptos()
          if (data && Array.isArray(data)) {
            dispatch(setCryptos(data))
          } else {
            console.error("Invalid data format received from API")
          }
        } catch (error) {
          console.error("Failed to fetch cryptocurrencies:", error)
        }
      } catch (error) {
        console.error("Error in loadCryptos:", error)
      } finally {
        dispatch(setLoading(false))
      }
    }

    loadCryptos()
  }, [dispatch])

  // Start real-time updates when cryptos are loaded
  useEffect(() => {
    if (cryptos.length === 0) return

    // Start the WebSocket simulation
    const cleanup = startWebSocketSimulation(dispatch, cryptos)

    // Clean up on unmount
    return cleanup
  }, [cryptos, dispatch])

  const filteredCryptos = cryptos.filter(
    (crypto) =>
      crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search cryptocurrencies..."
            className="pl-10 bg-gray-800 border-gray-700 text-gray-200 placeholder:text-gray-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
          onClick={() => setIsFilterOpen(true)}
        >
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </Button>
      </div>

      <MarketOverview />

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 bg-gray-800">
          <TabsTrigger value="all" className="data-[state=active]:bg-gray-700 data-[state=active]:text-gray-100">
            All Cryptocurrencies
          </TabsTrigger>
          <TabsTrigger value="watchlist" className="data-[state=active]:bg-gray-700 data-[state=active]:text-gray-100">
            My Watchlist
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <CryptoTable cryptos={filteredCryptos} />
        </TabsContent>
        <TabsContent value="watchlist">
          <WatchlistTable searchTerm={searchTerm} />
        </TabsContent>
      </Tabs>

      <FilterDialog open={isFilterOpen} onOpenChange={setIsFilterOpen} />
    </div>
  )
}
