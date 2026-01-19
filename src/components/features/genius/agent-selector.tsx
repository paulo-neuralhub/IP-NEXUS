import { AGENTS } from '@/lib/constants/genius';
import type { AgentType } from '@/types/genius';
import { cn } from '@/lib/utils';
import { 
  HelpCircle, 
  Briefcase, 
  Scale, 
  Eye, 
  FileSearch,
  Languages,
  Bot
} from 'lucide-react';

const ICON_MAP = {
  HelpCircle,
  Briefcase,
  Scale,
  Eye,
  FileSearch,
  Languages,
};

interface Props {
  selected: AgentType;
  onChange: (agent: AgentType) => void;
  variant?: 'tabs' | 'cards' | 'dropdown';
}

export function AgentSelector({ selected, onChange, variant = 'tabs' }: Props) {
  if (variant === 'cards') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Object.entries(AGENTS).map(([key, agent]) => {
          const Icon = ICON_MAP[agent.icon as keyof typeof ICON_MAP] || Bot;
          const isSelected = selected === key;
          
          return (
            <button
              key={key}
              onClick={() => onChange(key as AgentType)}
              className={cn(
                "p-4 rounded-xl border-2 text-left transition-all",
                isSelected 
                  ? "border-current shadow-lg" 
                  : "border-border hover:border-muted-foreground"
              )}
              style={isSelected ? { borderColor: agent.color } : undefined}
            >
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: `${agent.color}20` }}
              >
                <Icon className="w-5 h-5" style={{ color: agent.color }} />
              </div>
              <h3 className="font-semibold text-foreground text-sm">{agent.name}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{agent.description}</p>
            </button>
          );
        })}
      </div>
    );
  }
  
  if (variant === 'dropdown') {
    return (
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value as AgentType)}
        className="border rounded-lg px-3 py-2 bg-background"
      >
        {Object.entries(AGENTS).map(([key, agent]) => (
          <option key={key} value={key}>
            {agent.name}
          </option>
        ))}
      </select>
    );
  }
  
  // Tabs (default)
  return (
    <div className="flex gap-1 p-1 bg-muted rounded-lg overflow-x-auto">
      {Object.entries(AGENTS).map(([key, agent]) => {
        const Icon = ICON_MAP[agent.icon as keyof typeof ICON_MAP] || Bot;
        const isSelected = selected === key;
        
        return (
          <button
            key={key}
            onClick={() => onChange(key as AgentType)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
              isSelected 
                ? "bg-background shadow-sm" 
                : "hover:bg-background/50"
            )}
            style={isSelected ? { color: agent.color } : undefined}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{agent.name.replace('NEXUS ', '')}</span>
          </button>
        );
      })}
    </div>
  );
}
