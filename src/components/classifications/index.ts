// ============================================================
// IP-NEXUS - CLASSIFICATION COMPONENTS INDEX
// Barrel exports for all classification selectors
// ============================================================

export { IPCSelector } from './IPCSelector';
export { LocarnoSelector } from './LocarnoSelector';
export { ViennaSelector } from './ViennaSelector';

// Re-export hooks
export {
  useNiceClasses,
  useNiceProducts,
  useNiceSearch,
  useIPCSections,
  useIPCClasses,
  useIPCSearch,
  useLocarnoClasses,
  useLocarnoSearch,
  useViennaCategories,
  useViennaSearch,
  useClassificationSystems,
  useSyncClassifications,
} from '@/hooks/use-classifications';

// Re-export types
export type {
  NiceClass,
  NiceProduct,
  NiceSearchResult,
  IPCSection,
  IPCClass,
  IPCSubclass,
  IPCGroup,
  IPCSearchResult,
  LocarnoClass,
  LocarnoSearchResult,
  ViennaCategory,
  ViennaSearchResult,
  ClassificationSystem,
} from '@/hooks/use-classifications';
