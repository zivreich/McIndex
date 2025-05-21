"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query'; 
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar"; 
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from 'lucide-react'; 

// Import the type for fetched data from the API route
import type { FetchedCountryProductInfo } from '@/app/api/countries/route'; 
import type { Currency as GlobalCurrency } from '@/contexts/CurrencyContext'; 
import { ConvertedPriceCell } from './ConvertedPriceCell'; 

// Helper to format price based on local currency data (kept for PriceTrendCell etc. for now)
const formatLocalPrice = (price: number | null | undefined, currencyMeta: FetchedCountryProductInfo['currencyMeta']): string => {
  if (price === null || typeof price === 'undefined') return "N/A";
  return `${currencyMeta.symbol}${price.toFixed(currencyMeta.decimals ? 2 : 0)}`;
};

// PriceTrendCell remains unchanged for now, uses local currency
const PriceTrendCell = (
  { currentPrice, previousPrice, currencySymbol }:
  { currentPrice: number | null; previousPrice: number | null; currencySymbol: string }
) => {
  if (currentPrice === null || previousPrice === null) {
    return <MinusIcon className="h-4 w-4 text-muted-foreground" />;
  }
  const trend = currentPrice - previousPrice;
  // Avoid division by zero if previousPrice is 0
  const percentageChange = previousPrice !== 0 ? ((trend / previousPrice) * 100) : (trend !== 0 ? Infinity : 0);

  let IconComponent = MinusIcon; // Default to MinusIcon
  let textColor = "text-muted-foreground";

  if (trend > 0) {
    IconComponent = ArrowUpIcon;
    textColor = "text-green-600";
  } else if (trend < 0) {
    IconComponent = ArrowDownIcon;
    textColor = "text-red-600";
  }
  // If trend is 0, IconComponent remains MinusIcon and textColor remains text-muted-foreground

  return (
    <div className={`flex items-center gap-1 ${textColor}`}>
      <IconComponent className="h-4 w-4" />
      <span>
        {currencySymbol}{Math.abs(trend).toFixed(2)} ({percentageChange === Infinity || percentageChange === -Infinity ? 'N/A' : percentageChange.toFixed(1)}%)
      </span>
    </div>
  );
};

// InlineChartCell remains unchanged for now, uses local currency
const InlineChartCell = (
  { countryProductInfo, timePeriodLabel, currencySymbol }:
  {
    countryProductInfo: FetchedCountryProductInfo;
    timePeriodLabel: string;
    currencySymbol: string;
  }
) => {
  return (
    <div className="w-full h-10 bg-gray-200 rounded-sm flex items-center justify-center text-xs text-gray-500">
      [Chart: {countryProductInfo.countryName} {currencySymbol} vs {timePeriodLabel}]
    </div>
  );
};

interface TableDisplayItem {
  id: string;
  countryName: string;
  countryCode: string;
  flag: string;
  trendValue: number; // Calculated for sorting/displaying trend icon
  fullItemData: FetchedCountryProductInfo; // Pass complete item for complex cells
}

interface TableViewProps {
  countryProductData: FetchedCountryProductInfo[]; 
  timePeriodLabels: Record<number, string>;
  selectedTimePeriod: number; 
  selectedGlobalCurrency: GlobalCurrency;     
  monthForApi: string;                        
  onCountrySelect: (countryCode: string) => void; 
}

export function TableView({
  countryProductData,
  timePeriodLabels, 
  selectedTimePeriod, 
  selectedGlobalCurrency,
  monthForApi,
  onCountrySelect 
}: TableViewProps) {
  const currentPeriodLabel = timePeriodLabels[selectedTimePeriod] || String(selectedTimePeriod);

  // Transform FetchedCountryProductInfo to TableDisplayItem
  const mappedData: TableDisplayItem[] = countryProductData.map((item: FetchedCountryProductInfo) => ({
    id: item.id,
    countryName: item.countryName,
    countryCode: item.countryCode,
    flag: item.flag,
    trendValue: (item.pricesForProduct.currentLocalPrice ?? 0) - (item.pricesForProduct.previousLocalPrice ?? 0),
    fullItemData: item,
  }));

  const sortedDisplayData = [...mappedData].sort((a, b) =>
    a.countryName.localeCompare(b.countryName)
  );

  return (
    <TooltipProvider>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Country</TableHead>
            <TableHead>Price ({selectedGlobalCurrency.code})</TableHead>
            <TableHead>Price Trend</TableHead>
            <TableHead className="text-left min-w-[200px]">Price Chart</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedDisplayData.map((item) => {
            const currentPrice = item.fullItemData.pricesForProduct.currentLocalPrice;
            const previousPrice = item.fullItemData.pricesForProduct.previousLocalPrice;
            let trendPercentage: number | null = null;
            if (currentPrice !== null && previousPrice !== null && previousPrice !== 0) {
              trendPercentage = ((currentPrice - previousPrice) / previousPrice) * 100;
            }

            return (
              <TableRow key={item.id} onClick={() => onCountrySelect(item.countryCode)} className="cursor-pointer hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>{item.flag || item.countryCode}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{item.countryName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <ConvertedPriceCell
                    countryProductInfo={item.fullItemData} // Pass the full original item
                    targetGlobalCurrency={selectedGlobalCurrency} // Corrected prop name
                    year={selectedTimePeriod} // This is the main year context
                    month={monthForApi}       // Month context for API calls
                    priceType="current" // Explicitly ask for current price
                  />
                </TableCell>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div> 
                        <PriceTrendCell
                          currentPrice={currentPrice}
                          previousPrice={previousPrice}
                          currencySymbol={item.fullItemData.currencyMeta.symbol} 
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-background border text-foreground">
                      <div className="text-sm">
                        <div>Current ({currentPeriodLabel}): {formatLocalPrice(currentPrice, item.fullItemData.currencyMeta)}</div>
                        {item.fullItemData.pricesForProduct.previousAvailableYear && (
                          <div>
                            Previous ({item.fullItemData.pricesForProduct.previousAvailableYear}): 
                            {formatLocalPrice(previousPrice, item.fullItemData.currencyMeta)}
                          </div>
                        )}
                        {trendPercentage !== null && (
                           <div className="mt-1">
                            Change: {trendPercentage === Infinity || trendPercentage === -Infinity ? 'N/A' : trendPercentage.toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell className="min-w-[200px]">
                  <InlineChartCell
                    countryProductInfo={item.fullItemData} 
                    timePeriodLabel={currentPeriodLabel}
                    currencySymbol={item.fullItemData.currencyMeta.symbol} 
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TooltipProvider>
  );
}
