"use client"

import { useEffect, useRef, useState } from "react"

interface PriceChartProps {
  data: number[][]
  timeframe: string
  color: string
}

export default function PriceChart({ data, timeframe, color }: PriceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<{
    visible: boolean
    x: number
    y: number
    price: number
    date: Date
  } | null>(null)

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || !data || data.length === 0) return

    const canvas = canvasRef.current
    const container = containerRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions based on container
    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = 400
      drawChart()
    }

    // Store points for hover detection
    let chartPoints: { x: number; y: number; price: number; date: Date }[] = []

    // Draw the chart
    const drawChart = () => {
      if (!ctx || !canvas) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Extract price data and timestamps
      const prices = data.map((item) => item[1])
      const timestamps = data.map((item) => new Date(item[0]))

      // Calculate min/max values for scaling
      const minPrice = Math.min(...prices) * 0.99 // Add 1% padding
      const maxPrice = Math.max(...prices) * 1.01
      const priceRange = maxPrice - minPrice || 1

      // Chart dimensions with padding
      const padding = { top: 30, right: 20, bottom: 30, left: 60 }
      const chartWidth = canvas.width - padding.left - padding.right
      const chartHeight = canvas.height - padding.top - padding.bottom

      // Draw background
      ctx.fillStyle = "#121212"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw grid lines
      ctx.strokeStyle = "#1f2937"
      ctx.lineWidth = 1

      // Horizontal grid lines (price levels)
      const priceStep = priceRange / 5
      for (let i = 0; i <= 5; i++) {
        const price = minPrice + priceStep * i
        const y = padding.top + chartHeight - (chartHeight * (price - minPrice)) / priceRange

        ctx.beginPath()
        ctx.moveTo(padding.left, y)
        ctx.lineTo(padding.left + chartWidth, y)
        ctx.stroke()

        // Price labels
        ctx.fillStyle = "#d1d5db"
        ctx.font = "12px Arial"
        ctx.textAlign = "right"
        ctx.fillText(`$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, padding.left - 5, y + 4)
      }

      // Vertical grid lines (time)
      const timeStep = Math.floor(timestamps.length / 6)
      for (let i = 0; i < timestamps.length; i += timeStep) {
        const x = padding.left + (i / (timestamps.length - 1)) * chartWidth

        ctx.beginPath()
        ctx.moveTo(x, padding.top)
        ctx.lineTo(x, padding.top + chartHeight)
        ctx.stroke()

        // Time labels
        if (i < timestamps.length) {
          const date = timestamps[i]
          let label = ""

          if (timeframe === "24h") {
            label = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          } else if (timeframe === "7d" || timeframe === "30d") {
            label = date.toLocaleDateString([], { month: "short", day: "numeric" })
          } else {
            label = date.toLocaleDateString([], { month: "short", year: "2-digit" })
          }

          ctx.fillStyle = "#d1d5db"
          ctx.font = "12px Arial"
          ctx.textAlign = "center"
          ctx.fillText(label, x, padding.top + chartHeight + 20)
        }
      }

      // Reset chart points
      chartPoints = []

      // Draw price line
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.beginPath()

      for (let i = 0; i < prices.length; i++) {
        const x = padding.left + (i / (prices.length - 1)) * chartWidth
        const y = padding.top + chartHeight - (chartHeight * (prices[i] - minPrice)) / priceRange

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }

        // Store point for hover detection
        chartPoints.push({ x, y, price: prices[i], date: timestamps[i] })
      }

      ctx.stroke()

      // Create gradient fill
      const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight)
      gradient.addColorStop(0, `${color}40`) // 25% opacity at top
      gradient.addColorStop(1, `${color}05`) // 2% opacity at bottom

      // Fill area under the line
      ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight)
      ctx.lineTo(padding.left, padding.top + chartHeight)
      ctx.closePath()
      ctx.fillStyle = gradient
      ctx.fill()

      // Draw chart title
      ctx.fillStyle = "#d1d5db"
      ctx.font = "14px Arial"
      ctx.textAlign = "left"
      ctx.fillText(`Price Chart (${timeframe})`, padding.left, 20)

      // Draw current price
      const currentPrice = prices[prices.length - 1]
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 16px Arial"
      ctx.textAlign = "right"
      ctx.fillText(
        `$${currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
        canvas.width - padding.right,
        20,
      )
    }

    // Handle mouse movement for tooltips
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      // Find closest point
      let closestPoint = null
      let closestDistance = Number.POSITIVE_INFINITY

      for (const point of chartPoints) {
        const distance = Math.sqrt(Math.pow(mouseX - point.x, 2) + Math.pow(mouseY - point.y, 2))
        if (distance < closestDistance && distance < 30) {
          closestDistance = distance
          closestPoint = point
        }
      }

      if (closestPoint) {
        setTooltip({
          visible: true,
          x: closestPoint.x,
          y: closestPoint.y,
          price: closestPoint.price,
          date: closestPoint.date,
        })
      } else {
        setTooltip(null)
      }
    }

    const handleMouseLeave = () => {
      setTooltip(null)
    }

    // Initial draw and setup resize handler
    updateCanvasSize()
    window.addEventListener("resize", updateCanvasSize)
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      window.removeEventListener("resize", updateCanvasSize)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [data, color, timeframe])

  return (
    <div ref={containerRef} className="w-full h-[400px] bg-[#121212] rounded-md overflow-hidden relative">
      <canvas ref={canvasRef} className="w-full h-full" />

      {tooltip && tooltip.visible && (
        <div
          className="absolute bg-gray-800 text-white text-sm rounded px-3 py-2 z-10 pointer-events-none shadow-lg border border-gray-700"
          style={{
            left: tooltip.x,
            top: tooltip.y - 60,
            transform: "translateX(-50%)",
          }}
        >
          <div className="font-bold text-base">
            ${tooltip.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
          </div>
          <div className="text-gray-400 text-xs">
            {tooltip.date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}{" "}
            {tooltip.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      )}
    </div>
  )
}
