"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowUpDown, BarChart3, Globe, DollarSign } from "lucide-react";
import { useState } from "react";
import { TableView } from "./TableView";
import { MapView } from "./MapView";
import { PppAnalysisView } from "./PppAnalysisView";

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
  currency: string; 
}

interface BigMacHistoricalDataItem {
  country: string;
  currentPrice: number;
  currency: string;
  code: string;
}

const dummyTimePeriodLabels: { [key: string]: string } = {
  "1M": "1 Month",
  "6M": "6 Months",
  "1Y": "1 Year",
  "5Y": "5 Years",
  ALL: "All Time",
};

const dummySelectedTimePeriod = "1Y";

const dummyCurrency: Currency = {
  code: "USD",
  symbol: "$",
};

const dummySortedData: CountryData[] = [
  {
    code: "US",
    country: "United States",
    price: 5.81,
    priceInSelectedCurrency: 5.81,
    previousPrice: 5.65,
    previousPriceInSelectedCurrency: 5.65,
    currency: "USD",
  },
  {
    code: "EU",
    country: "Euro Area",
    price: 4.85,
    priceInSelectedCurrency: 5.25,
    previousPrice: 4.70,
    previousPriceInSelectedCurrency: 5.10,
    currency: "EUR",
  },
  {
    code: "JP",
    country: "Japan",
    price: 450,
    priceInSelectedCurrency: 3.15,
    previousPrice: 430,
    previousPriceInSelectedCurrency: 3.00,
    currency: "JPY",
  },
];

const dummyBigMacHistoricalData: BigMacHistoricalDataItem[] = dummySortedData.map(item => ({
  country: item.country,
  currentPrice: item.price, 
  currency: item.currency,
  code: item.code,
}));

const dummyCurrentPriceData: CountryData[] = [...dummySortedData]; 

export default function McIndexContent() {
  const [activeTab, setActiveTab] = useState("table");

  const timePeriodLabels = dummyTimePeriodLabels;
  const selectedTimePeriod = dummySelectedTimePeriod;
  const currency = dummyCurrency;
  const sortedData = dummySortedData;
  const bigMacHistoricalData = dummyBigMacHistoricalData;
  const currentPriceData = dummyCurrentPriceData;

  return (
    <Tabs defaultValue="table" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-3 mb-6 w-full">
        <TabsTrigger value="table" className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4" /> Table View
        </TabsTrigger>
        <TabsTrigger value="map" className="flex items-center gap-2">
          <Globe className="h-4 w-4" /> Map View
        </TabsTrigger>
        <TabsTrigger value="ppp" className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" /> PPP Analysis
        </TabsTrigger>
      </TabsList>

      <TabsContent value="table" className="border rounded-md overflow-hidden">
        <TableView 
          sortedData={sortedData} 
          timePeriodLabels={timePeriodLabels} 
          selectedTimePeriod={selectedTimePeriod} 
          currency={currency} 
        />
      </TabsContent>

      <TabsContent value="map">
        <MapView 
          bigMacHistoricalData={bigMacHistoricalData} 
          timePeriodLabels={timePeriodLabels} 
          selectedTimePeriod={selectedTimePeriod} 
        />
      </TabsContent>

      <TabsContent value="ppp">
        <PppAnalysisView 
          currentPriceData={currentPriceData} 
        />
      </TabsContent>
    </Tabs>
  );
}
