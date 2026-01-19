import type { ApiSourceConfig, DatabaseSourceConfig, WebScraperConfig } from '@/types/universal-import';

export interface KnownSystem {
  id: string;
  name: string;
  vendor: string;
  description: string;
  logo?: string;
  color: string;

  // Capacidades
  capabilities: {
    has_api: boolean;
    api_type?: 'rest' | 'soap' | 'graphql';
    has_export: boolean;
    export_formats?: string[];
    supports_webhooks: boolean;
    supports_db_access: boolean;
    supports_scraping: boolean;
  };

  // Configuración de conexión
  connection_templates: {
    api?: Partial<ApiSourceConfig>;
    database?: Partial<DatabaseSourceConfig>;
    scraper?: Partial<WebScraperConfig>;
  };

  // Mapeos conocidos
  known_entities: string[];
  field_mappings: Record<string, Record<string, string>>;

  // Documentación
  docs_url?: string;
  setup_guide?: string;
}

export const KNOWN_SYSTEMS: Record<string, KnownSystem> = {
  patsnap: {
    id: 'patsnap',
    name: 'PatSnap',
    vendor: 'PatSnap Pte. Ltd.',
    description: 'Plataforma de inteligencia de patentes líder mundial',
    color: '#1E88E5',
    capabilities: {
      has_api: true,
      api_type: 'rest',
      has_export: true,
      export_formats: ['xlsx', 'csv', 'pdf'],
      supports_webhooks: true,
      supports_db_access: false,
      supports_scraping: true
    },
    connection_templates: {
      api: {
        base_url: 'https://api.patsnap.com/v1',
        auth_type: 'oauth2',
        endpoints: {
          patents: '/patents',
          trademarks: '/trademarks',
          companies: '/companies'
        }
      }
    },
    known_entities: ['patents', 'trademarks', 'portfolios', 'searches'],
    field_mappings: {
      patents: {
        'patent_number': 'application_number',
        'title': 'title',
        'abstract': 'description',
        'filing_date': 'filing_date',
        'grant_date': 'grant_date',
        'applicant': 'applicant_name',
        'inventor': 'inventor_names',
        'ipc_codes': 'classes',
        'country': 'country_code',
        'status': 'status'
      }
    },
    docs_url: 'https://docs.patsnap.com'
  },

  anaqua: {
    id: 'anaqua',
    name: 'Anaqua',
    vendor: 'Anaqua, Inc.',
    description: 'Plataforma líder de gestión de PI empresarial',
    color: '#00897B',
    capabilities: {
      has_api: true,
      api_type: 'rest',
      has_export: true,
      export_formats: ['xlsx', 'csv', 'xml'],
      supports_webhooks: true,
      supports_db_access: true,
      supports_scraping: true
    },
    connection_templates: {
      api: {
        base_url: 'https://api.anaqua.com/v2',
        auth_type: 'oauth2',
        endpoints: {
          matters: '/matters',
          contacts: '/contacts',
          deadlines: '/deadlines'
        }
      },
      database: {
        type: 'sqlserver',
        tables: {
          matters: 'dbo.Matters',
          contacts: 'dbo.Contacts',
          deadlines: 'dbo.Deadlines'
        }
      }
    },
    known_entities: ['matters', 'contacts', 'deadlines', 'documents', 'costs'],
    field_mappings: {
      matters: {
        'MatterNumber': 'reference',
        'MatterTitle': 'title',
        'MatterType': 'ip_type',
        'MatterStatus': 'status',
        'FilingDate': 'filing_date',
        'RegistrationDate': 'grant_date',
        'ExpirationDate': 'expiry_date',
        'ApplicationNumber': 'application_number',
        'RegistrationNumber': 'registration_number',
        'CountryCode': 'country_code'
      }
    },
    docs_url: 'https://developer.anaqua.com'
  },

  cpa_global: {
    id: 'cpa_global',
    name: 'CPA Global',
    vendor: 'Clarivate (CPA Global)',
    description: 'Servicios de renovación y gestión de PI',
    color: '#5E35B1',
    capabilities: {
      has_api: true,
      api_type: 'rest',
      has_export: true,
      export_formats: ['xlsx', 'csv'],
      supports_webhooks: false,
      supports_db_access: false,
      supports_scraping: true
    },
    connection_templates: {
      api: {
        base_url: 'https://api.cpaglobal.com/v1',
        auth_type: 'api_key',
        endpoints: {
          renewals: '/renewals',
          matters: '/matters',
          invoices: '/invoices'
        }
      },
      scraper: {
        login_url: 'https://portal.cpaglobal.com/login',
        base_url: 'https://portal.cpaglobal.com'
      }
    },
    known_entities: ['renewals', 'matters', 'invoices', 'deadlines'],
    field_mappings: {
      renewals: {
        'CaseReference': 'matter_reference',
        'RenewalDueDate': 'due_date',
        'OfficialFee': 'official_fee',
        'ServiceFee': 'service_fee',
        'Currency': 'currency',
        'Status': 'status'
      }
    }
  },

  dennemeyer: {
    id: 'dennemeyer',
    name: 'Dennemeyer',
    vendor: 'Dennemeyer Group',
    description: 'Servicios completos de PI y renovaciones',
    color: '#D32F2F',
    capabilities: {
      has_api: true,
      api_type: 'rest',
      has_export: true,
      export_formats: ['xlsx', 'csv', 'pdf'],
      supports_webhooks: false,
      supports_db_access: false,
      supports_scraping: true
    },
    connection_templates: {
      api: {
        base_url: 'https://api.dennemeyer.com/v1',
        auth_type: 'api_key'
      }
    },
    known_entities: ['matters', 'renewals', 'deadlines', 'costs'],
    field_mappings: {}
  },

  ipan: {
    id: 'ipan',
    name: 'IPAN',
    vendor: 'IPAN Software',
    description: 'Software de gestión de PI para despachos',
    color: '#FF6F00',
    capabilities: {
      has_api: false,
      has_export: true,
      export_formats: ['xlsx', 'csv', 'xml'],
      supports_webhooks: false,
      supports_db_access: true,
      supports_scraping: false
    },
    connection_templates: {
      database: {
        type: 'sqlserver',
        tables: {
          matters: 'dbo.tbl_Expedientes',
          contacts: 'dbo.tbl_Clientes',
          deadlines: 'dbo.tbl_Plazos'
        }
      }
    },
    known_entities: ['matters', 'contacts', 'deadlines', 'documents', 'invoices'],
    field_mappings: {
      matters: {
        'NumExpediente': 'reference',
        'Titulo': 'title',
        'TipoPI': 'ip_type',
        'Estado': 'status',
        'FechaSolicitud': 'filing_date',
        'FechaConcesion': 'grant_date',
        'NumSolicitud': 'application_number',
        'NumRegistro': 'registration_number',
        'Pais': 'country_code'
      }
    }
  },

  orbit: {
    id: 'orbit',
    name: 'Questel Orbit',
    vendor: 'Questel',
    description: 'Inteligencia y gestión de patentes',
    color: '#0277BD',
    capabilities: {
      has_api: true,
      api_type: 'rest',
      has_export: true,
      export_formats: ['xlsx', 'csv', 'xml', 'pdf'],
      supports_webhooks: true,
      supports_db_access: false,
      supports_scraping: true
    },
    connection_templates: {
      api: {
        base_url: 'https://api.orbit.com/v1',
        auth_type: 'oauth2'
      }
    },
    known_entities: ['patents', 'trademarks', 'searches', 'alerts'],
    field_mappings: {}
  },

  thomson_compumark: {
    id: 'thomson_compumark',
    name: 'Thomson CompuMark',
    vendor: 'Clarivate',
    description: 'Búsqueda y vigilancia de marcas',
    color: '#F57C00',
    capabilities: {
      has_api: true,
      api_type: 'rest',
      has_export: true,
      export_formats: ['xlsx', 'csv', 'pdf'],
      supports_webhooks: true,
      supports_db_access: false,
      supports_scraping: true
    },
    connection_templates: {
      api: {
        base_url: 'https://api.compumark.com/v1',
        auth_type: 'api_key'
      }
    },
    known_entities: ['trademarks', 'searches', 'watches', 'reports'],
    field_mappings: {}
  },

  filemaker: {
    id: 'filemaker',
    name: 'FileMaker',
    vendor: 'Claris (Apple)',
    description: 'Base de datos personalizada',
    color: '#424242',
    capabilities: {
      has_api: true,
      api_type: 'rest',
      has_export: true,
      export_formats: ['xlsx', 'csv', 'xml'],
      supports_webhooks: false,
      supports_db_access: true,
      supports_scraping: false
    },
    connection_templates: {
      database: {
        type: 'postgresql',
        tables: {}
      }
    },
    known_entities: ['custom'],
    field_mappings: {}
  },

  excel_generic: {
    id: 'excel_generic',
    name: 'Excel/CSV Genérico',
    vendor: 'Microsoft',
    description: 'Archivos de hoja de cálculo',
    color: '#217346',
    capabilities: {
      has_api: false,
      has_export: false,
      export_formats: [],
      supports_webhooks: false,
      supports_db_access: false,
      supports_scraping: false
    },
    connection_templates: {},
    known_entities: ['matters', 'contacts', 'deadlines', 'costs', 'documents'],
    field_mappings: {}
  },

  saegis: {
    id: 'saegis',
    name: 'Saegis',
    vendor: 'Corsearch',
    description: 'Búsqueda y vigilancia de marcas',
    color: '#7B1FA2',
    capabilities: {
      has_api: true,
      api_type: 'rest',
      has_export: true,
      export_formats: ['xlsx', 'csv', 'pdf'],
      supports_webhooks: true,
      supports_db_access: false,
      supports_scraping: true
    },
    connection_templates: {
      api: {
        base_url: 'https://api.saegis.com/v1',
        auth_type: 'oauth2'
      }
    },
    known_entities: ['trademarks', 'searches', 'watches'],
    field_mappings: {}
  },

  clarivate_ip: {
    id: 'clarivate_ip',
    name: 'Clarivate IP',
    vendor: 'Clarivate',
    description: 'Suite completa de gestión de PI',
    color: '#00838F',
    capabilities: {
      has_api: true,
      api_type: 'rest',
      has_export: true,
      export_formats: ['xlsx', 'csv', 'xml', 'pdf'],
      supports_webhooks: true,
      supports_db_access: false,
      supports_scraping: true
    },
    connection_templates: {
      api: {
        base_url: 'https://api.clarivate.com/ip/v1',
        auth_type: 'oauth2'
      }
    },
    known_entities: ['patents', 'trademarks', 'matters', 'renewals'],
    field_mappings: {}
  },

  maxval: {
    id: 'maxval',
    name: 'MaxVal',
    vendor: 'MaxVal Group',
    description: 'Gestión de PI y renovaciones',
    color: '#1565C0',
    capabilities: {
      has_api: true,
      api_type: 'rest',
      has_export: true,
      export_formats: ['xlsx', 'csv'],
      supports_webhooks: false,
      supports_db_access: false,
      supports_scraping: true
    },
    connection_templates: {
      api: {
        base_url: 'https://api.maxval.com/v1',
        auth_type: 'api_key'
      }
    },
    known_entities: ['matters', 'renewals', 'invoices'],
    field_mappings: {}
  },

  pattsy_wave: {
    id: 'pattsy_wave',
    name: 'Pattsy Wave',
    vendor: 'Pattsy Wave Ltd',
    description: 'Sistema de gestión de PI en la nube',
    color: '#6A1B9A',
    capabilities: {
      has_api: true,
      api_type: 'rest',
      has_export: true,
      export_formats: ['xlsx', 'csv', 'xml'],
      supports_webhooks: true,
      supports_db_access: false,
      supports_scraping: false
    },
    connection_templates: {
      api: {
        base_url: 'https://api.pattsywave.com/v2',
        auth_type: 'oauth2'
      }
    },
    known_entities: ['matters', 'contacts', 'deadlines', 'documents'],
    field_mappings: {}
  },

  darts_ip: {
    id: 'darts_ip',
    name: 'Darts-IP',
    vendor: 'Clarivate',
    description: 'Base de datos de litigios de PI',
    color: '#E65100',
    capabilities: {
      has_api: true,
      api_type: 'rest',
      has_export: true,
      export_formats: ['xlsx', 'csv', 'pdf'],
      supports_webhooks: false,
      supports_db_access: false,
      supports_scraping: true
    },
    connection_templates: {
      api: {
        base_url: 'https://api.darts-ip.com/v1',
        auth_type: 'api_key'
      }
    },
    known_entities: ['cases', 'decisions', 'parties'],
    field_mappings: {}
  }
};

// Alias comunes para detectar sistemas
export const SYSTEM_ALIASES: Record<string, string> = {
  'pat snap': 'patsnap',
  'patsnap': 'patsnap',
  'anaqua': 'anaqua',
  'ana qua': 'anaqua',
  'cpa': 'cpa_global',
  'cpa global': 'cpa_global',
  'cpaglobal': 'cpa_global',
  'dennemeyer': 'dennemeyer',
  'ipan': 'ipan',
  'ip-an': 'ipan',
  'orbit': 'orbit',
  'questel': 'orbit',
  'compumark': 'thomson_compumark',
  'thomson': 'thomson_compumark',
  'filemaker': 'filemaker',
  'file maker': 'filemaker',
  'claris': 'filemaker',
  'excel': 'excel_generic',
  'csv': 'excel_generic',
  'saegis': 'saegis',
  'corsearch': 'saegis',
  'clarivate': 'clarivate_ip',
  'maxval': 'maxval',
  'pattsy': 'pattsy_wave',
  'pattsy wave': 'pattsy_wave',
  'darts': 'darts_ip',
  'darts-ip': 'darts_ip'
};

// Función helper para detectar sistema desde texto
export function detectSystemFromText(text: string): { systemId: string; confidence: number } | null {
  const normalizedText = text.toLowerCase().trim();
  
  // Buscar coincidencia directa en aliases
  if (SYSTEM_ALIASES[normalizedText]) {
    return { systemId: SYSTEM_ALIASES[normalizedText], confidence: 1.0 };
  }
  
  // Buscar coincidencia parcial
  for (const [alias, systemId] of Object.entries(SYSTEM_ALIASES)) {
    if (normalizedText.includes(alias) || alias.includes(normalizedText)) {
      return { systemId, confidence: 0.8 };
    }
  }
  
  return null;
}

// Obtener sistemas por tipo de conexión
export function getSystemsByConnectionType(type: 'api' | 'database' | 'scraper'): KnownSystem[] {
  return Object.values(KNOWN_SYSTEMS).filter(system => {
    switch (type) {
      case 'api':
        return system.capabilities.has_api;
      case 'database':
        return system.capabilities.supports_db_access;
      case 'scraper':
        return system.capabilities.supports_scraping;
      default:
        return false;
    }
  });
}
