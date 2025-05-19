"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// Optional: If you want to use React Query Devtools
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create a new QueryClient instance on first render.
  // This ensures that data is not shared between different users and requests,
  // and that the QueryClient is only created once per component lifecycle.
  const [queryClient] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // You can set default options for all queries here, e.g.:
        // staleTime: 5 * 60 * 1000, // 5 minutes
        // refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Optional: React Query Devtools for debugging */}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}
