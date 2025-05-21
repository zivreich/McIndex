"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ProductContextType {
  selectedProductId: string;
  setSelectedProductId: (productId: string) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const DEFAULT_PRODUCT_ID = 'big-mac'; // Default product

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [selectedProductId, setSelectedProductIdState] = useState<string>(DEFAULT_PRODUCT_ID);

  const setSelectedProductId = (productId: string) => {
    setSelectedProductIdState(productId);
  };

  return (
    <ProductContext.Provider value={{ selectedProductId, setSelectedProductId }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
};
