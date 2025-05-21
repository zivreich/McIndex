"use client"

import React, { useMemo, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from "next-themes"
import { ArrowDown, ArrowUp, Minus, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

// Interface for individual product data (as stored in products.json, used in the array)
interface Product {
  name: string;
  description: string;
  category: string;
  unit: string;
  emoji: string;
}

// Interface for product data when it includes its ID (after API transformation)
interface ProductWithId extends Product {
  id: string;
}

// Updated Interface for the overall products API response
interface ProductsApiResponse {
  products: ProductWithId[]; // Expects an object with a 'products' array
}

// Interface for price data within FetchedCountryProductInfo (from /api/countries)
interface PriceInfo {
  requestedYear: number;
  currentLocalPrice: number | null;
  previousAvailableYear: number | null;
  previousLocalPrice: number | null;
}

// Interface for currency metadata within FetchedCountryProductInfo
interface CurrencyMeta {
  code: string;
  decimals: boolean;
  symbol: string;
}

// Interface for individual country product data from /api/countries
interface FetchedCountryProductInfo {
  id: string; // country code like 'US'
  countryName: string;
  countryCode: string;
  currencyMeta: CurrencyMeta;
  flag: string;
  selectedProductId: string; // New field from API
  pricesForProduct: PriceInfo; 
  // If API were to support it, a 'productId' field here would be useful
}

// Interface for the items displayed in the ticker
interface TickerItemData {
  emoji: string;
  countryCode: string;
  currentPrice: number | null;
  previousPrice: number | null;
  currencySymbol: string;
}

const fetchProducts = async (): Promise<ProductsApiResponse> => {
  const response = await fetch('/api/products');
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  return response.json();
};

// Fetch data for a specific product (e.g., big-mac) across all countries for a given year
const fetchCountryPriceDataForTicker = async (year: number = 2025): Promise<FetchedCountryProductInfo[]> => {
  // The /api/countries endpoint defaults to 'big-mac' if no product_id is specified.
  // It also uses the latest year by default if no year is specified in data-sample, but let's be explicit.
  const response = await fetch(`/api/countries?year=${year}&randomize=true`); 
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch country price data');
  }
  return response.json();
};

interface StockTickerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function StockTicker({ className, ...props }: StockTickerProps) {
  const [isPaused, setIsPaused] = useState(false)
  const [lastUpdated] = useState<Date>(new Date())
  const [animationSpeed] = useState<string>("120s") // Default speed
  const tickerRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()

  const { data: productsData, isLoading: isLoadingProducts, isError: isErrorProducts } = useQuery<ProductsApiResponse, Error>({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const { data: countryPriceData, isLoading: isLoadingCountryPrices, isError: isErrorCountryPrices } = useQuery<FetchedCountryProductInfo[], Error>({
    queryKey: ['countryPriceDataForTicker', 2025, 'randomized'], // Add 'randomized' to queryKey for distinct caching
    queryFn: () => fetchCountryPriceDataForTicker(2025),
  });

  const tickerItems = useMemo((): TickerItemData[] => {
    if (!productsData || !productsData.products || !countryPriceData) return [];

    return countryPriceData.map((country: FetchedCountryProductInfo) => {
      // Find the product details (especially emoji) using selectedProductId from the API response
      const productDetails = productsData.products.find(p => p.id === country.selectedProductId);
      const productEmoji = productDetails?.emoji || '❓'; // Use emoji of the randomly selected product

      return {
        emoji: productEmoji, 
        countryCode: country.countryCode,
        currentPrice: country.pricesForProduct.currentLocalPrice,
        previousPrice: country.pricesForProduct.previousLocalPrice,
        currencySymbol: country.currencyMeta.symbol,
      };
    });
  }, [productsData, countryPriceData]);

  if (isLoadingProducts || isLoadingCountryPrices) {
    return (
      <div className={cn("h-10 flex items-center justify-center text-sm text-muted-foreground", className)} {...props}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading ticker data...
      </div>
    );
  }

  if (isErrorProducts || isErrorCountryPrices) {
    return (
      <div className={cn("h-10 flex items-center justify-center text-sm text-red-600", className)} {...props}>
        <AlertCircle className="mr-2 h-4 w-4" /> Error loading ticker data.
      </div>
    );
  }

  if (!tickerItems.length) {
    return (
      <div className={cn("h-10 flex items-center justify-center text-sm text-muted-foreground", className)} {...props}>
        No data available for ticker.
      </div>
    );
  }

  // Duplicate items for a smoother infinite scroll effect
  const duplicatedItems = [...tickerItems, ...tickerItems];

  // Pause ticker on hover
  const handleMouseEnter = () => setIsPaused(true)
  const handleMouseLeave = () => setIsPaused(false)

  return (
    <div className="w-full bg-muted/50 border-y overflow-hidden font-mono">
      <div className={cn(`container mx-auto flex items-center justify-between py-1 gap-6`, className)}>
        {/* Last updated timestamp */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap">
          <span className="hidden sm:inline">Last updated:</span>
          <span>{lastUpdated.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}</span>
          <span>{lastUpdated.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}</span>
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
            {duplicatedItems.map((item, index) => {
              const priceDiff = (item.currentPrice ?? 0) - (item.previousPrice ?? 0);
              let TrendIcon = Minus;
              let trendColor = "text-muted-foreground";
              let percentageChange: string | number = "N/A";

              if (item.previousPrice !== null && item.previousPrice !== 0 && item.currentPrice !== null) {
                const rawPercentage = ((item.currentPrice - item.previousPrice) / item.previousPrice) * 100;
                percentageChange = `${rawPercentage.toFixed(1)}%`;
              } else if (item.currentPrice !== null && item.previousPrice === null) {
                // New item, no previous price to compare
                 percentageChange = "New"; // Or simply don't show percentage
              }

              if (priceDiff > 0) {
                TrendIcon = ArrowUp;
                trendColor = theme === "dark" ? "text-green-400" : "text-green-600";
              } else if (priceDiff < 0) {
                TrendIcon = ArrowDown;
                trendColor = theme === "dark" ? "text-red-400" : "text-red-600";
              }

              return (
                <div key={index} className="flex items-center gap-1 text-xs">
                  <span className="mr-1 text-lg">{item.emoji}</span>
                  <span className="font-bold">{item.countryCode}:</span>
                  <span className={cn("mr-1", trendColor)}>
                    {item.currencySymbol}
                    {item.currentPrice !== null ? item.currentPrice.toFixed(item.currencySymbol === '¥' ? 0 : 2) : 'N/A'}
                  </span>
                  <TrendIcon className={cn("h-3 w-3", trendColor)} />
                  {percentageChange !== "N/A" && (
                    <span className={cn("ml-1 text-xs", trendColor)}>
                      ({percentageChange})
                    </span>
                  )}
                </div>
              );
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
