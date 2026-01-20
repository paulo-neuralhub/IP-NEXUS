// ============================================================
// IP-NEXUS - PAGE TITLE HOOK
// Sets document title for SEO and browser tabs
// ============================================================

import { useEffect } from 'react';

export function usePageTitle(title: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} | IP-NEXUS` : 'IP-NEXUS';
    
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}
