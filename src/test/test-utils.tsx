/**
 * Test Utilities
 * Custom render function and utilities for testing React components
 */

import { ReactElement, ReactNode } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { waitFor } from "@testing-library/dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

// ==========================================
// TEST QUERY CLIENT
// ==========================================

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

// ==========================================
// PROVIDERS WRAPPER
// ==========================================

interface AllProvidersProps {
  children: ReactNode;
}

function AllProviders({ children }: AllProvidersProps) {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <BrowserRouter>
          {children}
          <Toaster />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

// ==========================================
// CUSTOM RENDER
// ==========================================

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  initialRoute?: string;
}

function customRender(ui: ReactElement, options?: CustomRenderOptions) {
  if (options?.initialRoute) {
    window.history.pushState({}, "Test Page", options.initialRoute);
  }

  return render(ui, { wrapper: AllProviders, ...options });
}

// ==========================================
// ASYNC UTILITIES
// ==========================================

/**
 * Wait for loading indicators to disappear
 */
export const waitForLoadingToFinish = async () => {
  await waitFor(
    () => {
      const loaders = document.querySelectorAll('[data-testid="loading"]');
      if (loaders.length > 0) {
        throw new Error("Still loading");
      }
    },
    { timeout: 5000 }
  );
};

/**
 * Mock successful API response
 */
export const mockApiResponse = <T,>(data: T, delay = 0) => {
  return new Promise<{ data: T; error: null }>((resolve) => {
    setTimeout(() => resolve({ data, error: null }), delay);
  });
};

/**
 * Mock failed API response
 */
export const mockApiError = (message: string, code?: string, delay = 0) => {
  return new Promise<{ data: null; error: { message: string; code?: string } }>((resolve) => {
    setTimeout(() => resolve({ data: null, error: { message, code } }), delay);
  });
};

/**
 * Wait for a specific amount of time
 */
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Flush promises - useful for waiting for async state updates
 */
export const flushPromises = () => new Promise(setImmediate);

// Re-export testing library
export * from "@testing-library/react";
export { customRender as render };
export { createTestQueryClient };
