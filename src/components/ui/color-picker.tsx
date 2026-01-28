/**
 * Visual Color Picker Component
 * Shows predefined color circles for easy selection
 */

import { cn } from '@/lib/utils';

export const STAGE_COLORS = [
  { name: 'Azul', value: '#3B82F6' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Verde', value: '#22C55E' },
  { name: 'Lima', value: '#84CC16' },
  { name: 'Amarillo', value: '#EAB308' },
  { name: 'Naranja', value: '#F97316' },
  { name: 'Rojo', value: '#EF4444' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Morado', value: '#8B5CF6' },
  { name: 'Índigo', value: '#6366F1' },
  { name: 'Gris', value: '#6B7280' },
  { name: 'Slate', value: '#64748B' },
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  const selectedColor = STAGE_COLORS.find(c => c.value === value);

  return (
    <div className={cn('space-y-2', className)}>
      <div className="grid grid-cols-6 gap-2">
        {STAGE_COLORS.map(color => (
          <button
            key={color.value}
            type="button"
            onClick={() => onChange(color.value)}
            className={cn(
              'w-8 h-8 rounded-full border-2 transition-all hover:scale-110',
              value === color.value
                ? 'border-slate-900 dark:border-white scale-110 ring-2 ring-offset-2 ring-slate-900 dark:ring-white'
                : 'border-transparent hover:border-slate-300'
            )}
            style={{ backgroundColor: color.value }}
            title={color.name}
            aria-label={`Seleccionar color ${color.name}`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Seleccionado: {selectedColor?.name || value}
      </p>
    </div>
  );
}
