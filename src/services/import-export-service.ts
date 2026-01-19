import { supabase } from '@/integrations/supabase/client';
import type { FieldMapping } from '@/types/import-export';

interface ParsedData {
  headers: string[];
  rows: Record<string, unknown>[];
  totalRows: number;
}

interface ValidationResult {
  isValid: boolean;
  errors: Array<{ row: number; field: string; message: string }>;
  warnings: Array<{ row: number; field: string; message: string }>;
}

interface ImportResult {
  success: boolean;
  totalProcessed: number;
  totalSuccess: number;
  totalFailed: number;
  errors: Array<{ row: number; message: string }>;
}

export class ImportExportService {
  // ============ FILE PARSING ============
  
  static async parseFile(file: File): Promise<ParsedData> {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'csv':
        return this.parseCsv(file);
      case 'json':
        return this.parseJson(file);
      case 'xlsx':
      case 'xls':
        return this.parseExcel(file);
      case 'xml':
        return this.parseXml(file);
      default:
        throw new Error(`Unsupported file format: ${extension}`);
    }
  }
  
  private static async parseCsv(file: File): Promise<ParsedData> {
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      return { headers: [], rows: [], totalRows: 0 };
    }
    
    // Parse headers
    const headers = this.parseCsvLine(lines[0]);
    
    // Parse rows
    const rows = lines.slice(1).map(line => {
      const values = this.parseCsvLine(line);
      const row: Record<string, unknown> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });
    
    return { headers, rows, totalRows: rows.length };
  }
  
  private static parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }
  
  private static async parseJson(file: File): Promise<ParsedData> {
    const text = await file.text();
    const data = JSON.parse(text);
    
    const rows = Array.isArray(data) ? data : [data];
    const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
    
    return { headers, rows, totalRows: rows.length };
  }
  
  private static async parseExcel(file: File): Promise<ParsedData> {
    // For Excel, we'd use a library like xlsx
    // For now, return empty and notify user to use CSV
    console.warn('Excel parsing requires xlsx library - converting to CSV recommended');
    throw new Error('Excel format not yet supported. Please convert to CSV.');
  }
  
  private static async parseXml(file: File): Promise<ParsedData> {
    const text = await file.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/xml');
    
    // Get root element's children as rows
    const root = doc.documentElement;
    const rowElements = Array.from(root.children);
    
    if (rowElements.length === 0) {
      return { headers: [], rows: [], totalRows: 0 };
    }
    
    // Get headers from first row's children
    const headers = Array.from(rowElements[0].children).map(el => el.tagName);
    
    // Parse rows
    const rows = rowElements.map(rowEl => {
      const row: Record<string, unknown> = {};
      Array.from(rowEl.children).forEach(child => {
        row[child.tagName] = child.textContent || '';
      });
      return row;
    });
    
    return { headers, rows, totalRows: rows.length };
  }
  
  // ============ VALIDATION ============
  
  static validateData(
    data: Record<string, unknown>[],
    mappings: FieldMapping[],
    entityType: string
  ): ValidationResult {
    const errors: Array<{ row: number; field: string; message: string }> = [];
    const warnings: Array<{ row: number; field: string; message: string }> = [];
    
    data.forEach((row, index) => {
      mappings.forEach(mapping => {
        if (!mapping.targetField) return;
        
        const value = row[mapping.sourceColumn];
        
        // Check required fields
        if (mapping.required && (value === undefined || value === null || value === '')) {
          errors.push({
            row: index + 1,
            field: mapping.sourceColumn,
            message: `Required field "${mapping.targetField}" is empty`
          });
        }
        
        // Type validation based on transform
        if (value !== undefined && value !== null && value !== '' && mapping.transform) {
          const typeError = this.validateTransform(value, mapping.transform);
          if (typeError) {
            errors.push({
              row: index + 1,
              field: mapping.sourceColumn,
              message: typeError
            });
          }
        }
      });
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  private static validateTransform(value: unknown, transform: string): string | null {
    switch (transform) {
      case 'parse_number':
        if (isNaN(Number(value))) {
          return `Value "${value}" is not a valid number`;
        }
        break;
      case 'parse_date':
        if (isNaN(Date.parse(String(value)))) {
          return `Value "${value}" is not a valid date`;
        }
        break;
    }
    return null;
  }
  
  // ============ IMPORT PROCESSING ============
  
  static async processImport(
    jobId: string,
    data: Record<string, unknown>[],
    mappings: FieldMapping[],
    entityType: string,
    organizationId: string
  ): Promise<ImportResult> {
    let totalSuccess = 0;
    let totalFailed = 0;
    const errors: Array<{ row: number; message: string }> = [];
    
    // Process in batches
    const batchSize = 100;
    const batches = Math.ceil(data.length / batchSize);
    
    for (let i = 0; i < batches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, data.length);
      const batch = data.slice(start, end);
      
      // Update job progress
      await (supabase as any)
        .from('import_jobs_v2')
        .update({
          processed_rows: start,
          status: 'processing'
        } as any)
        .eq('id', jobId);
      
      // Process each row
      for (let j = 0; j < batch.length; j++) {
        const rowIndex = start + j;
        const row = batch[j];
        
        try {
          const transformedData = this.transformRow(row, mappings, entityType);
          
          // Insert into shadow table first
          await (supabase as any)
            .from('import_records')
            .insert({
              job_id: jobId,
              row_number: rowIndex + 1,
              source_data: row,
              target_data: transformedData,
              status: 'pending',
              organization_id: organizationId
            } as any);
          
          // Actually insert into target table
          const insertResult = await this.insertEntity(entityType, transformedData, organizationId);
          
          if (insertResult.success) {
            totalSuccess++;
            await (supabase as any)
              .from('import_records')
              .update({ 
                status: 'imported',
                created_entity_id: insertResult.id
              } as any)
              .eq('job_id', jobId)
              .eq('row_number', rowIndex + 1);
          } else {
            throw new Error(insertResult.error);
          }
        } catch (error) {
          totalFailed++;
          errors.push({
            row: rowIndex + 1,
            message: error instanceof Error ? error.message : 'Unknown error'
          });
          
          await (supabase as any)
            .from('import_records')
            .update({ 
              status: 'failed',
              error_message: error instanceof Error ? error.message : 'Unknown error'
            } as any)
            .eq('job_id', jobId)
            .eq('row_number', rowIndex + 1);
        }
      }
    }
    
    // Update final job status
    await (supabase as any)
      .from('import_jobs_v2')
      .update({
        status: totalFailed === 0 ? 'completed' : 'completed_with_errors',
        processed_rows: data.length,
        success_rows: totalSuccess,
        failed_rows: totalFailed,
        completed_at: new Date().toISOString()
      } as any)
      .eq('id', jobId);
    
    return {
      success: totalFailed === 0,
      totalProcessed: data.length,
      totalSuccess,
      totalFailed,
      errors
    };
  }
  
  private static transformRow(
    row: Record<string, unknown>,
    mappings: FieldMapping[],
    entityType: string
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    
    mappings.forEach(mapping => {
      if (!mapping.targetField) return;
      
      let value = row[mapping.sourceColumn];
      
      // Apply transformation
      if (mapping.transform && value !== undefined && value !== null) {
        value = this.applyTransform(value, mapping.transform);
      }
      
      // Apply default value if empty
      if ((value === undefined || value === null || value === '') && mapping.defaultValue) {
        value = mapping.defaultValue;
      }
      
      result[mapping.targetField] = value;
    });
    
    return result;
  }
  
  private static applyTransform(value: unknown, transform: string): unknown {
    const strValue = String(value);
    
    switch (transform) {
      case 'uppercase':
        return strValue.toUpperCase();
      case 'lowercase':
        return strValue.toLowerCase();
      case 'trim':
        return strValue.trim();
      case 'parse_date':
        return new Date(strValue).toISOString();
      case 'parse_number':
        return Number(strValue);
      case 'split_array':
        return strValue.split(',').map(s => s.trim());
      default:
        return value;
    }
  }
  
  private static async insertEntity(
    entityType: string,
    data: Record<string, unknown>,
    organizationId: string
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    const tableName = this.getTableName(entityType);
    
    const insertData = {
      ...data,
      organization_id: organizationId
    };
    
    const { data: result, error } = await supabase
      .from(tableName as any)
      .insert(insertData)
      .select('id')
      .single();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, id: (result as any)?.id };
  }
  
  private static getTableName(entityType: string): string {
    const tableMap: Record<string, string> = {
      'assets': 'matters',
      'asset': 'matters',
      'contacts': 'contacts',
      'contact': 'contacts',
      'deadlines': 'matter_deadlines',
      'deadline': 'matter_deadlines',
      'costs': 'matter_costs',
      'cost': 'matter_costs',
      'documents': 'matter_documents',
      'document': 'matter_documents'
    };
    
    return tableMap[entityType] || entityType;
  }
  
  // ============ EXPORT PROCESSING ============
  
  static async processExport(
    jobId: string,
    entityType: string,
    filters: Record<string, unknown>,
    columns: string[],
    format: string,
    organizationId: string
  ): Promise<string> {
    // Fetch data
    const tableName = this.getTableName(entityType);
    let query = supabase
      .from(tableName as any)
      .select(columns.join(','))
      .eq('organization_id', organizationId);
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query = query.eq(key, value);
      }
    });
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    // Convert to requested format
    let content: string;
    let contentType: string;
    let extension: string;
    
    switch (format) {
      case 'json':
        content = JSON.stringify(data, null, 2);
        contentType = 'application/json';
        extension = 'json';
        break;
      case 'xml':
        content = this.toXml((data as unknown) as Record<string, unknown>[], entityType);
        contentType = 'application/xml';
        extension = 'xml';
        break;
      case 'csv':
      default:
        content = this.toCsv((data as unknown) as Record<string, unknown>[], columns);
        contentType = 'text/csv';
        extension = 'csv';
        break;
    }
    
    // Upload to storage
    const fileName = `export_${entityType}_${Date.now()}.${extension}`;
    const filePath = `${organizationId}/${jobId}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('exports')
      .upload(filePath, new Blob([content], { type: contentType }));
    
    if (uploadError) {
      throw uploadError;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('exports')
      .getPublicUrl(filePath);
    
    // Update job
    await (supabase as any)
      .from('export_jobs')
      .update({
        status: 'completed',
        file_url: urlData.publicUrl,
        file_size: content.length,
        total_records: (data as unknown[])?.length || 0,
        completed_at: new Date().toISOString()
      } as any)
      .eq('id', jobId);
    
    return urlData.publicUrl;
  }
  
  private static toCsv(data: Record<string, unknown>[], columns: string[]): string {
    if (data.length === 0) {
      return columns.join(',');
    }
    
    const headers = columns.join(',');
    const rows = data.map(row => 
      columns.map(col => {
        const value = row[col];
        if (value === null || value === undefined) return '';
        const str = String(value);
        // Escape quotes and wrap in quotes if contains comma
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    );
    
    return [headers, ...rows].join('\n');
  }
  
  private static toXml(data: Record<string, unknown>[], entityType: string): string {
    const xmlRows = data.map(row => {
      const fields = Object.entries(row)
        .map(([key, value]) => `    <${key}>${this.escapeXml(String(value ?? ''))}</${key}>`)
        .join('\n');
      return `  <${entityType}>\n${fields}\n  </${entityType}>`;
    }).join('\n');
    
    return `<?xml version="1.0" encoding="UTF-8"?>\n<${entityType}s>\n${xmlRows}\n</${entityType}s>`;
  }
  
  private static escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
  
  // ============ ROLLBACK ============
  
  static async rollbackImport(jobId: string): Promise<{ success: boolean; rolledBack: number }> {
    // Get all imported records
    const { data: records, error } = await (supabase as any)
      .from('import_records')
      .select('*')
      .eq('job_id', jobId)
      .eq('status', 'imported');
    
    if (error) {
      throw error;
    }
    
    let rolledBack = 0;
    
    // Delete each created entity
    for (const record of (records as any[]) || []) {
      if (record.created_entity_id) {
        // We need to know the entity type from the job
        const { data: job } = await (supabase as any)
          .from('import_jobs_v2')
          .select('entity_type')
          .eq('id', jobId)
          .maybeSingle();
        
        if (job) {
          const tableName = this.getTableName((job as any).entity_type);
          await supabase
            .from(tableName as any)
            .delete()
            .eq('id', record.created_entity_id);
          
          // Update record status
          await (supabase as any)
            .from('import_records')
            .update({ status: 'rolled_back' } as any)
            .eq('id', record.id);
          
          rolledBack++;
        }
      }
    }
    
    // Update job status
    await (supabase as any)
      .from('import_jobs_v2')
      .update({
        status: 'rolled_back',
        rollback_at: new Date().toISOString()
      } as any)
      .eq('id', jobId);
    
    return { success: true, rolledBack };
  }
}
