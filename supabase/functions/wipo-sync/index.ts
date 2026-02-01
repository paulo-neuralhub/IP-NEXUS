// ============================================================
// IP-NEXUS - WIPO CLASSIFICATION SYNC EDGE FUNCTION
// Imports and syncs classification data from WIPO sources
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// WIPO data sources (using publicly available data)
const WIPO_SOURCES = {
  nice: {
    // WIPO Nice Classification API endpoint
    baseUrl: 'https://www.wipo.int/classifications/nice/nclpub/en/fr/',
    version: 'NCL(13-2026)',
  },
  ipc: {
    baseUrl: 'https://www.wipo.int/classifications/ipc/',
    version: 'IPC-2026.01',
  },
  locarno: {
    baseUrl: 'https://www.wipo.int/classifications/locarno/',
    version: 'LOC(14-2025)',
  },
  vienna: {
    baseUrl: 'https://www.wipo.int/classifications/vienna/',
    version: 'VCL(9-2026)',
  },
};

// Sample data for initial seeding (official WIPO Nice classes)
const NICE_CLASSES_DATA = [
  { class_number: 1, title_es: 'Productos químicos para la industria, la ciencia y la fotografía', title_en: 'Chemicals for industry, science and photography', is_goods: true },
  { class_number: 2, title_es: 'Pinturas, barnices, lacas', title_en: 'Paints, varnishes, lacquers', is_goods: true },
  { class_number: 3, title_es: 'Cosméticos y preparaciones de tocador', title_en: 'Cosmetics and toiletry preparations', is_goods: true },
  { class_number: 4, title_es: 'Aceites y grasas para uso industrial', title_en: 'Industrial oils and greases', is_goods: true },
  { class_number: 5, title_es: 'Productos farmacéuticos y veterinarios', title_en: 'Pharmaceutical and veterinary preparations', is_goods: true },
  { class_number: 6, title_es: 'Metales comunes y sus aleaciones', title_en: 'Common metals and their alloys', is_goods: true },
  { class_number: 7, title_es: 'Máquinas y máquinas herramientas', title_en: 'Machines and machine tools', is_goods: true },
  { class_number: 8, title_es: 'Herramientas e instrumentos de mano', title_en: 'Hand tools and implements', is_goods: true },
  { class_number: 9, title_es: 'Aparatos e instrumentos científicos, de investigación, de navegación', title_en: 'Scientific, research, navigation apparatus and instruments', is_goods: true },
  { class_number: 10, title_es: 'Aparatos e instrumentos quirúrgicos y médicos', title_en: 'Surgical and medical apparatus and instruments', is_goods: true },
  { class_number: 11, title_es: 'Aparatos e instalaciones de alumbrado, calefacción', title_en: 'Lighting, heating, cooling apparatus', is_goods: true },
  { class_number: 12, title_es: 'Vehículos; aparatos de locomoción terrestre, aérea o acuática', title_en: 'Vehicles; apparatus for locomotion', is_goods: true },
  { class_number: 13, title_es: 'Armas de fuego; municiones y proyectiles; explosivos', title_en: 'Firearms; ammunition and projectiles; explosives', is_goods: true },
  { class_number: 14, title_es: 'Metales preciosos y sus aleaciones', title_en: 'Precious metals and their alloys', is_goods: true },
  { class_number: 15, title_es: 'Instrumentos musicales', title_en: 'Musical instruments', is_goods: true },
  { class_number: 16, title_es: 'Papel, cartón; artículos de estas materias', title_en: 'Paper and cardboard', is_goods: true },
  { class_number: 17, title_es: 'Caucho, gutapercha, goma', title_en: 'Rubber, gutta-percha, gum', is_goods: true },
  { class_number: 18, title_es: 'Cuero e imitaciones de cuero', title_en: 'Leather and imitations of leather', is_goods: true },
  { class_number: 19, title_es: 'Materiales de construcción no metálicos', title_en: 'Non-metallic building materials', is_goods: true },
  { class_number: 20, title_es: 'Muebles, espejos, marcos', title_en: 'Furniture, mirrors, picture frames', is_goods: true },
  { class_number: 21, title_es: 'Utensilios y recipientes para uso doméstico', title_en: 'Household or kitchen utensils and containers', is_goods: true },
  { class_number: 22, title_es: 'Cuerdas y cordeles; redes; tiendas de campaña', title_en: 'Ropes and string; nets; tents', is_goods: true },
  { class_number: 23, title_es: 'Hilos para uso textil', title_en: 'Yarns and threads for textile use', is_goods: true },
  { class_number: 24, title_es: 'Tejidos y sus sucedáneos', title_en: 'Textiles and substitutes for textiles', is_goods: true },
  { class_number: 25, title_es: 'Prendas de vestir, calzado, artículos de sombrerería', title_en: 'Clothing, footwear, headwear', is_goods: true },
  { class_number: 26, title_es: 'Encajes, cordones y bordados', title_en: 'Lace, braid and embroidery', is_goods: true },
  { class_number: 27, title_es: 'Alfombras, felpudos, esteras', title_en: 'Carpets, rugs, mats', is_goods: true },
  { class_number: 28, title_es: 'Juegos, juguetes; artículos de gimnasia y deporte', title_en: 'Games, toys; gymnastic and sporting articles', is_goods: true },
  { class_number: 29, title_es: 'Carne, pescado, aves y caza', title_en: 'Meat, fish, poultry and game', is_goods: true },
  { class_number: 30, title_es: 'Café, té, cacao y sucedáneos del café', title_en: 'Coffee, tea, cocoa and substitutes', is_goods: true },
  { class_number: 31, title_es: 'Productos agrícolas, acuícolas, hortícolas y forestales', title_en: 'Agricultural, aquacultural, horticultural products', is_goods: true },
  { class_number: 32, title_es: 'Cervezas; bebidas no alcohólicas', title_en: 'Beers; non-alcoholic beverages', is_goods: true },
  { class_number: 33, title_es: 'Bebidas alcohólicas (excepto cervezas)', title_en: 'Alcoholic beverages (except beers)', is_goods: true },
  { class_number: 34, title_es: 'Tabaco y sucedáneos del tabaco', title_en: 'Tobacco and tobacco substitutes', is_goods: true },
  { class_number: 35, title_es: 'Publicidad; gestión, organización y administración de negocios', title_en: 'Advertising; business management', is_goods: false },
  { class_number: 36, title_es: 'Servicios de seguros; operaciones financieras', title_en: 'Insurance; financial affairs', is_goods: false },
  { class_number: 37, title_es: 'Servicios de construcción; servicios de reparación', title_en: 'Building construction; repair', is_goods: false },
  { class_number: 38, title_es: 'Telecomunicaciones', title_en: 'Telecommunications', is_goods: false },
  { class_number: 39, title_es: 'Transporte; embalaje y almacenamiento de mercancías', title_en: 'Transport; packaging and storage', is_goods: false },
  { class_number: 40, title_es: 'Tratamiento de materiales', title_en: 'Treatment of materials', is_goods: false },
  { class_number: 41, title_es: 'Educación; formación; servicios de entretenimiento', title_en: 'Education; training; entertainment', is_goods: false },
  { class_number: 42, title_es: 'Servicios científicos y tecnológicos', title_en: 'Scientific and technological services', is_goods: false },
  { class_number: 43, title_es: 'Servicios de restauración; hospedaje temporal', title_en: 'Food and drink services; temporary accommodation', is_goods: false },
  { class_number: 44, title_es: 'Servicios médicos; servicios veterinarios', title_en: 'Medical services; veterinary services', is_goods: false },
  { class_number: 45, title_es: 'Servicios jurídicos; servicios de seguridad', title_en: 'Legal services; security services', is_goods: false },
];

// Sample Locarno classes
const LOCARNO_CLASSES_DATA = [
  { class_number: 1, title_es: 'Productos alimenticios', title_en: 'Foodstuffs' },
  { class_number: 2, title_es: 'Artículos de vestir y mercería', title_en: 'Articles of clothing and haberdashery' },
  { class_number: 3, title_es: 'Artículos de viaje, estuches, parasoles', title_en: 'Travel goods, cases, parasols' },
  { class_number: 4, title_es: 'Cepillería', title_en: 'Brushware' },
  { class_number: 5, title_es: 'Artículos textiles, materiales laminares', title_en: 'Textile piece goods, materials' },
  { class_number: 6, title_es: 'Mobiliario', title_en: 'Furnishing' },
  { class_number: 7, title_es: 'Artículos de uso doméstico', title_en: 'Household goods' },
  { class_number: 8, title_es: 'Herramientas y quincallería', title_en: 'Tools and hardware' },
  { class_number: 9, title_es: 'Envases y recipientes para transporte', title_en: 'Packages and containers' },
  { class_number: 10, title_es: 'Relojes e instrumentos de medida', title_en: 'Clocks and measuring instruments' },
  { class_number: 11, title_es: 'Artículos de adorno', title_en: 'Articles of adornment' },
  { class_number: 12, title_es: 'Medios de transporte o elevación', title_en: 'Means of transport or hoisting' },
  { class_number: 13, title_es: 'Equipos de producción y distribución de electricidad', title_en: 'Equipment for production and distribution of electricity' },
  { class_number: 14, title_es: 'Equipos de registro, comunicación o de recuperación de información', title_en: 'Recording, communication or information retrieval equipment' },
  { class_number: 15, title_es: 'Máquinas', title_en: 'Machines' },
  { class_number: 16, title_es: 'Artículos de fotografía, cinematografía y óptica', title_en: 'Photographic, cinematographic and optical apparatus' },
  { class_number: 17, title_es: 'Instrumentos de música', title_en: 'Musical instruments' },
  { class_number: 18, title_es: 'Máquinas de imprimir y de oficina', title_en: 'Printing and office machinery' },
  { class_number: 19, title_es: 'Papelería y materiales de oficina, materiales de artistas y para la enseñanza', title_en: 'Stationery and office equipment' },
  { class_number: 20, title_es: 'Artículos de venta y publicidad, letreros', title_en: 'Sales and advertising equipment, signs' },
  { class_number: 21, title_es: 'Juegos, juguetes, tiendas de campaña', title_en: 'Games, toys, tents and sports goods' },
  { class_number: 22, title_es: 'Armas, artículos pirotécnicos, caza, pesca', title_en: 'Arms, pyrotechnic articles, hunting, fishing' },
  { class_number: 23, title_es: 'Instalaciones para la distribución de fluidos, sanitarias', title_en: 'Fluid distribution equipment, sanitary equipment' },
  { class_number: 24, title_es: 'Equipos médicos y de laboratorio', title_en: 'Medical and laboratory equipment' },
  { class_number: 25, title_es: 'Construcciones y elementos de construcción', title_en: 'Building units and construction elements' },
  { class_number: 26, title_es: 'Aparatos de alumbrado', title_en: 'Lighting apparatus' },
  { class_number: 27, title_es: 'Productos del tabaco y artículos para fumadores', title_en: 'Tobacco and smokers supplies' },
  { class_number: 28, title_es: 'Productos farmacéuticos y cosméticos', title_en: 'Pharmaceutical and cosmetic products' },
  { class_number: 29, title_es: 'Dispositivos y equipos contra incendios', title_en: 'Devices and equipment against fire hazards' },
  { class_number: 30, title_es: 'Artículos para el cuidado y manipulación de animales', title_en: 'Articles for the care and handling of animals' },
  { class_number: 31, title_es: 'Máquinas y aparatos para preparar alimentos o bebidas', title_en: 'Machines and appliances for preparing food or drink' },
  { class_number: 32, title_es: 'Símbolos gráficos, logotipos, motivos de superficie', title_en: 'Graphic symbols and logos' },
];

// Sample Vienna categories
const VIENNA_CATEGORIES_DATA = [
  { code: '01', title_es: 'Cuerpos celestes, fenómenos naturales, mapas geográficos', title_en: 'Celestial bodies, natural phenomena, maps' },
  { code: '02', title_es: 'Seres humanos', title_en: 'Human beings' },
  { code: '03', title_es: 'Animales', title_en: 'Animals' },
  { code: '04', title_es: 'Seres sobrenaturales, fabulosos, fantásticos', title_en: 'Supernatural, fabulous, fantasy beings' },
  { code: '05', title_es: 'Plantas', title_en: 'Plants' },
  { code: '06', title_es: 'Paisajes', title_en: 'Landscapes' },
  { code: '07', title_es: 'Construcciones, estructuras', title_en: 'Constructions, structures' },
  { code: '08', title_es: 'Productos alimenticios', title_en: 'Foodstuffs' },
  { code: '09', title_es: 'Textiles, vestimenta, tocados, calzado', title_en: 'Textiles, clothing, headwear, footwear' },
  { code: '10', title_es: 'Tabaco, artículos para fumadores', title_en: 'Tobacco, smokers articles' },
  { code: '11', title_es: 'Artículos de uso doméstico', title_en: 'Household articles' },
  { code: '12', title_es: 'Muebles, instalaciones sanitarias', title_en: 'Furniture, sanitary installations' },
  { code: '13', title_es: 'Iluminación, radiodifusión, caldeo, generación de energía', title_en: 'Lighting, radio, heating, power generation' },
  { code: '14', title_es: 'Joyería, relojería', title_en: 'Jewellery, watchmaking' },
  { code: '15', title_es: 'Máquinas, motores', title_en: 'Machines, motors' },
  { code: '16', title_es: 'Telecomunicaciones, grabación, reproducción de sonido', title_en: 'Telecommunications, sound recording' },
  { code: '17', title_es: 'Relojería, artículos de control, instrumentos de medida', title_en: 'Horology, control articles, measuring instruments' },
  { code: '18', title_es: 'Transportes', title_en: 'Transport' },
  { code: '19', title_es: 'Recipientes, embalajes', title_en: 'Containers, packaging' },
  { code: '20', title_es: 'Artículos para escribir, dibujar, pintar, papelería', title_en: 'Writing, drawing, painting articles' },
  { code: '21', title_es: 'Juegos, juguetes, artículos de deporte, carruseles', title_en: 'Games, toys, sporting articles' },
  { code: '22', title_es: 'Instrumentos de música, partituras', title_en: 'Musical instruments, music scores' },
  { code: '23', title_es: 'Armas, municiones, armaduras', title_en: 'Arms, ammunition, armour' },
  { code: '24', title_es: 'Heráldica, pabellones, símbolos', title_en: 'Heraldry, flags, symbols' },
  { code: '25', title_es: 'Elementos decorativos, superficies o fondos con diseños', title_en: 'Ornamental motifs, surfaces or backgrounds' },
  { code: '26', title_es: 'Figuras y sólidos geométricos', title_en: 'Geometrical figures and solids' },
  { code: '27', title_es: 'Formas de escritura, cifras', title_en: 'Forms of writing, numerals' },
  { code: '28', title_es: 'Inscripciones de diversas formas', title_en: 'Inscriptions in various forms' },
  { code: '29', title_es: 'Colores', title_en: 'Colours' },
];

interface SyncRequest {
  system: 'nice' | 'ipc' | 'locarno' | 'vienna' | 'all';
  action: 'seed' | 'sync' | 'status';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { system = 'all', action = 'status' } = await req.json() as SyncRequest;

    // Log sync start
    const syncLogId = crypto.randomUUID();

    if (action === 'status') {
      // Return current sync status
      const { data: systems } = await supabase
        .from('classification_systems')
        .select('*')
        .order('code');

      const { data: recentLogs } = await supabase
        .from('classification_sync_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      return new Response(
        JSON.stringify({
          success: true,
          systems,
          recent_syncs: recentLogs,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'seed') {
      const results: Record<string, { added: number; errors: string[] }> = {};

      // Seed Nice classes (update existing)
      if (system === 'nice' || system === 'all') {
        let added = 0;
        const errors: string[] = [];
        
        for (const cls of NICE_CLASSES_DATA) {
          const { error } = await supabase
            .from('nice_classes')
            .upsert({
              class_number: cls.class_number,
              title_es: cls.title_es,
              title_en: cls.title_en,
              type: cls.is_goods ? 'goods' : 'services',
              wipo_version: WIPO_SOURCES.nice.version,
            }, { onConflict: 'class_number' });

          if (error) {
            errors.push(`Class ${cls.class_number}: ${error.message}`);
          } else {
            added++;
          }
        }
        results.nice = { added, errors };
      }

      // Seed Locarno classes
      if (system === 'locarno' || system === 'all') {
        let added = 0;
        const errors: string[] = [];

        for (const cls of LOCARNO_CLASSES_DATA) {
          const { error } = await supabase
            .from('locarno_classes')
            .upsert({
              class_number: cls.class_number,
              title_es: cls.title_es,
              title_en: cls.title_en,
              version: WIPO_SOURCES.locarno.version,
            }, { onConflict: 'class_number' });

          if (error) {
            errors.push(`Class ${cls.class_number}: ${error.message}`);
          } else {
            added++;
          }
        }
        results.locarno = { added, errors };
      }

      // Seed Vienna categories
      if (system === 'vienna' || system === 'all') {
        let added = 0;
        const errors: string[] = [];

        for (const cat of VIENNA_CATEGORIES_DATA) {
          const { error } = await supabase
            .from('vienna_categories')
            .upsert({
              code: cat.code,
              title_es: cat.title_es,
              title_en: cat.title_en,
              version: WIPO_SOURCES.vienna.version,
            }, { onConflict: 'code' });

          if (error) {
            errors.push(`Category ${cat.code}: ${error.message}`);
          } else {
            added++;
          }
        }
        results.vienna = { added, errors };
      }

      // Log sync completion
      await supabase.from('classification_sync_logs').insert({
        classification_system: system === 'all' ? 'nice' : system,
        version_after: WIPO_SOURCES[system === 'all' ? 'nice' : system].version,
        records_added: Object.values(results).reduce((sum, r) => sum + r.added, 0),
        status: 'success',
        completed_at: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({
          success: true,
          action: 'seed',
          results,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For 'sync' action - would fetch from WIPO API
    // This requires proper WIPO API access or XML parsing
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Sync action requires WIPO API configuration. Use "seed" for initial data.',
        available_actions: ['status', 'seed', 'sync'],
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('WIPO Sync error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
