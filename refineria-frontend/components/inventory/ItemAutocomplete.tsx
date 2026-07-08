'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import type { SupplyItem } from '@/types';

interface ItemAutocompleteProps {
  items: SupplyItem[];
  value: string;
  onChange: (itemId: string) => void;
  placeholder?: string;
}

export default function ItemAutocomplete({
  items,
  value,
  onChange,
  placeholder = 'Seleccionar...',
}: ItemAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedItem = value ? items.find((i) => i.id === value) : null;

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (i) => i.code.toLowerCase().includes(q) || i.name.toLowerCase().includes(q),
    );
  }, [items, query]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);



  const handleSelect = (itemId: string) => {
    onChange(itemId);
    const item = items.find((i) => i.id === itemId);
    setQuery(item ? `${item.code} — ${item.name}` : '');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIdx((prev) => Math.min(prev + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIdx((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightIdx >= 0 && highlightIdx < filtered.length) {
          handleSelect(filtered[highlightIdx].id);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const displayValue = query;

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={displayValue}
        onChange={(e) => {
          setQuery(e.target.value);
          setHighlightIdx(-1);
          setIsOpen(true);
        }}
        onFocus={() => {
          if (!selectedItem) setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
        className="w-full bg-transparent border-0 text-slate-200 text-xs outline-none focus:ring-0 placeholder:text-slate-600 py-2"
        placeholder={selectedItem ? `${selectedItem.code} — ${selectedItem.name}` : placeholder}
      />
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-midnight-800 border border-blue-500/20 rounded-sm shadow-xl max-h-[300px] overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onMouseDown={() => handleSelect(item.id)}
                onMouseEnter={() => setHighlightIdx(idx)}
                className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center gap-2 ${
                  idx === highlightIdx
                    ? 'bg-blue-500/20 text-white'
                    : 'text-slate-300 hover:bg-midnight-700'
                }`}
              >
                <span className="font-mono text-slate-400 flex-shrink-0">{item.code}</span>
                <span className="truncate flex-1">— {item.name}</span>
                <span className="text-slate-500 flex-shrink-0 font-mono">[{item.currentStock}]</span>
              </button>
            ))
          ) : (
            <div className="px-3 py-3 text-xs text-slate-500 text-center">
              No se encontraron insumos.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
