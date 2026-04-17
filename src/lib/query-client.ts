import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 2,
      retryDelay: (n) => Math.min(1000 * 2 ** n, 10_000),
      refetchOnWindowFocus: false,
    },
  },
});
