// ============================================================
// IP-NEXUS - WIPO Text Parser for Nice Classification
// Parses raw text copied from WIPO website
// ============================================================

export interface ParsedClass {
  class_number: number;
  title: string;
  explanatory_note: string;
  includes: string[];
  excludes: string[];
  items: ParsedItem[];
}

export interface ParsedItem {
  code: string;
  name: string;
  alternate_names: string[];
  is_generic: boolean;
}

/**
 * Parse WIPO text for a single Nice class
 */
export function parseWIPOText(rawText: string): ParsedClass | null {
  try {
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l);
    
    if (lines.length === 0) return null;
    
    // Extract class number (e.g., "Class 9" or "Clase 9")
    const classMatch = lines[0]?.match(/^(?:Class|Clase)\s+(\d+)/i);
    if (!classMatch) return null;
    
    const classNumber = parseInt(classMatch[1]);
    
    // Extract title (next non-class line)
    let titleIndex = 1;
    while (titleIndex < lines.length && lines[titleIndex].match(/^(?:Class|Clase)\s+\d+/i)) {
      titleIndex++;
    }
    const title = lines[titleIndex] || '';
    
    // Initialize sections
    let explanatoryNote = '';
    const includes: string[] = [];
    const excludes: string[] = [];
    const items: ParsedItem[] = [];
    
    let currentSection = 'title';
    let i = titleIndex + 1;
    
    while (i < lines.length) {
      const line = lines[i];
      
      // Detect section headers
      if (line.match(/^Explanatory\s+Note/i) || line.match(/^Nota\s+Explicativa/i)) {
        currentSection = 'explanatory';
        i++;
        continue;
      }
      if (line.match(/^This\s+Class\s+includes,?\s+in\s+particular/i) || 
          line.match(/^Esta\s+clase\s+comprende,?\s+en\s+particular/i)) {
        currentSection = 'includes';
        i++;
        continue;
      }
      if (line.match(/^This\s+Class\s+does\s+not\s+include/i) ||
          line.match(/^Esta\s+clase\s+no\s+comprende/i)) {
        currentSection = 'excludes';
        i++;
        continue;
      }
      
      // Detect items (6-digit code, possibly with asterisk for generic terms)
      const itemMatch = line.match(/^\*?\s*(\d{6})$/);
      if (itemMatch) {
        currentSection = 'items';
        const code = itemMatch[1];
        const isGeneric = line.startsWith('*');
        
        i++;
        if (i < lines.length) {
          const nameLine = lines[i];
          // Split by " / " for alternate names
          const names = nameLine.split(' / ').map(n => n.trim());
          
          items.push({
            code,
            name: names[0],
            alternate_names: names.slice(1),
            is_generic: isGeneric
          });
        }
        i++;
        continue;
      }
      
      // Process content based on current section
      switch (currentSection) {
        case 'explanatory':
          if (!line.match(/^(?:This|Esta)\s+Class/i)) {
            explanatoryNote += (explanatoryNote ? ' ' : '') + line;
          }
          break;
        case 'includes':
          if (line.startsWith('-') || line.startsWith('•') || line.startsWith('–')) {
            includes.push(line.replace(/^[-•–]\s*/, '').replace(/;$/, '').trim());
          }
          break;
        case 'excludes':
          if (line.startsWith('-') || line.startsWith('•') || line.startsWith('–')) {
            excludes.push(line.replace(/^[-•–]\s*/, '').replace(/[.;]$/, '').trim());
          }
          break;
      }
      
      i++;
    }
    
    return {
      class_number: classNumber,
      title,
      explanatory_note: explanatoryNote,
      includes,
      excludes,
      items
    };
    
  } catch (error) {
    console.error('Error parsing WIPO text:', error);
    return null;
  }
}

/**
 * Detect multiple classes in raw text
 */
export function detectMultipleClasses(rawText: string): number[] {
  const matches = rawText.matchAll(/^(?:Class|Clase)\s+(\d+)/gim);
  return Array.from(matches, m => parseInt(m[1]));
}

/**
 * Split text containing multiple classes into sections
 */
export function splitMultipleClasses(rawText: string): string[] {
  const parts = rawText.split(/(?=^(?:Class|Clase)\s+\d+)/gim);
  return parts.filter(p => p.trim() && p.match(/^(?:Class|Clase)\s+\d+/i));
}

/**
 * Parse a simple list format (one item per line)
 */
export function parseSimpleList(rawText: string, classNumber: number): ParsedItem[] {
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l);
  
  return lines.map((line, index) => {
    // Check if line starts with a code
    const codeMatch = line.match(/^(\d{6})\s*[-–:]?\s*(.+)$/);
    
    if (codeMatch) {
      return {
        code: codeMatch[1],
        name: codeMatch[2].trim(),
        alternate_names: [],
        is_generic: false
      };
    }
    
    // Generate a temporary code
    return {
      code: `${classNumber.toString().padStart(2, '0')}${(index + 1).toString().padStart(4, '0')}`,
      name: line,
      alternate_names: [],
      is_generic: false
    };
  });
}

/**
 * Validate parsed class data
 */
export function validateParsedClass(parsed: ParsedClass): string[] {
  const errors: string[] = [];
  
  if (parsed.class_number < 1 || parsed.class_number > 45) {
    errors.push(`Número de clase inválido: ${parsed.class_number}`);
  }
  
  if (!parsed.title) {
    errors.push('Título de clase vacío');
  }
  
  if (parsed.items.length === 0) {
    errors.push('No se encontraron productos/servicios');
  }
  
  // Check for duplicate codes
  const codes = parsed.items.map(i => i.code);
  const duplicates = codes.filter((c, i) => codes.indexOf(c) !== i);
  if (duplicates.length > 0) {
    errors.push(`Códigos duplicados: ${[...new Set(duplicates)].join(', ')}`);
  }
  
  return errors;
}
