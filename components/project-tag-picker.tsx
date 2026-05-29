'use client';

import { useCallback, useMemo, useState } from 'react';
import { X } from 'lucide-react';

type Normalizer = (value?: string | null) => string;
type Labeler = (value?: string | null) => string;

type Props = {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions: string[];
  placeholder?: string;
  maxTags?: number;
  variant?: 'default' | 'compact';
  emptyText?: string;
  showHelperText?: boolean;
  className?: string;
  normalizeTagValue?: Normalizer;
  getTagLabel?: Labeler;
};

function normalizeTag(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function ProjectTagPicker({
  value,
  onChange,
  suggestions,
  placeholder = 'Cari atau tambah area...',
  maxTags = 10,
  variant = 'default',
  emptyText = 'Belum ada tags dipilih.',
  showHelperText = true,
  className = '',
  normalizeTagValue,
  getTagLabel,
}: Props) {
  const normalizeValue = useCallback(
    (value?: string | null) => normalizeTagValue ? normalizeTagValue(value) : normalizeTag(value || ''),
    [normalizeTagValue],
  );
  const labelValue = useCallback(
    (value?: string | null) => getTagLabel ? getTagLabel(value) : (value || '').trim(),
    [getTagLabel],
  );
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const normalizedSuggestions = useMemo(() => {
    const map = new Map<string, string>();
    suggestions.forEach((item) => {
      const normalized = normalizeValue(item);
      if (!normalized || map.has(normalized)) return;
      map.set(normalized, item);
    });
    return map;
  }, [suggestions, normalizeValue]);

  const canAddMore = value.length < maxTags;
  const normalizedInput = normalizeValue(input);

  const filteredSuggestions = useMemo(() => {
    const entries = Array.from(normalizedSuggestions.entries());
    if (!normalizedInput) return entries;
    return entries.filter(([tag, label]) => tag.includes(normalizedInput) || label.toLowerCase().includes(normalizedInput));
  }, [normalizedInput, normalizedSuggestions]);

  const inputExistsInSuggestions = normalizedInput ? normalizedSuggestions.has(normalizedInput) : false;
  const inputAlreadySelected = normalizedInput ? value.includes(normalizedInput) : false;
  const shouldShowSuggestions = canAddMore && (isFocused || normalizedInput.length > 0);

  function addTag(raw: string) {
    const normalized = normalizeValue(raw);
    if (!normalized || value.includes(normalized) || !canAddMore) return;
    onChange([...value, normalized]);
    setInput('');
  }

  function removeTag(tag: string) {
    onChange(value.filter((item) => item !== tag));
  }

  const containerClassName = variant === 'compact'
    ? 'rounded-xl border border-white/10 bg-black/20 p-3 font-sans'
    : 'rounded-sm border border-white/10 bg-[#0b0b0a] p-4 font-sans';
  const inputSpacingClassName = variant === 'compact' ? 'mt-2.5' : 'mt-3';
  const suggestionSpacingClassName = variant === 'compact' ? 'mt-2.5' : 'mt-3';

  return (
    <div className={`${containerClassName} ${className}`.trim()}>
      <div className="flex flex-wrap gap-2">
        {value.length > 0 ? value.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => removeTag(tag)}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/35 bg-[#D4AF37]/10 px-3 py-1 text-xs text-[#D4AF37]"
          >
            {labelValue(normalizedSuggestions.get(tag) || tag) || tag}
            <X size={12} />
          </button>
        )) : <p className="text-xs text-white/40">{emptyText}</p>}
      </div>

      <input
        value={input}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setTimeout(() => setIsFocused(false), 120);
        }}
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== 'Enter') return;
          event.preventDefault();
          addTag(input);
        }}
        placeholder={placeholder}
        disabled={!canAddMore}
        className={`${inputSpacingClassName} w-full`}
      />

      {showHelperText && !canAddMore ? <p className="mt-2 text-xs text-[#D4AF37]/80">Maksimal {maxTags} tags.</p> : null}

      {shouldShowSuggestions ? (
        <div className={`${suggestionSpacingClassName} max-w-full overflow-hidden flex flex-wrap gap-1.5`}>
          {filteredSuggestions.map(([tag, label]) => {
            const isSelected = value.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                disabled={isSelected}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => addTag(tag)}
                className="max-w-full truncate rounded-full border border-white/15 bg-white/[0.02] px-2.5 py-1 font-sans text-[11px] text-white/72 transition hover:border-[#D4AF37]/40 hover:text-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {labelValue(label) || label}
              </button>
            );
          })}

          {normalizedInput && !inputExistsInSuggestions && !inputAlreadySelected ? (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => addTag(input)}
              className="max-w-full truncate rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-2.5 py-1 font-sans text-[11px] text-[#D4AF37]"
            >
              {'Add "'}
              {labelValue(normalizedInput) || normalizedInput}
              {'"'}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
