import { QueryClient } from "@tanstack/react-query";

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000, // 30 seconds
        gcTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        retry: (failureCount, error: any) => {
          // Do not retry on 404 or 401 client errors
          if (error?.status === 404 || error?.status === 401) return false;
          return failureCount < 2;
        },
      },
    },
  });
}
