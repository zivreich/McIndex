"use client";

import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useQuery,
} from "@tanstack/react-query";
import { useProduct } from "@/contexts/ProductContext";

interface ProductOption {
  id: string;
  name: string;
  description: string;
}

function ComparisonSelector() {
  const { selectedProductId, setSelectedProductId } = useProduct();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { 
    isPending,
    error,
    data: apiResponse 
  } = useQuery<{ products: ProductOption[] }>({
    queryKey: ["products"],
    queryFn: () => fetch("/api/products").then((res) => res.json()),
  });

  useEffect(() => {
    if (
      !isPending &&
      apiResponse?.products &&
      apiResponse.products.length > 0 &&
      !apiResponse.products.find(p => p.id === selectedProductId)
    ) {
      setSelectedProductId(apiResponse.products[0].id);
    }
  }, [isPending, apiResponse, selectedProductId, setSelectedProductId]);

  const handleProductSelect = (product: ProductOption) => {
    setSelectedProductId(product.id);
    setIsDropdownOpen(false);
  };

  const currentSelectedProductObject = apiResponse?.products.find(p => p.id === selectedProductId);

  const renderLoadingState = () => (
    <p className="text-muted-foreground px-2 py-1">
      Loading products...
    </p>
  );

  const renderErrorState = () => (
    <p className="text-destructive px-2 py-1">
      Error: {error?.message || "Failed to load products."}
    </p>
  );

  const renderSuccessState = () => {
    if (!apiResponse?.products || apiResponse.products.length === 0) {
      return (
        <p className="text-muted-foreground px-2 py-1">
          No products available.
        </p>
      );
    }

    return (
      <p className="text-muted-foreground">
        Comparing the price of a
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="outline-none cursor-pointer font-semibold hover:underline-offset-4 transition-all inline-flex items-center gap-1 px-2 text-primary underline disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isPending || !apiResponse?.products || apiResponse.products.length === 0}
            >
              {currentSelectedProductObject ? currentSelectedProductObject.name : (isPending ? "Loading..." : "Select Product")}
              <ChevronsUpDown className="h-3 w-3 opacity-70" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[220px]">
            {apiResponse.products.map((product: ProductOption) => (
              <DropdownMenuItem
                key={product.id}
                className={cn(
                  "flex flex-col items-start gap-1 cursor-pointer",
                  selectedProductId === product.id && "bg-accent font-medium"
                )}
                onClick={() => handleProductSelect(product)}
                disabled={!product.id}
              >
                <div className="flex w-full items-center">
                  <span className="font-medium">{product.name}</span>
                  {selectedProductId === product.id && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {product.description}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        across different countries (in USD)
      </p>
    );
  };

  if (isPending) {
    return renderLoadingState();
  }

  if (error) {
    return renderErrorState();
  }

  return renderSuccessState();
}

export default ComparisonSelector;
