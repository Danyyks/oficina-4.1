import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from './ui/input';
import { Cliente } from '../types';

interface ClienteSearchProps {
  clientes: Cliente[];
  value: string;
  onChange: (clienteId: string) => void;
  placeholder?: string;
}

export function ClienteSearch({ clientes, value, onChange, placeholder = 'Buscar cliente pelo nome...' }: ClienteSearchProps) {
  const clienteSelecionado = clientes.find(c => c.id === value);
  const [query, setQuery] = useState(clienteSelecionado?.nome ?? '');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? clientes.filter(c => c.nome.toLowerCase().includes(query.toLowerCase()))
    : clientes;

  useEffect(() => {
    const selected = clientes.find(c => c.id === value);
    setQuery(selected?.nome ?? '');
  }, [value, clientes]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        const selected = clientes.find(c => c.id === value);
        setQuery(selected?.nome ?? '');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value, clientes]);

  const handleSelect = (cliente: Cliente) => {
    onChange(cliente.id);
    setQuery(cliente.nome);
    setOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setQuery('');
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (!e.target.value) onChange('');
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="rounded-xl bg-gray-50 border-gray-200 pl-9 pr-8"
        />
        {(query || value) && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
          {filtered.map(cliente => (
            <button
              key={cliente.id}
              type="button"
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(cliente)}
            >
              <span className="font-medium text-gray-900">{cliente.nome}</span>
              {cliente.telefone && (
                <span className="text-gray-400 ml-2 text-xs">{cliente.telefone}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {open && query.trim() && filtered.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3">
          <p className="text-sm text-gray-400">Nenhum cliente encontrado</p>
        </div>
      )}
    </div>
  );
}
