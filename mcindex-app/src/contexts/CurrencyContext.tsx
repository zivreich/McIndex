"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface Currency {
  code: string; // e.g., "USD", "EUR"
  name: string; // e.g., "US Dollar", "Euro"
  symbol: string; // e.g., "$", "€"
}

interface CurrencyContextType {
  selectedCurrency: Currency;
  setSelectedCurrency: (currency: Currency) => void;
  availableCurrencies: Currency[];
}

const defaultCurrency: Currency = { code: 'USD', name: 'US Dollar', symbol: '$' };

const availableCurrenciesList: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  // Add more currencies as needed
];

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCurrency, setSelectedCurrencyState] = useState<Currency>(defaultCurrency);

  const setSelectedCurrency = (currency: Currency) => {
    setSelectedCurrencyState(currency);
  };

  return (
    <CurrencyContext.Provider value={{ selectedCurrency, setSelectedCurrency, availableCurrencies: availableCurrenciesList }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
