// src/providers/QueryProvider.tsx
import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

interface QueryProviderProps {
  children: ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

// Create a hook to safely access React Query functionality
export function useSafeQuery() {
  const isQueryAvailable = typeof queryClient !== 'undefined';
  
  return {
    isQueryAvailable,
    queryClient: isQueryAvailable ? queryClient : null
  };
}