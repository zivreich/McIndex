"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowUpDown, Globe, DollarSign, Loader2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { TableView } from "./TableView";
import { MapView } from "./MapView";
import { PppAnalysisView } from "./PppAnalysisView";
import { useCurrency } from "@/contexts/CurrencyContext"; 
import { useProduct } from "@/contexts/ProductContext"; 
import { useQuery } from "@tanstack/react-query"; 

interface FetchedCountryProductInfo {
  id: string;
  countryName: string;
  countryCode: string;
  currencyMeta: { code: string; decimals: boolean; symbol: string; };
  flag: string;
  selectedProductId: string; 
  pricesForProduct: {
    requestedYear: number;
    currentLocalPrice: number | null;
    previousAvailableYear: number | null;
    previousLocalPrice: number | null;
  };
}

interface McIndexContentProps {
  timePeriodLabels: Record<number, string>;
  selectedTimePeriod: number;
}

const fetchCountryProductData = async (year: number, productId: string): Promise<FetchedCountryProductInfo[]> => {
  const res = await fetch(`/api/countries?year=${year}&product_id=${productId}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Failed to fetch country product data and parse error response' }));
    throw new Error(errorData.error || 'Failed to fetch country product data');
  }
  const data = await res.json();
  if (!Array.isArray(data)) {
    console.error('API /api/countries did not return an array:', data);
    throw new Error('Invalid data format from /api/countries');
  }
  return data;
};

export default function McIndexContent({
  timePeriodLabels,
  selectedTimePeriod,
}: McIndexContentProps) {
  const [activeTab, setActiveTab] = useState("table");
  const { selectedCurrency } = useCurrency(); 
  const { selectedProductId } = useProduct(); 

  const getMonthNameForApi = (year: number) => {
    const userCurrentDate = new Date("2025-05-21T10:28:40+03:00"); 
    if (year === userCurrentDate.getFullYear()) {
      return userCurrentDate.toLocaleString('en-US', { month: 'long' }); 
    }
    return "January"; 
  };
  const monthForApi = getMonthNameForApi(selectedTimePeriod);

  const { 
    data: countryProductData, 
    isLoading: isLoadingCountryProductData,
    isError: isErrorCountryProductData,
    error: countryProductDataError
  } = useQuery<FetchedCountryProductInfo[], Error>({
    queryKey: ['countryProductData', selectedTimePeriod, selectedProductId],
    queryFn: () => fetchCountryProductData(selectedTimePeriod, selectedProductId),
    staleTime: 1000 * 60 * 5, 
  });

  const handleCountrySelect = (countryCode: string) => {
    console.log("Country selected in McIndexContent:", countryCode);
  };
  
  if (isLoadingCountryProductData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading product data for table...</p>
      </div>
    );
  }

  if (isErrorCountryProductData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-4 border rounded-md bg-destructive/10 text-destructive">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <p className="font-semibold">Error loading product data:</p>
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
          countryProductData={countryProductData || []} 
          timePeriodLabels={timePeriodLabels} 
          selectedTimePeriod={selectedTimePeriod} 
          selectedGlobalCurrency={selectedCurrency} 
          monthForApi={monthForApi} 
          onCountrySelect={handleCountrySelect} 
        />
      </TabsContent>

      <TabsContent value="map">
        <MapView 
          countryProductData={countryProductData || []} 
          timePeriodLabels={timePeriodLabels} 
          selectedTimePeriod={selectedTimePeriod} 
        />
      </TabsContent>

      <TabsContent value="ppp">
        <PppAnalysisView 
          countryProductData={countryProductData || []} 
        />
      </TabsContent>
    </Tabs>
  );
}
