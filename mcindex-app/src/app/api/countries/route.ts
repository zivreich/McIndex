import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Define the structure of the raw data we expect in data-sample.json
// This helps with type safety when accessing nested properties.
interface RawCurrencyData {
  code: string;
  decimals: boolean;
  symbol: string;
}

interface RawPriceData {
  [year: string]: number;
}

interface RawProductPrices {
  [productKey: string]: RawPriceData;
}

interface RawEconomyData {
  [indicator: string]: {
    [year: string]: number;
  };
}

interface RawMetaData {
  flag: string;
  continent: string;
  capital: string;
  population: number;
  areaKm2: number;
  majorCities: string[];
  languages: string[];
  timeZone: string;
  drivingSide: string;
  about: string;
}

interface RawCountryEntry {
  country: string;
  code: string; // Display code, e.g., "US"
  currency: RawCurrencyData;
  prices: RawProductPrices;
  economy: RawEconomyData;
  meta: RawMetaData;
}

interface RawDataSample {
  [countryId: string]: RawCountryEntry; // e.g., "us", "de"
}

// Define the structure of the data we'll return from the API
export interface FetchedCountryProductInfo {
  id: string;                   // 'us', 'de', etc. (original key)
  countryName: string;
  countryCode: string;          // "US" (for display, linking)
  currencyMeta: RawCurrencyData;
  flag: string;
  selectedProductId: string;    // New field: To indicate which product was selected
  pricesForProduct: {
    requestedYear: number;
    currentLocalPrice: number | null;
    previousAvailableYear: number | null;
    previousLocalPrice: number | null;
    historicalPrices: Array<{ date: string; price: number }>; // Added for line chart
  };
}

const PRODUCT_KEY_DEFAULT = 'big-mac';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const yearParam = searchParams.get('year');
    const productKeyParam = searchParams.get('product_id');
    const randomizeParam = searchParams.get('randomize');

    if (!yearParam) {
      return NextResponse.json({ error: 'Year query parameter is required' }, { status: 400 });
    }

    const requestedYear = parseInt(yearParam, 10);
    if (isNaN(requestedYear)) {
      return NextResponse.json({ error: 'Year must be a valid number' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'src', 'data', 'data-sample.json');
    const jsonData = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(jsonData) as RawDataSample;

    const responseData: FetchedCountryProductInfo[] = Object.keys(data).map(countryId => {
      const countryEntry = data[countryId];
      if (!countryEntry) return null;

      let productKeyToUse: string;
      let selectedProductIdForResponse: string;

      if (productKeyParam) {
        productKeyToUse = productKeyParam;
        selectedProductIdForResponse = productKeyParam;
        if (!countryEntry.prices?.[productKeyToUse]) {
          // Decide handling: for now, prices will be null. Could also error or use default.
        }
      } else if (randomizeParam === 'true') {
        const availableProductKeys = Object.keys(countryEntry.prices || {});
        if (availableProductKeys.length === 0) {
          return {
            id: countryId,
            countryName: countryEntry.country,
            countryCode: countryEntry.code,
            currencyMeta: countryEntry.currency,
            flag: countryEntry.meta.flag,
            selectedProductId: "N/A",
            pricesForProduct: {
              requestedYear,
              currentLocalPrice: null,
              previousAvailableYear: null,
              previousLocalPrice: null,
              historicalPrices: [],
            },
          };
        }
        const randomIndex = Math.floor(Math.random() * availableProductKeys.length);
        productKeyToUse = availableProductKeys[randomIndex];
        selectedProductIdForResponse = productKeyToUse;
      } else {
        productKeyToUse = PRODUCT_KEY_DEFAULT;
        selectedProductIdForResponse = PRODUCT_KEY_DEFAULT;
      }

      const productPrices = countryEntry.prices?.[productKeyToUse];
      let currentLocalPrice: number | null = null;
      let previousLocalPrice: number | null = null;
      let previousAvailableYear: number | null = null;
      const historicalPrices: Array<{ date: string; price: number }> = []; // Initialize historical prices

      if (productPrices) {
        currentLocalPrice = productPrices[String(requestedYear)] ?? null;

        // Populate historical prices
        Object.keys(productPrices).forEach(yearStr => {
          const yearNum = parseInt(yearStr, 10);
          if (!isNaN(yearNum) && productPrices[yearStr] !== null && productPrices[yearStr] !== undefined) {
            historicalPrices.push({ date: yearStr, price: productPrices[yearStr] });
          }
        });
        // Sort historical prices by year ascending for the chart
        historicalPrices.sort((a, b) => parseInt(a.date, 10) - parseInt(b.date, 10));

        const availableYears = Object.keys(productPrices)
          .map(y => parseInt(y, 10))
          .filter(y => !isNaN(y) && y < requestedYear)
          .sort((a, b) => b - a);

        if (availableYears.length > 0) {
          previousAvailableYear = availableYears[0];
          previousLocalPrice = productPrices[String(previousAvailableYear)] ?? null;
        }
      }

      return {
        id: countryId,
        countryName: countryEntry.country,
        countryCode: countryEntry.code,
        currencyMeta: countryEntry.currency,
        flag: countryEntry.meta.flag,
        selectedProductId: selectedProductIdForResponse,
        pricesForProduct: {
          requestedYear,
          currentLocalPrice,
          previousAvailableYear,
          previousLocalPrice,
          historicalPrices, // Added historical prices to response
        },
      };
    }).filter(Boolean) as FetchedCountryProductInfo[];

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('API Error fetching country data:', error);
    let errorMessage = 'Internal Server Error';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return NextResponse.json({ error: 'Data file not found' }, { status: 500 });
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
