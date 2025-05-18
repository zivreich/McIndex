"use client";

import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Placeholder types - these would typically be imported or defined in a shared types file
interface Currency {
  code: string;
  symbol: string;
}

interface CountryData {
  code: string;
  country: string;
  price: number;
  priceInSelectedCurrency: number;
  previousPrice: number;
  previousPriceInSelectedCurrency: number;
  currency: string; // local currency code
}

// Placeholder utility functions - these would typically be in a utils file
const formatPrice = (price: number, currencySymbol: string = '$') => `${currencySymbol}${price.toFixed(2)}`;
const formatLocalPrice = (price: number, localCurrencySymbol: string = '') => `${localCurrencySymbol}${price.toFixed(2)}`;

// Placeholder components - these would be actual components
const PriceTrendCell = (
  { currentPrice, previousPrice, timePeriod, currencySymbol }: 
  { currentPrice: number; previousPrice: number; timePeriod: string; currencySymbol: string }
) => {
  const trend = currentPrice - previousPrice;
  return (
    <div className={`flex items-center ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
      {trend >= 0 ? '▲' : '▼'} {formatPrice(Math.abs(trend), currencySymbol)} ({((trend / previousPrice) * 100).toFixed(1)}%)
      <span className="text-xs text-muted-foreground ml-1">vs {timePeriod}</span>
    </div>
  );
};

const InlineChartCell = (
  { data, currentItem, timePeriod, currencyCode, currencySymbol }: 
  { data: CountryData[]; currentItem: CountryData; timePeriod: string; currencyCode: string; currencySymbol: string }
) => {
  // Simple visual placeholder for an inline chart
  return (
    <div className="w-full h-10 bg-gray-200 rounded-sm flex items-center justify-center text-xs text-gray-500">
      [Inline Chart for {currentItem.country} - {currencySymbol}]
    </div>
  );
};

interface TableViewProps {
  sortedData: CountryData[];
  timePeriodLabels: { [key: string]: string };
  selectedTimePeriod: string;
  currency: Currency;
}

export function TableView({ sortedData, timePeriodLabels, selectedTimePeriod, currency }: TableViewProps) {
  if (!sortedData || sortedData.length === 0) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[20%]">Country</TableHead>
            <TableHead className="w-[25%]">Current Price</TableHead>
            <TableHead className="whitespace-nowrap">
              Trend ({timePeriodLabels[selectedTimePeriod] || selectedTimePeriod})
            </TableHead>
            <TableHead className="w-[40%]">Price Comparison</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={4} className="text-center py-8">
              No countries found or data is loading...
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  return (
    <TooltipProvider>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[20%]">Country</TableHead>
            <TableHead className="w-[25%]">Current Price</TableHead>
            <TableHead className="whitespace-nowrap">
              Trend ({timePeriodLabels[selectedTimePeriod]})
            </TableHead>
            <TableHead className="w-[40%]">Price Comparison</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">
                <Link
                  href={`/countries/${item.code.toLowerCase()}`}
                  className="hover:underline hover:text-primary transition-colors"
                >
                  {item.country}
                </Link>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <div className="font-medium">{formatPrice(item.priceInSelectedCurrency, currency.symbol)}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatLocalPrice(item.price, item.currency)} {/* Assuming item.currency is the symbol here for simplicity */}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <PriceTrendCell
                        currentPrice={item.priceInSelectedCurrency}
                        previousPrice={item.previousPriceInSelectedCurrency}
                        timePeriod={selectedTimePeriod}
                        currencySymbol={currency.symbol}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <div className="text-xs">
                      <div className="font-bold mb-1">Price Change in Local Currency:</div>
                      <div>Current: {formatLocalPrice(item.price, item.currency)}</div>
                      <div>
                        {timePeriodLabels[selectedTimePeriod]}:{" "}
                        {formatLocalPrice(item.previousPrice, item.currency)}
                      </div>
                      <div className="mt-1">
                        Change: {(((item.price - item.previousPrice) / item.previousPrice) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TableCell>
              <TableCell className="min-w-[200px]">
                <InlineChartCell
                  data={sortedData}
                  currentItem={item}
                  timePeriod={selectedTimePeriod}
                  currencyCode={currency.code}
                  currencySymbol={currency.symbol}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TooltipProvider>
  );
}
