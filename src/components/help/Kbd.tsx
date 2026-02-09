// ============================================================
// IP-NEXUS HELP — KEYBOARD SHORTCUT INLINE
// ============================================================

export function Kbd({ children }: { children: string }) {
  return (
    <kbd className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-md bg-muted border border-border text-[11px] font-mono font-semibold text-foreground/70 shadow-sm">
      {children}
    </kbd>
  );
}
