import { MATTER_TYPES } from '@/lib/constants/matters';
import type { MatterType } from '@/types/matters';
import { Tag, Lightbulb, Palette, Globe, Copyright, File, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, LucideIcon> = {
  Tag,
  Lightbulb,
  Palette,
  Globe,
  Copyright,
  File,
};

interface MatterTypeSelectorProps {
  value: MatterType | null;
  onChange: (type: MatterType) => void;
  disabled?: boolean;
}

export function MatterTypeSelector({ value, onChange, disabled }: MatterTypeSelectorProps) {
  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
      {Object.entries(MATTER_TYPES).map(([key, config]) => {
        const Icon = iconMap[config.icon];
        const isSelected = value === key;
        
        return (
          <button
            key={key}
            type="button"
            disabled={disabled}
            onClick={() => onChange(key as MatterType)}
            className={cn(
              "flex flex-col items-center p-4 rounded-xl border-2 transition-all",
              isSelected 
                ? "border-primary bg-primary/10" 
                : "border-border hover:border-primary/50 bg-card",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center mb-2"
              style={{ backgroundColor: `${config.color}20` }}
            >
              {Icon && <Icon className="w-5 h-5" style={{ color: config.color }} />}
            </div>
            <span className="text-sm font-medium text-foreground">{config.label}</span>
          </button>
        );
      })}
    </div>
  );
}
