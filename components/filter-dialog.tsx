"use client"

import { useState } from "react"
import { useDispatch } from "react-redux"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { setFilters } from "@/lib/cryptoSlice"

interface FilterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function FilterDialog({ open, onOpenChange }: FilterDialogProps) {
  const dispatch = useDispatch()
  const [sortBy, setSortBy] = useState("market_cap_desc")
  const [priceRange, setPriceRange] = useState([0, 100000])
  const [marketCapRange, setMarketCapRange] = useState([0, 1000000000000])
  const [showOnlyGainers, setShowOnlyGainers] = useState(false)
  const [showOnlyLosers, setShowOnlyLosers] = useState(false)

  const handleApplyFilters = () => {
    dispatch(
      setFilters({
        sortBy,
        priceMin: priceRange[0],
        priceMax: priceRange[1],
        marketCapMin: marketCapRange[0],
        marketCapMax: marketCapRange[1],
        showOnlyGainers,
        showOnlyLosers,
      }),
    )
    onOpenChange(false)
  }

  const handleReset = () => {
    setSortBy("market_cap_desc")
    setPriceRange([0, 100000])
    setMarketCapRange([0, 1000000000000])
    setShowOnlyGainers(false)
    setShowOnlyLosers(false)

    dispatch(
      setFilters({
        sortBy: "market_cap_desc",
        priceMin: 0,
        priceMax: 100000,
        marketCapMin: 0,
        marketCapMax: 1000000000000,
        showOnlyGainers: false,
        showOnlyLosers: false,
      }),
    )
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-800 text-gray-200">
        <DialogHeader>
          <DialogTitle className="text-gray-100">Filter Cryptocurrencies</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Sort By</Label>
            <RadioGroup value={sortBy} onValueChange={setSortBy} className="space-y-1">
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="market_cap_desc"
                  id="market_cap_desc"
                  className="border-gray-600 text-purple-500"
                />
                <Label htmlFor="market_cap_desc" className="text-gray-300">
                  Market Cap (High to Low)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="market_cap_asc"
                  id="market_cap_asc"
                  className="border-gray-600 text-purple-500"
                />
                <Label htmlFor="market_cap_asc" className="text-gray-300">
                  Market Cap (Low to High)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="price_desc" id="price_desc" className="border-gray-600 text-purple-500" />
                <Label htmlFor="price_desc" className="text-gray-300">
                  Price (High to Low)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="price_asc" id="price_asc" className="border-gray-600 text-purple-500" />
                <Label htmlFor="price_asc" className="text-gray-300">
                  Price (Low to High)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="volume_desc" id="volume_desc" className="border-gray-600 text-purple-500" />
                <Label htmlFor="volume_desc" className="text-gray-300">
                  Volume (High to Low)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="percent_change_24h_desc"
                  id="percent_change_24h_desc"
                  className="border-gray-600 text-purple-500"
                />
                <Label htmlFor="percent_change_24h_desc" className="text-gray-300">
                  Gainers (24h)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="percent_change_24h_asc"
                  id="percent_change_24h_asc"
                  className="border-gray-600 text-purple-500"
                />
                <Label htmlFor="percent_change_24h_asc" className="text-gray-300">
                  Losers (24h)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Price Range (USD)</Label>
            <Slider
              defaultValue={priceRange}
              max={100000}
              step={100}
              value={priceRange}
              onValueChange={setPriceRange}
              className="py-4"
            />
            <div className="flex justify-between text-gray-400">
              <span>${priceRange[0].toLocaleString()}</span>
              <span>${priceRange[1].toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Market Cap Range (USD)</Label>
            <Slider
              defaultValue={marketCapRange}
              max={1000000000000}
              step={1000000}
              value={marketCapRange}
              onValueChange={setMarketCapRange}
              className="py-4"
            />
            <div className="flex justify-between text-gray-400">
              <span>${(marketCapRange[0] / 1e9).toFixed(1)}B</span>
              <span>${(marketCapRange[1] / 1e9).toFixed(1)}B</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Additional Filters</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="gainers"
                checked={showOnlyGainers}
                onCheckedChange={(checked) => {
                  setShowOnlyGainers(checked as boolean)
                  if (checked) setShowOnlyLosers(false)
                }}
                className="border-gray-600 text-purple-500"
              />
              <Label htmlFor="gainers" className="text-gray-300">
                Show only gainers (24h)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="losers"
                checked={showOnlyLosers}
                onCheckedChange={(checked) => {
                  setShowOnlyLosers(checked as boolean)
                  if (checked) setShowOnlyGainers(false)
                }}
                className="border-gray-600 text-purple-500"
              />
              <Label htmlFor="losers" className="text-gray-300">
                Show only losers (24h)
              </Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleReset}
            className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
          >
            Reset
          </Button>
          <Button onClick={handleApplyFilters} className="bg-purple-600 hover:bg-purple-700">
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
