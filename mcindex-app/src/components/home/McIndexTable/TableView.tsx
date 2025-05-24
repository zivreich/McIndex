"use client";

import React, { useState, useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ArrowUpIcon, ArrowDownIcon, MinusIcon, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'; 
import { cn } from "@/lib/utils";
import { RelativePriceBar } from './RelativePriceBar'; 

import type { FetchedCountryProductInfo } from '@/app/api/countries/route'; 
import type { EnhancedCountryProductInfo } from './McIndexContent'; 
import type { Currency as GlobalCurrency } from '@/contexts/CurrencyContext'; 
import type { SortConfig } from './Filters';
import { ConvertedPriceCell } from './ConvertedPriceCell';

const formatLocalPrice = (price: number | null | undefined, currencyMeta: FetchedCountryProductInfo['currencyMeta']): string => {
  if (price === null || typeof price === 'undefined') return "N/A";
  return `${currencyMeta.symbol}${price.toFixed(currencyMeta.decimals ? 2 : 0)}`;
};

const PriceTrendCell = (
  { currentPrice, previousPrice, currencySymbol, tooltipContent }:
  { 
    currentPrice: number | null; 
    previousPrice: number | null; 
    currencySymbol: string;
    tooltipContent: React.ReactNode;
  }
) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (event: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    }
  };

  const handleMouseEnter = (event: React.MouseEvent) => {
    setIsHovered(true);
    handleMouseMove(event);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  if (currentPrice === null || previousPrice === null) {
    return <MinusIcon className="h-4 w-4 text-muted-foreground" />;
  }

  const trend = currentPrice - previousPrice;
  const percentageChange = previousPrice !== 0 ? ((trend / previousPrice) * 100) : (trend !== 0 ? Infinity : 0);

  let IconComponent = MinusIcon; 
  let textColor = "text-muted-foreground";

  if (trend > 0) {
    IconComponent = ArrowUpIcon;
    textColor = "text-green-600";
  } else if (trend < 0) {
    IconComponent = ArrowDownIcon;
    textColor = "text-red-600";
  }

  return (
    <div className="relative">
      <div 
        ref={containerRef}
        className={`flex items-center gap-1 ${textColor} cursor-pointer`}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <IconComponent className="h-4 w-4" />
        <span>
          {currencySymbol}{Math.abs(trend).toFixed(2)} ({percentageChange === Infinity || percentageChange === -Infinity ? 'N/A' : percentageChange.toFixed(1)}%)
        </span>
      </div>

      {/* Custom floating tooltip that follows the mouse */}
      {isHovered && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: `${mousePosition.x + (containerRef.current?.getBoundingClientRect().left || 0)}px`,
            top: `${mousePosition.y + (containerRef.current?.getBoundingClientRect().top || 0)}px`,
            transform: 'translate(-50%, -100%) translateY(-8px)',
          }}
        >
          <div className="relative bg-background/66 backdrop-blur-md border border-white/20 text-foreground shadow-2xl rounded-lg p-3 animate-in fade-in-0 zoom-in-95 overflow-hidden">
            {/* Glossy overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-lg pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <div className="relative z-10">
              {tooltipContent}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface TableDisplayItem {
  id: string;
  countryName: string;
  countryCode: string;
  flag: string;
  trendValue: number; 
  fullItemData: EnhancedCountryProductInfo; 
  currentGlobalPrice: number | null; 
}

interface TableViewProps {
  countryProductData: EnhancedCountryProductInfo[]; 
  minGlobalPrice: number; 
  maxGlobalPrice: number; 
  selectedGlobalCurrency: GlobalCurrency;     
  monthForApi: string;                        
  onCountrySelect: (countryCode: string) => void;
  searchTerm?: string;
  sortConfig?: SortConfig;
  onSortChange?: (config: SortConfig) => void;
}

const SortableHeader = ({ 
  children, 
  column, 
  sortConfig, 
  onSort 
}: { 
  children: React.ReactNode;
  column: 'country' | 'price' | 'trend';
  sortConfig?: SortConfig;
  onSort?: (config: SortConfig) => void;
}) => {
  const handleClick = () => {
    if (!onSort) return;
    
    if (sortConfig?.column !== column) {
      // If not currently sorting by this column, start with ascending
      onSort({ column, order: 'asc' });
    } else {
      // If currently sorting by this column, cycle through asc -> desc -> none
      if (sortConfig.order === 'asc') {
        onSort({ column, order: 'desc' });
      } else if (sortConfig.order === 'desc') {
        onSort({ column: null, order: null });
      } else {
        onSort({ column, order: 'asc' });
      }
    }
  };

  const getSortIcon = () => {
    if (sortConfig?.column === column) {
      switch (sortConfig.order) {
        case 'asc':
          return <ArrowUp className="h-4 w-4" />;
        case 'desc':
          return <ArrowDown className="h-4 w-4" />;
        default:
          return <ArrowUpDown className="h-4 w-4 opacity-50" />;
      }
    }
    return <ArrowUpDown className="h-4 w-4 opacity-50" />;
  };

  const isActive = sortConfig?.column === column;

  return (
    <div 
      className={cn(
        "flex items-center gap-2 cursor-pointer hover:bg-muted/50 px-2 py-1 rounded transition-colors select-none",
        isActive && "text-primary"
      )}
      onClick={handleClick}
    >
      <span>{children}</span>
      {getSortIcon()}
    </div>
  );
};

export function TableView({
  countryProductData,
  minGlobalPrice, 
  maxGlobalPrice, 
  selectedGlobalCurrency,
  monthForApi,
  onCountrySelect,
  searchTerm = "",
  sortConfig,
  onSortChange
}: TableViewProps) {
  const mappedData: TableDisplayItem[] = countryProductData.map((item: EnhancedCountryProductInfo) => ({
    id: item.id,
    countryName: item.countryName,
    countryCode: item.countryCode,
    flag: item.flag,
    trendValue: (item.pricesForProduct.currentLocalPrice ?? 0) - (item.pricesForProduct.previousLocalPrice ?? 0),
    fullItemData: item,
    currentGlobalPrice: item.currentGlobalPrice, 
  }));

  const filteredData = mappedData.filter((item) => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase().trim();
    return (
      item.countryName.toLowerCase().includes(searchLower) ||
      item.countryCode.toLowerCase().includes(searchLower)
    );
  });

  const sortedDisplayData = [...filteredData].sort((a, b) => {
    // If no sorting is active, sort by country name
    if (!sortConfig || sortConfig.column === null) {
      return a.countryName.localeCompare(b.countryName);
    }
    
    switch (sortConfig.column) {
      case 'country':
        if (sortConfig.order === 'asc') {
          return a.countryName.localeCompare(b.countryName);
        } else if (sortConfig.order === 'desc') {
          return b.countryName.localeCompare(a.countryName);
        }
        break;
        
      case 'price':
        const priceA = a.currentGlobalPrice ?? 0;
        const priceB = b.currentGlobalPrice ?? 0;
        
        // Handle null values - put items with no price at the end
        if (a.currentGlobalPrice === null && b.currentGlobalPrice === null) {
          return a.countryName.localeCompare(b.countryName);
        }
        if (a.currentGlobalPrice === null) return 1;
        if (b.currentGlobalPrice === null) return -1;
        
        if (sortConfig.order === 'asc') {
          return priceA - priceB;
        } else if (sortConfig.order === 'desc') {
          return priceB - priceA;
        }
        break;
        
      case 'trend':
        if (sortConfig.order === 'asc') {
          return a.trendValue - b.trendValue;
        } else if (sortConfig.order === 'desc') {
          return b.trendValue - a.trendValue;
        }
        break;
    }
    
    // Fallback to country name
    return a.countryName.localeCompare(b.countryName);
  });

  return (
    <TooltipProvider>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px] px-6 py-4">
              <SortableHeader column="country" sortConfig={sortConfig} onSort={onSortChange}>
                Country
              </SortableHeader>
            </TableHead>
            <TableHead className="px-6 py-4">
              <SortableHeader column="price" sortConfig={sortConfig} onSort={onSortChange}>
                Price ({selectedGlobalCurrency.code})
              </SortableHeader>
            </TableHead>
            <TableHead className="px-6 py-4">
              <SortableHeader column="trend" sortConfig={sortConfig} onSort={onSortChange}>
                Price Trend
              </SortableHeader>
            </TableHead>
            <TableHead className="text-left min-w-[240px] px-6 py-4">Price Comparison</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedDisplayData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="px-6 py-12 text-center">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="text-muted-foreground text-sm">
                    {searchTerm.trim() ? (
                      <>No countries found matching &ldquo;{searchTerm}&rdquo;</>
                    ) : (
                      'No data available'
                    )}
                  </div>
                  {searchTerm.trim() && (
                    <div className="text-xs text-muted-foreground">
                      Try searching by country name or code
                    </div>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            sortedDisplayData.map((item) => {
              const currentLocalPriceForTrend = item.fullItemData.pricesForProduct.currentLocalPrice;
              const previousLocalPriceForTrend = item.fullItemData.pricesForProduct.previousLocalPrice;
              let trendPercentage: number | null = null;
              if (currentLocalPriceForTrend !== null && previousLocalPriceForTrend !== null && previousLocalPriceForTrend !== 0) {
                trendPercentage = ((currentLocalPriceForTrend - previousLocalPriceForTrend) / previousLocalPriceForTrend) * 100;
              }

              return (
                <TableRow key={item.id} onClick={() => onCountrySelect(item.countryCode)} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      {/* Sleek rounded flag display */}
                      <div className="relative w-8 h-6 bg-muted/30 rounded-sm border border-border/50 flex items-center justify-center overflow-hidden shadow-sm">
                        <img 
                          src={`https://flagcdn.com/w40/${item.countryCode.toLowerCase()}.png`}
                          alt={`${item.countryName} flag`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to country code if flag image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent && !parent.querySelector('.fallback-text')) {
                              const fallback = document.createElement('span');
                              fallback.className = 'fallback-text text-xs font-mono font-semibold text-muted-foreground';
                              fallback.textContent = item.countryCode;
                              parent.appendChild(fallback);
                            }
                          }}
                        />
                        {/* Subtle glossy overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-sm pointer-events-none" />
                      </div>
                      <span className="font-medium text-base">{item.countryName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <div className="font-medium text-base">
                      {item.currentGlobalPrice !== null ? (
                        <span>{selectedGlobalCurrency.symbol}{item.currentGlobalPrice.toFixed(2)}</span>
                      ) : (
                        <ConvertedPriceCell
                          countryProductInfo={item.fullItemData} 
                          targetGlobalCurrency={selectedGlobalCurrency} 
                          month={monthForApi}       
                          priceType="current"
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <PriceTrendCell
                      currentPrice={currentLocalPriceForTrend} 
                      previousPrice={previousLocalPriceForTrend}
                      currencySymbol={item.fullItemData.currencyMeta.symbol}
                      tooltipContent={
                        <div className="text-sm space-y-2">
                          <div className="font-semibold mb-2">Price Change in Local Currency:</div>
                          <div className="space-y-1">
                            <div>
                              Current: {formatLocalPrice(currentLocalPriceForTrend, item.fullItemData.currencyMeta)}
                            </div>
                            {item.fullItemData.pricesForProduct.previousAvailableYear && previousLocalPriceForTrend !== null && (
                              <div>
                                Previous ({item.fullItemData.pricesForProduct.previousAvailableYear}): 
                                {formatLocalPrice(previousLocalPriceForTrend, item.fullItemData.currencyMeta)}
                              </div>
                            )}
                          </div>
                          {trendPercentage !== null && (
                            <div className={cn(
                              "mt-2 pt-2 border-t border-border/30",
                              trendPercentage > 0 ? "text-green-600 dark:text-green-400" : 
                              trendPercentage < 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
                            )}>
                              Change: {trendPercentage === Infinity || trendPercentage === -Infinity ? 'N/A' : `${trendPercentage.toFixed(1)}%`}
                            </div>
                          )}
                        </div>
                      }
                    />
                  </TableCell>
                  <TableCell className="min-w-[240px] max-w-[320px] px-6 py-5"> 
                    <RelativePriceBar 
                      value={item.currentGlobalPrice}
                      minPrice={minGlobalPrice}
                      maxPrice={maxGlobalPrice}
                      currencySymbol={selectedGlobalCurrency.symbol}
                      currencyCode={selectedGlobalCurrency.code}
                    />
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TooltipProvider>
  );
}

