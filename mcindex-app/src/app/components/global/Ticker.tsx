"use client"

import { useState, useRef } from "react"
import { useTheme } from "next-themes"
import { ArrowDown, ArrowUp, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import tickerData from "@/data/fake-ticker-data.json"

// Define the structure of a ticker item
interface TickerItem {
  country: string
  code: string
  currency: string
  currentPrice: number
  previousPrice: number
  timestamp: string
}

export function StockTicker() {
  const [isPaused, setIsPaused] = useState(false)
  const [lastUpdated] = useState<Date>(new Date())
  const [animationSpeed, setAnimationSpeed] = useState<string>("120s") // Default speed
  const tickerRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()

  // Pause ticker on hover
  const handleMouseEnter = () => setIsPaused(true)
  const handleMouseLeave = () => setIsPaused(false)
  
  // Format the timestamp
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  // Format the date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Calculate price change and determine color
  const getPriceChange = (current: number, previous: number) => {
    const change = current - previous
    const percentChange = (change / previous) * 100

    return {
      value: change.toFixed(2),
      percent: percentChange.toFixed(2),
      direction: change > 0 ? "up" : change < 0 ? "down" : "unchanged",
    }
  }

  // Get appropriate color based on price direction and theme
  const getDirectionColor = (direction: string) => {
    if (direction === "up") {
      return theme === "dark" ? "text-green-400" : "text-green-600"
    } else if (direction === "down") {
      return theme === "dark" ? "text-red-400" : "text-red-600"
    }
    return "text-muted-foreground"
  }

  // Get appropriate icon based on price direction
  const getDirectionIcon = (direction: string) => {
    if (direction === "up") {
      return <ArrowUp className="h-3 w-3" />
    } else if (direction === "down") {
      return <ArrowDown className="h-3 w-3" />
    }
    return <Minus className="h-3 w-3" />
  }

  return (
    <div className="w-full bg-muted/50 border-y overflow-hidden font-mono">
      <div className="container mx-auto flex items-center justify-between py-1 gap-6">
        {/* Last updated timestamp */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap">
          <span className="hidden sm:inline">Last updated:</span>
          <span>{formatDate(lastUpdated)}</span>
          <span>{formatTimestamp(lastUpdated)}</span>
        </div>
        
        {/* Ticker container (viewport) */}
        <div
          className="relative flex overflow-x-hidden" // This is the viewport
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Single moving strip with duplicated content */}
          <div
            ref={tickerRef} // Ref assigned to the single moving strip
            className="flex items-center gap-4 whitespace-nowrap animate-continuous-marquee" // New animation class
            style={{
              animationPlayState: isPaused ? 'paused' : 'running',
              animationDuration: animationSpeed, // Apply dynamic speed
            }} 
          >
            {/* First set of items */}
            {tickerData.map((item: TickerItem, index) => {
              const priceChange = getPriceChange(item.currentPrice, item.previousPrice)
              const directionColor = getDirectionColor(priceChange.direction)

              return (
                <div key={`orig-${item.code}-${index}`} className="flex items-center gap-1 text-xs">
                  <span className="font-bold">{item.code}</span>
                  <span>
                    {item.currentPrice.toLocaleString()} {item.currency}
                  </span>
                  <span className={cn("flex items-center gap-0.5", directionColor)}>
                    {getDirectionIcon(priceChange.direction)}
                    <span>{Math.abs(Number.parseFloat(priceChange.value)).toLocaleString()}</span>
                    <span>({Math.abs(Number.parseFloat(priceChange.percent))}%)</span>
                  </span>
                </div>
              )
            })}
            {/* Second set of items (for seamless loop) */}
            {tickerData.map((item: TickerItem, index) => {
              const priceChange = getPriceChange(item.currentPrice, item.previousPrice)
              const directionColor = getDirectionColor(priceChange.direction)

              return (
                // Ensure unique keys for the duplicated items
                <div key={`dupl-${item.code}-${index}`} className="flex items-center gap-1 text-xs">
                  <span className="font-bold">{item.code}</span>
                  <span>
                    {item.currentPrice.toLocaleString()} {item.currency}
                  </span>
                  <span className={cn("flex items-center gap-0.5", directionColor)}>
                    {getDirectionIcon(priceChange.direction)}
                    <span>{Math.abs(Number.parseFloat(priceChange.value)).toLocaleString()}</span>
                    <span>({Math.abs(Number.parseFloat(priceChange.percent))}%)</span>
                  </span>
                </div>
              )
            })}
          </div>
          {/* Gradient overlays for smooth fade effect */}
          <div className="absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-background to-transparent z-10"></div>
          <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-background to-transparent z-10"></div>
        </div>

        {/* Pause indicator */}
        <div className="text-xs text-muted-foreground whitespace-nowrap">{isPaused ? "Paused" : "Live"}</div>
      </div>
    </div>
  )
}
