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
  { data: MapDataPoint[]; periodLabel: string }
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
  timePeriodLabels: { [key: string]: string };
  selectedTimePeriod: string;
}

export function MapView({ bigMacHistoricalData, timePeriodLabels, selectedTimePeriod }: MapViewProps) {
  const mapData = bigMacHistoricalData.map((item) => ({
    country: item.country,
    price: item.currentPrice,
    currency: item.currency,
    code: item.code,
  }));

  return (
    <div className="border rounded-md p-4">
      <MapVisualization
        data={mapData}
        periodLabel={timePeriodLabels[selectedTimePeriod] || selectedTimePeriod}
      />
    </div>
  );
}
