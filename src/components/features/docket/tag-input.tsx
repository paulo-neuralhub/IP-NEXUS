import { useState, KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({ value, onChange, placeholder = 'Añadir tag...' }: TagInputProps) {
  const [input, setInput] = useState('');
  
  const addTag = () => {
    const tag = input.trim().toLowerCase();
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
      setInput('');
    }
  };
  
  const removeTag = (tag: string) => {
    onChange(value.filter(t => t !== tag));
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };
  
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map(tag => (
          <Badge key={tag} variant="secondary" className="pl-2 pr-1 gap-1">
            #{tag}
            <button 
              type="button"
              onClick={() => removeTag(tag)} 
              className="ml-1 hover:text-destructive"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1"
        />
        <button
          type="button"
          onClick={addTag}
          disabled={!input.trim()}
          className="flex items-center gap-1 px-3 py-2 text-sm text-primary hover:bg-primary/10 rounded border border-input disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
