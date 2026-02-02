// ============================================================
// IP-NEXUS - Nice Classification Types
// International Classification of Goods and Services
// ============================================================

export interface NiceClass {
  id: string;
  class_number: number;
  class_type: 'product' | 'service';
  title_en: string;
  title_es?: string;
  explanatory_note_en?: string;
  explanatory_note_es?: string;
  includes_en: string[];
  includes_es: string[];
  excludes_en: string[];
  excludes_es: string[];
  version_id?: string;
  created_at: string;
  updated_at: string;
}

export interface NiceClassItem {
  id: string;
  class_number: number;
  item_code: string;
  item_name_en: string;
  item_name_es?: string;
  alternate_names: string[];
  is_generic_term: boolean;
  version_id?: string;
  created_at: string;
  updated_at: string;
}

export interface NiceSearchResult {
  item_id: string;
  class_number: number;
  class_type: string;
  class_title: string;
  item_code: string;
  item_name_en: string;
  item_name_es?: string;
  is_generic_term: boolean;
  similarity: number;
}

export interface NiceClassSuggestion {
  class_number: number;
  class_type: string;
  class_title: string;
  match_count: number;
  sample_items: string[];
}

export interface NiceStatistics {
  total_classes: number;
  product_classes: number;
  service_classes: number;
  total_items: number;
  generic_terms: number;
  current_version: string;
}

export interface NiceImportResult {
  success: boolean;
  class_number: number;
  items_imported: number;
  errors: string[];
}

export interface NiceClassWithCount extends NiceClass {
  items_count: number;
  imported: boolean;
}

// Nice class icons map
export const NICE_CLASS_ICONS: Record<number, string> = {
  1: '🧪', 2: '🎨', 3: '💄', 4: '⛽', 5: '💊',
  6: '🔩', 7: '⚙️', 8: '🔧', 9: '💻', 10: '🏥',
  11: '💡', 12: '🚗', 13: '🔫', 14: '💎', 15: '🎸',
  16: '📄', 17: '🎈', 18: '👜', 19: '🧱', 20: '🪑',
  21: '🍽️', 22: '🪢', 23: '🧵', 24: '🧶', 25: '👕',
  26: '🎀', 27: '🧹', 28: '🎮', 29: '🥩', 30: '☕',
  31: '🌾', 32: '🍺', 33: '🍷', 34: '🚬', 35: '📢',
  36: '💰', 37: '🔨', 38: '📡', 39: '🚚', 40: '🏭',
  41: '🎓', 42: '🔬', 43: '🍽️', 44: '⚕️', 45: '⚖️'
};

// Nice class colors by type
export const NICE_CLASS_COLORS: Record<string, string> = {
  product: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  service: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

// Nice class titles in Spanish
export const NICE_CLASS_TITLES_ES: Record<number, string> = {
  1: 'Productos químicos',
  2: 'Pinturas, barnices, lacas',
  3: 'Cosméticos, preparaciones de tocador',
  4: 'Aceites y grasas industriales',
  5: 'Productos farmacéuticos',
  6: 'Metales comunes y sus aleaciones',
  7: 'Máquinas y máquinas herramientas',
  8: 'Herramientas e instrumentos de mano',
  9: 'Aparatos científicos, informáticos',
  10: 'Aparatos médicos',
  11: 'Aparatos de alumbrado, calefacción',
  12: 'Vehículos',
  13: 'Armas de fuego',
  14: 'Metales preciosos, joyería',
  15: 'Instrumentos musicales',
  16: 'Papel, cartón, artículos de oficina',
  17: 'Caucho, gutapercha, plásticos',
  18: 'Cuero, artículos de viaje',
  19: 'Materiales de construcción',
  20: 'Muebles, espejos, marcos',
  21: 'Utensilios de cocina',
  22: 'Cuerdas, redes, tiendas de campaña',
  23: 'Hilos para uso textil',
  24: 'Tejidos y productos textiles',
  25: 'Prendas de vestir, calzado',
  26: 'Encajes, bordados, cintas',
  27: 'Alfombras, revestimientos de suelos',
  28: 'Juegos, juguetes, artículos deportivos',
  29: 'Carne, pescado, alimentos conservados',
  30: 'Café, té, cacao, pastelería',
  31: 'Productos agrícolas, animales vivos',
  32: 'Cervezas, bebidas no alcohólicas',
  33: 'Bebidas alcohólicas',
  34: 'Tabaco, artículos para fumadores',
  35: 'Publicidad, gestión de negocios',
  36: 'Servicios financieros, seguros',
  37: 'Servicios de construcción',
  38: 'Telecomunicaciones',
  39: 'Transporte, embalaje, almacenamiento',
  40: 'Tratamiento de materiales',
  41: 'Educación, formación, entretenimiento',
  42: 'Servicios científicos y tecnológicos',
  43: 'Servicios de restauración, hospedaje',
  44: 'Servicios médicos, veterinarios',
  45: 'Servicios jurídicos, seguridad',
};
