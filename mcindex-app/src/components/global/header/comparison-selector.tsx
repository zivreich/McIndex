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
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

type ProductOption = {
  id: string;
  name: string;
  description: string;
};

const queryClient = new QueryClient();

function ComparisonSelector() {
  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { isPending, error, data: apiResponse } = useQuery<{
    products: ProductOption[];
  }>({
    queryKey: ["products"],
    queryFn: () => fetch("/api/products").then((res) => res.json()),
  });

  useEffect(() => {
    if (
      !isPending &&
      apiResponse?.products &&
      apiResponse.products.length > 0 &&
      !selectedProduct
    ) {
      setSelectedProduct(apiResponse.products[0]); // Set default selected product
    }
  }, [isPending, apiResponse, selectedProduct]);

  const handleProductSelect = (product: ProductOption) => {
    setSelectedProduct(product);
    setIsDropdownOpen(false); // Close dropdown after selection
  };

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
              {selectedProduct ? selectedProduct.name : "Select Product"}
              <ChevronsUpDown className="h-3 w-3 opacity-70" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[220px]">
            {apiResponse.products.map((product: ProductOption) => (
              <DropdownMenuItem
                key={product.id}
                className={cn(
                  "flex flex-col items-start gap-1 cursor-pointer",
                  selectedProduct?.id === product.id && "bg-accent font-medium"
                )}
                onClick={() => handleProductSelect(product)}
                disabled={!product.id} // Basic check, can be expanded
              >
                <div className="flex w-full items-center">
                  <span className="font-medium">{product.name}</span>
                  {selectedProduct?.id === product.id && (
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

export default function TanstackWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <ComparisonSelector />
    </QueryClientProvider>
  );
}
