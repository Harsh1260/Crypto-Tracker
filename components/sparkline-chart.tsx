"use client"

import { useEffect, useRef, useState } from "react"

interface SparklineChartProps {
  data: number[]
  change: number
}

export default function SparklineChart({ data, change }: SparklineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; price: number; index: number }>({
    visible: false,
    x: 0,
    y: 0,
    price: 0,
    index: 0,
  })

  useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const padding = 2

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Find min and max values for scaling
    const minValue = Math.min(...data)
    const maxValue = Math.max(...data)
    const range = maxValue - minValue || 1 // Avoid division by zero

    // Draw the sparkline
    ctx.beginPath()
    ctx.lineWidth = 1.5
    ctx.strokeStyle = change >= 0 ? "#10b981" : "#ef4444"

    // Store points for hover detection
    const points: { x: number; y: number; price: number }[] = []

    data.forEach((value, index) => {
      const x = (index / (data.length - 1)) * (width - padding * 2) + padding
      const y = height - ((value - minValue) / range) * (height - padding * 2) - padding

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }

      // Store point for hover detection
      points.push({ x, y, price: value })
    })

    ctx.stroke()

    // Add a subtle gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    if (change >= 0) {
      gradient.addColorStop(0, "rgba(16, 185, 129, 0.2)")
      gradient.addColorStop(1, "rgba(16, 185, 129, 0)")
    } else {
      gradient.addColorStop(0, "rgba(239, 68, 68, 0.2)")
      gradient.addColorStop(1, "rgba(239, 68, 68, 0)")
    }

    ctx.lineTo(width - padding, height - padding)
    ctx.lineTo(padding, height - padding)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()

    // Add hover functionality
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left

      // Find closest point
      let closestPoint = points[0]
      let closestDistance = Math.abs(mouseX - closestPoint.x)
      let closestIndex = 0

      points.forEach((point, index) => {
        const distance = Math.abs(mouseX - point.x)
        if (distance < closestDistance) {
          closestDistance = distance
          closestPoint = point
          closestIndex = index
        }
      })

      // Only show tooltip if mouse is close enough to a point
      if (closestDistance < 10) {
        setTooltip({
          visible: true,
          x: closestPoint.x,
          y: closestPoint.y,
          price: closestPoint.price,
          index: closestIndex,
        })
      } else {
        setTooltip((prev) => ({ ...prev, visible: false }))
      }
    }

    const handleMouseLeave = () => {
      setTooltip((prev) => ({ ...prev, visible: false }))
    }

    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [data, change])

  // Calculate days ago for tooltip
  const getDaysAgo = (index: number, totalPoints: number) => {
    // For 7-day chart with 168 hourly points (7*24)
    const daysAgo = Math.floor((totalPoints - 1 - index) / 24)
    const hoursAgo = (totalPoints - 1 - index) % 24

    if (daysAgo === 0) {
      return hoursAgo === 0 ? "Now" : `${hoursAgo}h ago`
    } else if (daysAgo === 1 && hoursAgo === 0) {
      return "1 day ago"
    } else if (daysAgo >= 1) {
      return `${daysAgo}d ${hoursAgo}h ago`
    }
    return `${hoursAgo}h ago`
  }

  return (
    <div className="flex justify-center relative">
      <canvas ref={canvasRef} width={100} height={40} className="w-[100px] h-[40px]" />

      {tooltip.visible && (
        <div
          className="absolute bg-gray-800 text-white text-xs rounded px-2 py-1 z-10 pointer-events-none"
          style={{
            left: tooltip.x > 50 ? tooltip.x - 40 : tooltip.x + 10,
            top: tooltip.y - 30,
            transform: "translateX(-50%)",
          }}
        >
          <div className="font-bold">{formatCurrency(tooltip.price)}</div>
          <div className="text-gray-400">{getDaysAgo(tooltip.index, data.length)}</div>
        </div>
      )}
    </div>
  )
}

// Helper function to format currency for tooltips
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value >= 1 ? 2 : 6,
    maximumFractionDigits: value >= 1 ? 2 : 6,
  }).format(value)
}
