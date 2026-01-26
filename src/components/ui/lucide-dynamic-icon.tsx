import * as React from "react";
import type { LucideProps } from "lucide-react";
import dynamicIconImports from "lucide-react/dynamicIconImports";

type DynamicIconName = keyof typeof dynamicIconImports;

function toKebabCase(input: string) {
  // Radar -> radar, FileBarChart -> file-bar-chart
  return input
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/_/g, "-")
    .toLowerCase();
}

function resolveIconName(name?: string | null): DynamicIconName | null {
  if (!name) return null;
  const trimmed = name.trim();
  if (!trimmed) return null;

  const candidates = [trimmed, toKebabCase(trimmed)];
  for (const c of candidates) {
    if (c in dynamicIconImports) return c as DynamicIconName;
  }
  return null;
}

export interface LucideDynamicIconProps extends Omit<LucideProps, "ref"> {
  name?: string | null;
  fallback?: React.ReactNode;
}

export function LucideDynamicIcon({
  name,
  fallback,
  ...props
}: LucideDynamicIconProps) {
  const resolved = resolveIconName(name);

  const Icon = React.useMemo(() => {
    if (!resolved) return null;
    return React.lazy(dynamicIconImports[resolved]);
  }, [resolved]);

  if (!Icon) {
    return fallback ? <>{fallback}</> : null;
  }

  return (
    <React.Suspense
      fallback={
        fallback ?? (
          <span className="block h-5 w-5 rounded bg-muted" aria-hidden="true" />
        )
      }
    >
      <Icon {...props} />
    </React.Suspense>
  );
}
