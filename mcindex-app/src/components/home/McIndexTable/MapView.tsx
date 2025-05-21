"use client";

import type { FetchedCountryProductInfo } from '@/app/api/countries/route';

// Placeholder types - MapDataPoint now reflects what we can get from FetchedCountryProductInfo
interface MapDataPoint {
  countryName: string;    // from FetchedCountryProductInfo.countryName
  countryCode: string;    // from FetchedCountryProductInfo.countryCode
  localPrice: number | null; // from FetchedCountryProductInfo.pricesForProduct.currentLocalPrice
  currencyCode: string;   // from FetchedCountryProductInfo.currencyMeta.code
  // Potentially add converted price if MapVisualization needs it, 
  // or handle conversion within MapVisualization if it becomes more complex.
}

// Placeholder component
const MapVisualization = (
  { data, periodLabel }: 
  { data: MapDataPoint[]; periodLabel: string } 
) => {
  return (
    <div className="w-full h-64 bg-gray-200 rounded-sm flex items-center justify-center text-gray-500">
      [Map Visualization: {data.length} locations for {periodLabel}]
      {/* Example of how you might display some data points */}
      {/* {data.slice(0, 3).map(d => <div key={d.countryCode}>{d.countryName}: {d.localPrice} {d.currencyCode}</div>)} */}
    </div>
  );
};

interface MapViewProps {
  countryProductData: FetchedCountryProductInfo[]; // Updated prop
  timePeriodLabels: Record<number, string>; 
  selectedTimePeriod: number;            
  // selectedGlobalCurrency and monthForApi could be passed if conversion is needed here
}

export function MapView({ countryProductData, timePeriodLabels, selectedTimePeriod }: MapViewProps) {
  const mapData: MapDataPoint[] = countryProductData
    .filter(item => item.pricesForProduct.currentLocalPrice !== null) // Only include items with a price
    .map((item) => ({
      countryName: item.countryName,
      countryCode: item.countryCode,
      localPrice: item.pricesForProduct.currentLocalPrice,
      currencyCode: item.currencyMeta.code,
    }));

  const currentPeriodLabel = timePeriodLabels[selectedTimePeriod] || String(selectedTimePeriod);

  if (!countryProductData || countryProductData.length === 0) {
    return (
      <div className="border rounded-md p-4 text-center text-muted-foreground">
        No data available for map visualization for {currentPeriodLabel}.
      </div>
    );
  }

  return (
    <div className="border rounded-md p-4">
      <MapVisualization
        data={mapData}
        periodLabel={currentPeriodLabel}
      />
    </div>
  );
}
