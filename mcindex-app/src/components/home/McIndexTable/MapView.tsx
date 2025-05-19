"use client";

// Placeholder types
interface MapDataPoint {
  country: string;
  price: number;
  currency: string;
  code: string;
}

// Placeholder component
const MapVisualization = (
  { data, periodLabel }: 
  { data: MapDataPoint[]; periodLabel: string } // Expects a string label
) => {
  return (
    <div className="w-full h-64 bg-gray-200 rounded-sm flex items-center justify-center text-gray-500">
      [Map Visualization: {data.length} locations for {periodLabel}]
    </div>
  );
};

interface MapViewProps {
  bigMacHistoricalData: Array<{
    country: string;
    currentPrice: number; // Assuming this maps to 'price' for MapDataPoint
    currency: string;
    code: string;
    // other fields from original data structure
  }>;
  timePeriodLabels: Record<number, string>; // Changed to number keys
  selectedTimePeriod: number;             // Changed to number
}

export function MapView({ bigMacHistoricalData, timePeriodLabels, selectedTimePeriod }: MapViewProps) {
  const mapData: MapDataPoint[] = bigMacHistoricalData.map((item) => ({
    country: item.country,
    price: item.currentPrice,
    currency: item.currency,
    code: item.code,
  }));

  // Get the string label for the selected year, fallback to stringified year if not found
  const currentPeriodLabel = timePeriodLabels[selectedTimePeriod] || String(selectedTimePeriod);

  return (
    <div className="border rounded-md p-4">
      <MapVisualization
        data={mapData}
        periodLabel={currentPeriodLabel} // Pass the string label
      />
    </div>
  );
}
