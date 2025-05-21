"use client";

import type { FetchedCountryProductInfo } from '@/app/api/countries/route';

// Updated PppDataPoint to reflect data from FetchedCountryProductInfo
interface PppDataPoint {
  countryName: string;
  countryCode: string;
  localPrice: number | null;
  currencyCode: string;
  // For a full PPP analysis, you'd also need exchange rates to USD
  // and then compare the implied PPP rate to the actual exchange rate.
  // This might involve fetching exchange rates here or passing converted prices.
}

// Placeholder component
const PppVisualization = ({ data }: { data: PppDataPoint[] }) => {
  return (
    <div className="w-full h-64 bg-gray-200 rounded-sm flex items-center justify-center text-gray-500">
      [PPP Visualization: {data.length} data points]
      {/* Example display */}
      {/* {data.slice(0,3).map(d => <div key={d.countryCode}>{d.countryName}: {d.localPrice} {d.currencyCode}</div>)} */}
    </div>
  );
};

interface PppAnalysisViewProps {
  countryProductData: FetchedCountryProductInfo[]; // Updated prop
  // Potentially add selectedTimePeriod, selectedGlobalCurrency, monthForApi if complex calcs needed here
}

export function PppAnalysisView({ countryProductData }: PppAnalysisViewProps) {
  const pppData: PppDataPoint[] = countryProductData
    .filter(item => item.pricesForProduct.currentLocalPrice !== null)
    .map((item) => ({
      countryName: item.countryName,
      countryCode: item.countryCode,
      localPrice: item.pricesForProduct.currentLocalPrice,
      currencyCode: item.currencyMeta.code,
    }));
  
  if (!countryProductData || countryProductData.length === 0) {
    return (
      <div className="border rounded-md p-4 text-center text-muted-foreground">
        No data available for PPP Analysis.
      </div>
    );
  }

  return (
    <div className="border rounded-md p-4">
      <PppVisualization data={pppData} />
    </div>
  );
}
