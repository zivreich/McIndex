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

interface ConvertedPriceCellProps {
  localPrice: number | null;
  localCurrencyMeta: FetchedCountryProductInfo['currencyMeta'];
  targetGlobalCurrency: GlobalCurrency;
  year: number;
  monthForApi: string;
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
  localPrice,
  localCurrencyMeta,
  targetGlobalCurrency,
  year,
  monthForApi,
}: ConvertedPriceCellProps) {
  const localCode = localCurrencyMeta.code;
  const globalCode = targetGlobalCurrency.code;

  // Define currencies that typically don't use decimal places
  const zeroDecimalCurrencies = ['JPY']; // Add other codes like 'KRW', 'VND' if needed

  // Query for USD -> Local Currency rate (if local is not USD)
  const {
    data: usdToLocalRateData,
    isLoading: isLoadingUsdToLocal,
    isError: isErrorUsdToLocal,
  } = useQuery<ExchangeRateApiResponse, Error>({
    queryKey: ['exchangeRate', year, monthForApi, localCode],
    queryFn: () => fetchExchangeRate(year, monthForApi, localCode),
    enabled: localCode !== 'USD', // Only fetch if local currency is not USD
  });

  // Query for USD -> Target Global Currency rate (if target is not USD)
  const {
    data: usdToGlobalRateData,
    isLoading: isLoadingUsdToGlobal,
    isError: isErrorUsdToGlobal,
  } = useQuery<ExchangeRateApiResponse, Error>({
    queryKey: ['exchangeRate', year, monthForApi, globalCode],
    queryFn: () => fetchExchangeRate(year, monthForApi, globalCode),
    enabled: globalCode !== 'USD', // Only fetch if global currency is not USD
  });

  if (localPrice === null || typeof localPrice === 'undefined') {
    return <>N/A</>;
  }

  // Handle direct match or if one of them is USD, one query might not run
  const isLoading = (localCode !== 'USD' && isLoadingUsdToLocal) || (globalCode !== 'USD' && isLoadingUsdToGlobal);
  const isError = (localCode !== 'USD' && isErrorUsdToLocal) || (globalCode !== 'USD' && isErrorUsdToGlobal);

  if (isLoading) {
    return <div className="flex items-center text-muted-foreground"><Loader2Icon className="mr-2 h-4 w-4 animate-spin" /></div>;
  }

  if (isError) {
    return <div className="flex items-center text-red-600"><AlertCircleIcon className="mr-2 h-4 w-4" /> Error</div>;
  }

  let priceInUsd: number;
  if (localCode === 'USD') {
    priceInUsd = localPrice;
  } else {
    if (!usdToLocalRateData || typeof usdToLocalRateData.rate !== 'number') {
      // This case should ideally be caught by isError, but as a fallback:
      return <div className="flex items-center text-red-600"><AlertCircleIcon className="mr-2 h-4 w-4" /> Rate missing</div>;
    }
    priceInUsd = localPrice / usdToLocalRateData.rate;
  }

  let finalPrice: number;
  if (globalCode === 'USD') {
    finalPrice = priceInUsd;
  } else {
    if (!usdToGlobalRateData || typeof usdToGlobalRateData.rate !== 'number') {
      // This case should ideally be caught by isError, but as a fallback:
      return <div className="flex items-center text-red-600"><AlertCircleIcon className="mr-2 h-4 w-4" /> Rate missing</div>;
    }
    finalPrice = priceInUsd * usdToGlobalRateData.rate;
  }

  const decimalPlaces = zeroDecimalCurrencies.includes(targetGlobalCurrency.code) ? 0 : 2;
  return <>{`${targetGlobalCurrency.symbol}${finalPrice.toFixed(decimalPlaces)}`}</>;
}
