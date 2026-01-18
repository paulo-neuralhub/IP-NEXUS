// ===== BLOCKCHAIN =====
export type BlockchainType = 'ethereum' | 'polygon' | 'bitcoin' | 'opentimestamps';
export type TimestampStatus = 'pending' | 'submitted' | 'confirmed' | 'failed';
export type ResourceType = 'document' | 'matter' | 'contract' | 'design' | 'invention' | 'custom';

export interface BlockchainTimestamp {
  id: string;
  organization_id: string;
  resource_type: ResourceType;
  resource_id?: string;
  file_name?: string;
  file_hash: string;
  file_size?: number;
  content_hash: string;
  metadata: {
    title?: string;
    description?: string;
    author?: string;
    tags?: string[];
  };
  blockchain: BlockchainType;
  status: TimestampStatus;
  tx_hash?: string;
  block_number?: number;
  block_timestamp?: string;
  certificate_url?: string;
  certificate_data?: Record<string, unknown>;
  error_message?: string;
  submitted_at?: string;
  confirmed_at?: string;
  created_at: string;
  created_by?: string;
}

export interface TimestampCertificate {
  id: string;
  content_hash: string;
  file_hash: string;
  blockchain: BlockchainType;
  tx_hash: string;
  block_number: number;
  block_timestamp: string;
  metadata: Record<string, unknown>;
  verification_url: string;
  qr_code: string;
}

// ===== OCR =====
export type OCRStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface OCRResult {
  id: string;
  organization_id: string;
  document_id?: string;
  file_url?: string;
  file_name?: string;
  status: OCRStatus;
  extracted_text?: string;
  confidence?: number;
  pages: OCRPage[];
  entities: OCREntity[];
  language?: string;
  processing_time_ms?: number;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export interface OCRPage {
  page: number;
  text: string;
  blocks: OCRBlock[];
}

export interface OCRBlock {
  type: 'paragraph' | 'heading' | 'list' | 'table';
  text: string;
  bbox: [number, number, number, number];
  confidence: number;
}

export interface OCREntity {
  type: 'date' | 'reference' | 'amount' | 'email' | 'phone' | 'address' | 'person' | 'organization';
  value: string | number;
  text: string;
  confidence?: number;
}

// ===== VISION =====
export type VisionAnalysisType = 
  | 'logo_detection' | 'trademark_similarity' | 'text_extraction'
  | 'color_analysis' | 'object_detection' | 'brand_recognition';

export type VisionStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface VisionAnalysis {
  id: string;
  organization_id: string;
  image_url: string;
  image_hash?: string;
  analysis_type: VisionAnalysisType;
  status: VisionStatus;
  results: VisionResults;
  compare_with_id?: string;
  similarity_score?: number;
  error_message?: string;
  processing_time_ms?: number;
  model_version?: string;
  created_at: string;
  completed_at?: string;
}

export interface VisionResults {
  logos?: Array<{
    description: string;
    confidence: number;
    bbox?: [number, number, number, number];
  }>;
  dominant_colors?: string[];
  is_text_based?: boolean;
  complexity_score?: number;
  similar_marks?: Array<{
    mark_id: string;
    mark_name: string;
    similarity_score: number;
    similarity_type: 'visual' | 'conceptual' | 'phonetic';
    image_url?: string;
  }>;
  extracted_text?: string;
  objects?: Array<{
    name: string;
    confidence: number;
    bbox?: [number, number, number, number];
  }>;
}

export interface TrademarkVisual {
  id: string;
  organization_id?: string;
  matter_id?: string;
  image_url: string;
  image_hash: string;
  thumbnail_url?: string;
  mark_name?: string;
  nice_classes?: number[];
  is_text_mark: boolean;
  is_device_mark: boolean;
  is_combination: boolean;
  created_at: string;
}

// ===== CONSTANTS =====
export const BLOCKCHAIN_CONFIG: Record<BlockchainType, {
  name: string;
  icon: string;
  color: string;
  explorerUrl: string;
}> = {
  ethereum: {
    name: 'Ethereum',
    icon: '⟠',
    color: '#627EEA',
    explorerUrl: 'https://etherscan.io/tx/',
  },
  polygon: {
    name: 'Polygon',
    icon: '⬡',
    color: '#8247E5',
    explorerUrl: 'https://polygonscan.com/tx/',
  },
  bitcoin: {
    name: 'Bitcoin',
    icon: '₿',
    color: '#F7931A',
    explorerUrl: 'https://blockchain.com/btc/tx/',
  },
  opentimestamps: {
    name: 'OpenTimestamps',
    icon: '⏱',
    color: '#2D3748',
    explorerUrl: 'https://opentimestamps.org/info.html?ots=',
  },
};

export const TIMESTAMP_STATUS_CONFIG: Record<TimestampStatus, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  pending: { label: 'Pendiente', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  submitted: { label: 'Enviado', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  confirmed: { label: 'Confirmado', color: 'text-green-600', bgColor: 'bg-green-50' },
  failed: { label: 'Fallido', color: 'text-red-600', bgColor: 'bg-red-50' },
};

export const VISION_ANALYSIS_TYPES: Record<VisionAnalysisType, {
  label: string;
  description: string;
  icon: string;
}> = {
  logo_detection: {
    label: 'Detección de Logos',
    description: 'Detectar y analizar logos en la imagen',
    icon: 'Scan',
  },
  trademark_similarity: {
    label: 'Similitud de Marcas',
    description: 'Comparar con marcas existentes',
    icon: 'GitCompare',
  },
  text_extraction: {
    label: 'Extracción de Texto',
    description: 'Extraer texto de la imagen',
    icon: 'FileText',
  },
  color_analysis: {
    label: 'Análisis de Colores',
    description: 'Identificar colores predominantes',
    icon: 'Palette',
  },
  object_detection: {
    label: 'Detección de Objetos',
    description: 'Identificar objetos en la imagen',
    icon: 'Box',
  },
  brand_recognition: {
    label: 'Reconocimiento de Marca',
    description: 'Identificar marcas conocidas',
    icon: 'Award',
  },
};

export const RESOURCE_TYPE_CONFIG: Record<ResourceType, {
  label: string;
  icon: string;
}> = {
  document: { label: 'Documento', icon: 'File' },
  matter: { label: 'Expediente', icon: 'Folder' },
  contract: { label: 'Contrato', icon: 'FileSignature' },
  design: { label: 'Diseño', icon: 'Palette' },
  invention: { label: 'Invención', icon: 'Lightbulb' },
  custom: { label: 'Personalizado', icon: 'FileQuestion' },
};
