// =============================================
// COMPONENTE: ContactSearch
// Búsqueda de contactos con autocompletado
// =============================================

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X, User, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { cn } from '@/lib/utils';

interface Contact {
  id: string;
  name: string;
  email: string | null;
  company_name?: string | null;
  type?: string;
}

interface SelectedContact {
  id?: string;
  email: string;
  name?: string;
  type?: string;
}

interface ContactSearchProps {
  value: SelectedContact[];
  onChange: (contacts: SelectedContact[]) => void;
  placeholder?: string;
  multiple?: boolean;
  className?: string;
}

export function ContactSearch({
  value = [],
  onChange,
  placeholder = 'Buscar contacto o escribir email...',
  multiple = true,
  className,
}: ContactSearchProps) {
  const { currentOrganization } = useOrganization();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Search contacts
  const { data: contacts } = useQuery({
    queryKey: ['contact-search', currentOrganization?.id, query],
    queryFn: async () => {
      if (!currentOrganization?.id || query.length < 2) return [];
      
      const { data, error } = await supabase
        .from('contacts')
        .select('id, name, email, company_name, type')
        .eq('organization_id', currentOrganization.id)
        .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(10);
      
      if (error) throw error;
      return data as Contact[];
    },
    enabled: !!currentOrganization?.id && query.length >= 2,
  });

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (contact: Contact) => {
    const newContact: SelectedContact = {
      id: contact.id,
      email: contact.email || '',
      name: contact.name,
      type: contact.type,
    };
    
    if (multiple) {
      if (!value.some(v => v.email === newContact.email)) {
        onChange([...value, newContact]);
      }
    } else {
      onChange([newContact]);
    }
    
    setQuery('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.includes('@')) {
      e.preventDefault();
      const newContact: SelectedContact = { email: query };
      
      if (multiple) {
        if (!value.some(v => v.email === query)) {
          onChange([...value, newContact]);
        }
      } else {
        onChange([newContact]);
      }
      
      setQuery('');
    } else if (e.key === 'Backspace' && !query && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeContact = (index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="flex flex-wrap gap-1 p-2 min-h-[40px] border rounded-md bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        {value.map((contact, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="flex items-center gap-1 h-6"
          >
            {contact.type === 'company' ? (
              <Building2 className="w-3 h-3" />
            ) : (
              <User className="w-3 h-3" />
            )}
            <span className="max-w-[150px] truncate">
              {contact.name || contact.email}
            </span>
            <button
              type="button"
              onClick={() => removeContact(index)}
              className="ml-1 hover:bg-background/50 rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
        />
      </div>

      {/* Dropdown de resultados */}
      {isOpen && contacts && contacts.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-auto">
          {contacts.map((contact) => (
            <button
              key={contact.id}
              type="button"
              onClick={() => handleSelect(contact)}
              className="w-full px-3 py-2 text-left hover:bg-accent flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                {contact.type === 'company' ? (
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <User className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{contact.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {contact.email}
                  {contact.company_name && ` · ${contact.company_name}`}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Hint para email manual */}
      {isOpen && query.includes('@') && !contacts?.some(c => c.email === query) && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg">
          <button
            type="button"
            onClick={() => {
              onChange([...value, { email: query }]);
              setQuery('');
              setIsOpen(false);
            }}
            className="w-full px-3 py-2 text-left hover:bg-accent flex items-center gap-2 text-sm"
          >
            <Search className="w-4 h-4 text-muted-foreground" />
            <span>Usar "{query}"</span>
          </button>
        </div>
      )}
    </div>
  );
}