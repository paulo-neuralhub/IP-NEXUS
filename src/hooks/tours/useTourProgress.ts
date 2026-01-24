import { useMemo } from "react";
import { useUserSettings, useUpdateUserSettings } from "@/hooks/use-settings";
import type { TourId } from "@/lib/tours/definitions";

type TourProgress = {
  completed?: boolean;
  dismissed?: boolean;
  stepIndex?: number;
  updatedAt?: string;
};

type ToursState = Record<TourId, TourProgress>;

const STORAGE_KEY = "ipnexus:tours:v1";

function safeReadLocal(): Partial<ToursState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<ToursState>;
  } catch {
    return {};
  }
}

function safeWriteLocal(value: Partial<ToursState>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function useTourProgress() {
  const { data: settings } = useUserSettings();
  const update = useUpdateUserSettings();

  const serverTours = (settings?.dashboard as any)?.tours as Partial<ToursState> | undefined;
  const localTours = safeReadLocal();

  const merged = useMemo(() => {
    return { ...localTours, ...(serverTours || {}) } as Partial<ToursState>;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const setTour = async (tourId: TourId, patch: TourProgress) => {
    const current = (merged[tourId] || {}) as TourProgress;
    const next: TourProgress = {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    };

    const nextAll: Partial<ToursState> = { ...merged, [tourId]: next };
    safeWriteLocal(nextAll);
    await update.mutateAsync({ category: "dashboard", updates: { tours: nextAll } });
  };

  return {
    tours: merged,
    setTour,
    isLoading: update.isPending,
  };
}
