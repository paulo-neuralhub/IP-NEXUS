export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'IP-NEXUS API',
    description: 'API REST para gestión de propiedad intelectual. Permite acceder a expedientes, contactos, plazos, documentos y facturas.',
    version: '1.0.0',
    contact: {
      email: 'api@ip-nexus.com',
    },
  },
  servers: [
    {
      url: 'https://dcdbpmbzizzzzdfkvohl.supabase.co/functions/v1/api-v1',
      description: 'Producción',
    },
  ],
  security: [
    { apiKey: [] },
    { bearerAuth: [] },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Sistema'],
        summary: 'Health check',
        description: 'Verifica el estado de la API',
        security: [],
        responses: {
          200: {
            description: 'API funcionando correctamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/matters': {
      get: {
        tags: ['Expedientes'],
        summary: 'Listar expedientes',
        description: 'Obtiene la lista de expedientes de la organización',
        parameters: [
          { $ref: '#/components/parameters/page' },
          { $ref: '#/components/parameters/limit' },
          {
            name: 'ip_type',
            in: 'query',
            description: 'Tipo de propiedad intelectual',
            schema: { type: 'string', enum: ['trademark', 'patent', 'design', 'copyright', 'domain', 'other'] },
          },
          {
            name: 'status',
            in: 'query',
            description: 'Estado del expediente',
            schema: { type: 'string' },
          },
          {
            name: 'search',
            in: 'query',
            description: 'Búsqueda por referencia o título',
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Lista de expedientes',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/Matter' } },
                    pagination: { $ref: '#/components/schemas/Pagination' },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { description: 'Permisos insuficientes' },
        },
      },
      post: {
        tags: ['Expedientes'],
        summary: 'Crear expediente',
        description: 'Crea un nuevo expediente',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MatterCreate' },
            },
          },
        },
        responses: {
          201: {
            description: 'Expediente creado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Matter' },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/matters/{id}': {
      get: {
        tags: ['Expedientes'],
        summary: 'Obtener expediente',
        parameters: [{ $ref: '#/components/parameters/id' }],
        responses: {
          200: {
            description: 'Detalle del expediente',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MatterDetail' },
              },
            },
          },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['Expedientes'],
        summary: 'Actualizar expediente',
        parameters: [{ $ref: '#/components/parameters/id' }],
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MatterUpdate' },
            },
          },
        },
        responses: {
          200: { description: 'Expediente actualizado' },
          400: { $ref: '#/components/responses/BadRequest' },
        },
      },
      delete: {
        tags: ['Expedientes'],
        summary: 'Eliminar expediente',
        parameters: [{ $ref: '#/components/parameters/id' }],
        responses: {
          200: { description: 'Expediente eliminado' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/contacts': {
      get: {
        tags: ['Contactos'],
        summary: 'Listar contactos',
        parameters: [
          { $ref: '#/components/parameters/page' },
          { $ref: '#/components/parameters/limit' },
        ],
        responses: {
          200: { description: 'Lista de contactos' },
        },
      },
      post: {
        tags: ['Contactos'],
        summary: 'Crear contacto',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ContactCreate' },
            },
          },
        },
        responses: {
          201: { description: 'Contacto creado' },
        },
      },
    },
    '/contacts/{id}': {
      get: {
        tags: ['Contactos'],
        summary: 'Obtener contacto',
        parameters: [{ $ref: '#/components/parameters/id' }],
        responses: {
          200: { description: 'Detalle del contacto' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['Contactos'],
        summary: 'Actualizar contacto',
        parameters: [{ $ref: '#/components/parameters/id' }],
        responses: {
          200: { description: 'Contacto actualizado' },
        },
      },
      delete: {
        tags: ['Contactos'],
        summary: 'Eliminar contacto',
        parameters: [{ $ref: '#/components/parameters/id' }],
        responses: {
          200: { description: 'Contacto eliminado' },
        },
      },
    },
    '/deadlines': {
      get: {
        tags: ['Plazos'],
        summary: 'Listar plazos',
        parameters: [
          { $ref: '#/components/parameters/page' },
          { $ref: '#/components/parameters/limit' },
          {
            name: 'upcoming',
            in: 'query',
            schema: { type: 'boolean' },
            description: 'Solo plazos futuros',
          },
          {
            name: 'overdue',
            in: 'query',
            schema: { type: 'boolean' },
            description: 'Solo plazos vencidos',
          },
          {
            name: 'matter_id',
            in: 'query',
            schema: { type: 'string', format: 'uuid' },
            description: 'Filtrar por expediente',
          },
        ],
        responses: {
          200: { description: 'Lista de plazos' },
        },
      },
      post: {
        tags: ['Plazos'],
        summary: 'Crear plazo',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/DeadlineCreate' },
            },
          },
        },
        responses: {
          201: { description: 'Plazo creado' },
        },
      },
    },
    '/invoices': {
      get: {
        tags: ['Facturas'],
        summary: 'Listar facturas',
        parameters: [
          { $ref: '#/components/parameters/page' },
          { $ref: '#/components/parameters/limit' },
        ],
        responses: {
          200: { description: 'Lista de facturas' },
        },
      },
      post: {
        tags: ['Facturas'],
        summary: 'Crear factura',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/InvoiceCreate' },
            },
          },
        },
        responses: {
          201: { description: 'Factura creada' },
        },
      },
    },
    '/invoices/{id}': {
      get: {
        tags: ['Facturas'],
        summary: 'Obtener factura',
        parameters: [{ $ref: '#/components/parameters/id' }],
        responses: {
          200: { description: 'Detalle de la factura con líneas' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/documents': {
      get: {
        tags: ['Documentos'],
        summary: 'Listar documentos',
        parameters: [
          {
            name: 'matter_id',
            in: 'query',
            schema: { type: 'string', format: 'uuid' },
            description: 'Filtrar por expediente',
          },
        ],
        responses: {
          200: { description: 'Lista de documentos' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      apiKey: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'API Key de IP-NEXUS',
      },
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        description: 'Token Bearer (API Key)',
      },
    },
    parameters: {
      id: {
        name: 'id',
        in: 'path',
        required: true,
        description: 'ID del recurso',
        schema: { type: 'string', format: 'uuid' },
      },
      page: {
        name: 'page',
        in: 'query',
        description: 'Número de página',
        schema: { type: 'integer', minimum: 1, default: 1 },
      },
      limit: {
        name: 'limit',
        in: 'query',
        description: 'Elementos por página (máximo 100)',
        schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
      },
    },
    schemas: {
      Matter: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          reference: { type: 'string', description: 'Referencia interna' },
          title: { type: 'string', description: 'Título o denominación' },
          ip_type: { type: 'string', enum: ['trademark', 'patent', 'design', 'copyright', 'domain', 'other'] },
          status: { type: 'string' },
          client_id: { type: 'string', format: 'uuid' },
          filing_date: { type: 'string', format: 'date' },
          registration_date: { type: 'string', format: 'date' },
          expiry_date: { type: 'string', format: 'date' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      MatterCreate: {
        type: 'object',
        required: ['reference', 'title', 'ip_type'],
        properties: {
          reference: { type: 'string' },
          title: { type: 'string' },
          ip_type: { type: 'string' },
          client_id: { type: 'string', format: 'uuid' },
          status: { type: 'string' },
          filing_date: { type: 'string', format: 'date' },
        },
      },
      MatterUpdate: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          status: { type: 'string' },
          filing_date: { type: 'string', format: 'date' },
          registration_date: { type: 'string', format: 'date' },
          expiry_date: { type: 'string', format: 'date' },
        },
      },
      MatterDetail: {
        allOf: [
          { $ref: '#/components/schemas/Matter' },
          {
            type: 'object',
            properties: {
              client: { $ref: '#/components/schemas/Contact' },
            },
          },
        ],
      },
      Contact: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          type: { type: 'string', enum: ['person', 'company'] },
          company_name: { type: 'string' },
        },
      },
      ContactCreate: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          type: { type: 'string', enum: ['person', 'company'] },
          company_name: { type: 'string' },
        },
      },
      Deadline: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          due_date: { type: 'string', format: 'date' },
          is_completed: { type: 'boolean' },
          matter_id: { type: 'string', format: 'uuid' },
        },
      },
      DeadlineCreate: {
        type: 'object',
        required: ['title', 'due_date', 'matter_id'],
        properties: {
          title: { type: 'string' },
          due_date: { type: 'string', format: 'date' },
          matter_id: { type: 'string', format: 'uuid' },
          description: { type: 'string' },
        },
      },
      InvoiceCreate: {
        type: 'object',
        required: ['billing_client_id', 'invoice_number'],
        properties: {
          billing_client_id: { type: 'string', format: 'uuid' },
          invoice_number: { type: 'string' },
          invoice_date: { type: 'string', format: 'date' },
          due_date: { type: 'string', format: 'date' },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer' },
          limit: { type: 'integer' },
          total: { type: 'integer' },
          total_pages: { type: 'integer' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: 'API key inválida o ausente',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      NotFound: {
        description: 'Recurso no encontrado',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      BadRequest: {
        description: 'Petición inválida',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      RateLimitExceeded: {
        description: 'Límite de peticiones excedido',
        headers: {
          'X-RateLimit-Limit': { schema: { type: 'integer' } },
          'X-RateLimit-Remaining': { schema: { type: 'integer' } },
          'X-RateLimit-Reset': { schema: { type: 'integer' } },
        },
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
    },
  },
  tags: [
    { name: 'Sistema', description: 'Endpoints de sistema' },
    { name: 'Expedientes', description: 'Gestión de expedientes de PI' },
    { name: 'Contactos', description: 'Gestión de contactos y clientes' },
    { name: 'Plazos', description: 'Gestión de plazos y fechas límite' },
    { name: 'Facturas', description: 'Gestión de facturación' },
    { name: 'Documentos', description: 'Gestión de documentos' },
  ],
};
