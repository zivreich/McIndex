"use client";

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { Currency as GlobalCurrency } from '@/contexts/CurrencyContext';

interface PricePoint {
  date: string; // e.g., "Jan", "Feb", or a full date if available
  price: number;
}

interface PriceHistoryChartProps {
  priceHistory: PricePoint[];
  currency: GlobalCurrency; // To format tooltip, or potentially convert if prices are not already in global currency
  className?: string;
}

const chartConfig = {
  price: {
    label: "Price",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function PriceHistoryChart({ priceHistory, currency, className }: PriceHistoryChartProps) {
  if (!priceHistory || priceHistory.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-10 text-xs text-muted-foreground", className)}>
        No price data available
      </div>
    );
  }

  // Ensure data has at least two points to draw a line
  const chartData = priceHistory.length === 1 ? [...priceHistory, priceHistory[0]] : priceHistory;

  return (
    <div className={cn("w-full h-12", className)}> {/* Adjusted height for table cell */}
      <ChartContainer config={chartConfig} className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 5,
              right: 5,
              left: 5,
              bottom: 0,
            }}
          >
            <CartesianGrid horizontal={false} vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              tickFormatter={(value) => (typeof value === 'string' ? value.slice(0, 3) : '')}
              hide // Hiding XAxis for a cleaner look in a small cell, tooltip will show details
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              hide // Hiding YAxis for a cleaner look
              domain={['dataMin - (dataMax - dataMin) * 0.1', 'dataMax + (dataMax - dataMin) * 0.1']} // Add some padding
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={<ChartTooltipContent
                indicator="line"
                labelFormatter={(label: string | number) => `Date: ${label}`}
                formatter={(value: number) => [
                  `${currency.symbol}${Number(value).toFixed(2)} (${currency.code})`,
                  "Price"
                ]}
              />}
            />
            <Line
              dataKey="price"
              type="monotone"
              strokeWidth={2}
              stroke="var(--color-price)"
              dot={priceHistory.length < 5} // Show dots if few data points
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}

// Helper function cn if not globally available (assuming it's from '@/lib/utils')
// You might need to import it or define it if PriceHistoryChart.tsx doesn't have access to it.
// For example:
function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
