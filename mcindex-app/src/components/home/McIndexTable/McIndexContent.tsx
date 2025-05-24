"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowUpDown, Globe, DollarSign, Loader2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { TableView } from "./TableView";
import { MapView } from "./MapView";
import { PppAnalysisView } from "./PppAnalysisView";
import { useCurrency, type Currency as GlobalCurrency } from "@/contexts/CurrencyContext"; 
import { useProduct } from "@/contexts/ProductContext"; 
import { useQuery } from "@tanstack/react-query"; 
import type { FetchedCountryProductInfo } from '@/app/api/countries/route';

// New interface for enhanced data
export interface EnhancedCountryProductInfo extends FetchedCountryProductInfo {
  currentGlobalPrice: number | null;
}

interface ProcessedData {
  data: EnhancedCountryProductInfo[];
  minGlobalPrice: number;
  maxGlobalPrice: number;
}

interface McIndexContentProps {
  timePeriodLabels: Record<number, string>;
  selectedTimePeriod: number;
  searchTerm?: string;
}

// Helper to fetch a single exchange rate
async function fetchExchangeRate(year: number, month: string, currencyCode: string): Promise<number | null> {
  if (currencyCode === 'USD') return 1.0; // USD to USD is 1
  try {
    const res = await fetch(`/api/exchange-rates?year=${year}&month=${month}&currency=${currencyCode}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.rate || null;
  } catch (error) {
    console.error(`Failed to fetch exchange rate for ${currencyCode}`, error);
    return null;
  }
}

const fetchAndProcessCountryData = async (
  year: number, 
  productId: string, 
  monthForApi: string, 
  targetGlobalCurrency: GlobalCurrency
): Promise<ProcessedData> => {
  const countryRes = await fetch(`/api/countries?year=${year}&product_id=${productId}`);
  if (!countryRes.ok) {
    const errorData = await countryRes.json().catch(() => ({ error: 'Failed to fetch country product data and parse error response' }));
    throw new Error(errorData.error || 'Failed to fetch country product data');
  }
  const baseCountryData: FetchedCountryProductInfo[] = await countryRes.json();
  if (!Array.isArray(baseCountryData)) {
    console.error('API /api/countries did not return an array:', baseCountryData);
    throw new Error('Invalid data format from /api/countries');
  }

  const enhancedData: EnhancedCountryProductInfo[] = [];
  const globalPrices: number[] = [];

  for (const item of baseCountryData) {
    let currentGlobalPrice: number | null = null;
    const localPrice = item.pricesForProduct.currentLocalPrice;
    const localCurrencyCode = item.currencyMeta.code;

    if (localPrice !== null) {
      if (localCurrencyCode === targetGlobalCurrency.code) {
        currentGlobalPrice = localPrice;
      } else {
        // Convert local currency to USD first
        const localToUsdRate = localCurrencyCode === 'USD' ? 1.0 : await fetchExchangeRate(year, monthForApi, localCurrencyCode);
        
        if (localToUsdRate !== null) {
          const priceInUsd = localPrice / localToUsdRate; // Convert local to USD (local currency is the target for the rate)

          if (targetGlobalCurrency.code === 'USD') {
            currentGlobalPrice = priceInUsd;
          } else {
            // Convert USD to target global currency
            const usdToGlobalRate = await fetchExchangeRate(year, monthForApi, targetGlobalCurrency.code);
            if (usdToGlobalRate !== null) {
              currentGlobalPrice = priceInUsd * usdToGlobalRate;
            }
          }
        }
      }
    }
    
    if (currentGlobalPrice !== null) {
      globalPrices.push(currentGlobalPrice);
    }
    enhancedData.push({ ...item, currentGlobalPrice });
  }

  const minGlobalPrice = globalPrices.length > 0 ? Math.min(...globalPrices) : 0;
  const maxGlobalPrice = globalPrices.length > 0 ? Math.max(...globalPrices) : 0;

  return { data: enhancedData, minGlobalPrice, maxGlobalPrice };
};

export default function McIndexContent({
  timePeriodLabels,
  selectedTimePeriod,
  searchTerm = "",
}: McIndexContentProps) {
  const [activeTab, setActiveTab] = useState("table");
  const { selectedCurrency } = useCurrency(); 
  const { selectedProductId } = useProduct(); 

  const getMonthNameForApi = (year: number) => {
    const userCurrentDate = new Date("2025-05-21T15:40:47+03:00"); 
    if (year === userCurrentDate.getFullYear()) {
      return userCurrentDate.toLocaleString('en-US', { month: 'long' }); 
    }
    return "January"; 
  };
  const monthForApi = getMonthNameForApi(selectedTimePeriod);

  const { 
    data: processedCountryData,
    isLoading: isLoadingCountryProductData,
    isError: isErrorCountryProductData,
    error: countryProductDataError
  } = useQuery<ProcessedData, Error>({
    queryKey: ['processedCountryProductData', selectedTimePeriod, selectedProductId, selectedCurrency.code, monthForApi],
    queryFn: () => fetchAndProcessCountryData(selectedTimePeriod, selectedProductId, monthForApi, selectedCurrency),
    staleTime: 1000 * 60 * 5, 
    enabled: !!selectedProductId && !!selectedCurrency.code, // Only run if product and currency are selected
  });
  
  // Further destructure for convenience, providing defaults
  const countryProductDataForView = processedCountryData?.data || [];
  const minGlobalPriceForView = processedCountryData?.minGlobalPrice || 0;
  const maxGlobalPriceForView = processedCountryData?.maxGlobalPrice || 0;

  const handleCountrySelect = (countryCode: string) => {
    console.log("Country selected in McIndexContent:", countryCode);
  };
  
  if (isLoadingCountryProductData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading and processing product data...</p>
      </div>
    );
  }

  if (isErrorCountryProductData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-4 border rounded-md bg-destructive/10 text-destructive">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <p className="font-semibold">Error loading or processing product data:</p>
        <p className="text-sm">{(countryProductDataError as Error)?.message || 'An unknown error occurred'}</p>
      </div>
    );
  }

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
          countryProductData={countryProductDataForView} 
          minGlobalPrice={minGlobalPriceForView}
          maxGlobalPrice={maxGlobalPriceForView}
          timePeriodLabels={timePeriodLabels} 
          selectedTimePeriod={selectedTimePeriod} 
          selectedGlobalCurrency={selectedCurrency} 
          monthForApi={monthForApi} 
          onCountrySelect={handleCountrySelect} 
          searchTerm={searchTerm}
        />
      </TabsContent>

      <TabsContent value="map">
        <MapView 
          countryProductData={countryProductDataForView} // Pass enhanced data if MapView needs global prices
          timePeriodLabels={timePeriodLabels} 
          selectedTimePeriod={selectedTimePeriod} 
        />
      </TabsContent>

      <TabsContent value="ppp">
        <PppAnalysisView 
          countryProductData={countryProductDataForView} // Pass enhanced data if PppAnalysisView needs global prices
        />
      </TabsContent>
    </Tabs>
  );
}
