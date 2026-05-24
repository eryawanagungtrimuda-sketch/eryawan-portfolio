'use client';

import { useMemo, useState } from 'react';
import { X } from 'lucide-react';

type Props = {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions: string[];
  placeholder?: string;
  maxTags?: number;
};

function normalizeTag(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function ProjectTagPicker({ value, onChange, suggestions, placeholder = 'Cari atau tambah area...', maxTags = 10 }: Props) {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const normalizedSuggestions = useMemo(() => {
    const map = new Map<string, string>();
    suggestions.forEach((item) => {
      const normalized = normalizeTag(item);
      if (!normalized || map.has(normalized)) return;
      map.set(normalized, item);
    });
    return map;
  }, [suggestions]);

  const canAddMore = value.length < maxTags;
  const normalizedInput = normalizeTag(input);

  const filteredSuggestions = useMemo(() => {
    const entries = Array.from(normalizedSuggestions.entries());
    if (!normalizedInput) return entries;
    return entries.filter(([tag, label]) => tag.includes(normalizedInput) || label.toLowerCase().includes(normalizedInput));
  }, [normalizedInput, normalizedSuggestions]);

  const inputExistsInSuggestions = normalizedInput ? normalizedSuggestions.has(normalizedInput) : false;
  const inputAlreadySelected = normalizedInput ? value.includes(normalizedInput) : false;

  function addTag(raw: string) {
    const normalized = normalizeTag(raw);
    if (!normalized || value.includes(normalized) || !canAddMore) return;
    onChange([...value, normalized]);
    setInput('');
  }

  function removeTag(tag: string) {
    onChange(value.filter((item) => item !== tag));
  }

  return (
    <div className="rounded-sm border border-white/10 bg-[#0b0b0a] p-4 font-sans">
      <div className="flex flex-wrap gap-2">
        {value.length > 0 ? value.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => removeTag(tag)}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/35 bg-[#D4AF37]/10 px-3 py-1 text-xs text-[#D4AF37]"
          >
            {normalizedSuggestions.get(tag) || tag}
            <X size={12} />
          </button>
        )) : <p className="text-xs text-white/40">Belum ada tags dipilih.</p>}
      </div>

      <input
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 120)}
        onKeyDown={(event) => {
          if (event.key !== 'Enter') return;
          event.preventDefault();
          addTag(input);
        }}
        placeholder={placeholder}
        disabled={!canAddMore}
        className="mt-3 w-full"
      />

      {!canAddMore ? <p className="mt-2 text-xs text-[#D4AF37]/80">Maksimal 10 tags.</p> : null}

      {isFocused && canAddMore ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {filteredSuggestions.map(([tag, label]) => {
            const isSelected = value.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                disabled={isSelected}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => addTag(tag)}
                className="rounded-full border border-white/15 bg-white/[0.02] px-3 py-1 text-xs text-white/72 transition hover:border-[#D4AF37]/40 hover:text-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {label}
              </button>
            );
          })}

          {normalizedInput && !inputExistsInSuggestions && !inputAlreadySelected ? (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => addTag(input)}
              className="rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-3 py-1 text-xs text-[#D4AF37]"
            >
              Add "{normalizedInput}"
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
