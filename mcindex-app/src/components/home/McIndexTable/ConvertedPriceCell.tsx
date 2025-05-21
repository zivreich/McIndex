"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2Icon, AlertCircleIcon } from 'lucide-react';
import type { Currency as GlobalCurrency } from '@/contexts/CurrencyContext';
import type { FetchedCountryProductInfo } from '@/app/api/countries/route'; // For LocalCurrencyMeta type

interface ExchangeRateApiResponse {
  rate: number;
  // Other fields like baseCurrency, targetCurrency, year, month might be present but we only need rate here
}

export interface ConvertedPriceCellProps {
  countryProductInfo: FetchedCountryProductInfo;
  targetGlobalCurrency: GlobalCurrency;
  year: number; // This should be the 'requestedYear' for the price
  month: string; // Renamed from monthForApi for clarity within this component
  priceType?: 'current' | 'previous'; // Default to 'current'
}

const fetchExchangeRate = async (year: number, month: string, currencyCode: string): Promise<ExchangeRateApiResponse> => {
  if (currencyCode === 'USD') {
    return { rate: 1 }; // USD to USD is always 1
  }
  const response = await fetch(`/api/exchange-rates?year=${year}&month=${month}&currency=${currencyCode}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to fetch exchange rate for ${currencyCode}`);
  }
  return response.json();
};

export function ConvertedPriceCell({
  countryProductInfo,
  targetGlobalCurrency,
  year,      // This 'year' prop is the selected year for context, might differ from price's year
  month,     // Renamed from monthForApi
  priceType = 'current',
}: ConvertedPriceCellProps) {
  const localCurrencyMeta = countryProductInfo.currencyMeta;
  const localPrice = priceType === 'current' 
    ? countryProductInfo.pricesForProduct.currentLocalPrice 
    : countryProductInfo.pricesForProduct.previousLocalPrice;
  
  // Determine the year to use for fetching exchange rates based on priceType
  const yearForExchangeRate = priceType === 'current'
    ? countryProductInfo.pricesForProduct.requestedYear
    : countryProductInfo.pricesForProduct.previousAvailableYear ?? countryProductInfo.pricesForProduct.requestedYear;

  const localCode = localCurrencyMeta.code;
  const globalCode = targetGlobalCurrency.code;

  // Define currencies that typically don't use decimal places
  const zeroDecimalCurrencies = ['JPY', 'KRW', 'VND']; // Added more examples

  // Query for USD -> Local Currency rate
  const {
    data: usdToLocalRateData,
    isLoading: isLoadingUsdToLocal,
    isError: isErrorUsdToLocal,
  } = useQuery<ExchangeRateApiResponse, Error>({
    queryKey: ['exchangeRate', yearForExchangeRate, month, localCode],
    queryFn: () => fetchExchangeRate(yearForExchangeRate, month, localCode),
    enabled: localCode !== 'USD' && localPrice !== null, // Only fetch if local currency is not USD and price exists
  });

  // Query for USD -> Target Global Currency rate
  const {
    data: usdToGlobalRateData,
    isLoading: isLoadingUsdToGlobal,
    isError: isErrorUsdToGlobal,
  } = useQuery<ExchangeRateApiResponse, Error>({
    queryKey: ['exchangeRate', yearForExchangeRate, month, globalCode],
    queryFn: () => fetchExchangeRate(yearForExchangeRate, month, globalCode),
    enabled: globalCode !== 'USD' && localPrice !== null, // Only fetch if global currency is not USD and price exists
  });

  if (localPrice === null || typeof localPrice === 'undefined') {
    return <>N/A</>;
  }

  const isLoading = (localCode !== 'USD' && isLoadingUsdToLocal) || (globalCode !== 'USD' && isLoadingUsdToGlobal);
  const isError = (localCode !== 'USD' && isErrorUsdToLocal) || (globalCode !== 'USD' && isErrorUsdToGlobal);

  if (isLoading) {
    return <div className="flex items-center text-muted-foreground"><Loader2Icon className="mr-2 h-4 w-4 animate-spin" /></div>;
  }

  if (isError) {
    return <div className="flex items-center text-red-600"><AlertCircleIcon className="mr-2 h-4 w-4" /> Rate Err</div>;
  }

  let priceInUsd: number;
  if (localCode === 'USD') {
    priceInUsd = localPrice;
  } else {
    if (!usdToLocalRateData || typeof usdToLocalRateData.rate !== 'number') {
      return <div className="flex items-center text-red-600"><AlertCircleIcon className="mr-2 h-4 w-4" /> LRate Err</div>;
    }
    priceInUsd = localPrice / usdToLocalRateData.rate;
  }

  let finalPrice: number;
  if (globalCode === 'USD') {
    finalPrice = priceInUsd;
  } else {
    if (!usdToGlobalRateData || typeof usdToGlobalRateData.rate !== 'number') {
      return <div className="flex items-center text-red-600"><AlertCircleIcon className="mr-2 h-4 w-4" /> GRate Err</div>;
    }
    finalPrice = priceInUsd * usdToGlobalRateData.rate;
  }

  const displayDecimals = zeroDecimalCurrencies.includes(globalCode) ? 0 : 2;

  return (
    <>
      {targetGlobalCurrency.symbol}{finalPrice.toFixed(displayDecimals)}
    </>
  );
}
