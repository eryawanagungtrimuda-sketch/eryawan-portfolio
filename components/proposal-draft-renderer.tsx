import { Fragment } from 'react';

type ProposalDraftRendererProps = {
  content: string;
  compact?: boolean;
};

type Block =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'spacer' };

const headingPattern = /^\*\*(.+)\*\*$/;
const unorderedPattern = /^-\s+(.+)$/;
const orderedPattern = /^\d+\.\s+(.+)$/;
const inlineBoldPattern = /(\*\*[^*]+\*\*)/g;

function renderInlineBold(text: string) {
  return text.split(inlineBoldPattern).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${part}-${index}`} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
    }

    return <Fragment key={`${part}-${index}`}>{part}</Fragment>;
  });
}

function parseBlocks(content: string): Block[] {
  const lines = content.split(/\r?\n/);
  const blocks: Block[] = [];
  let ulItems: string[] = [];
  let olItems: string[] = [];

  const flushLists = () => {
    if (ulItems.length) {
      blocks.push({ type: 'ul', items: ulItems });
      ulItems = [];
    }

    if (olItems.length) {
      blocks.push({ type: 'ol', items: olItems });
      olItems = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushLists();
      blocks.push({ type: 'spacer' });
      continue;
    }

    const headingMatch = line.match(headingPattern);
    if (headingMatch) {
      flushLists();
      blocks.push({ type: 'heading', text: headingMatch[1].trim() });
      continue;
    }

    const unorderedMatch = line.match(unorderedPattern);
    if (unorderedMatch) {
      if (olItems.length) {
        blocks.push({ type: 'ol', items: olItems });
        olItems = [];
      }
      ulItems.push(unorderedMatch[1].trim());
      continue;
    }

    const orderedMatch = line.match(orderedPattern);
    if (orderedMatch) {
      if (ulItems.length) {
        blocks.push({ type: 'ul', items: ulItems });
        ulItems = [];
      }
      olItems.push(orderedMatch[1].trim());
      continue;
    }

    flushLists();
    blocks.push({ type: 'paragraph', text: line });
  }

  flushLists();

  return blocks;
}

export function ProposalDraftRenderer({ content, compact = false }: ProposalDraftRendererProps) {
  const blocks = parseBlocks(content || '');

  return (
    <div className={`font-sans ${compact ? 'space-y-2 text-sm' : 'space-y-3 text-sm sm:text-[15px]'}`}>
      {blocks.map((block, index) => {
        if (block.type === 'spacer') {
          return <div key={`spacer-${index}`} className={compact ? 'h-1' : 'h-2'} aria-hidden="true" />;
        }

        if (block.type === 'heading') {
          return (
            <h3
              key={`heading-${index}`}
              className={`${compact ? 'pt-1 text-sm' : 'pt-2 text-base'} font-semibold tracking-wide text-[#E8D8A8]`}
            >
              {renderInlineBold(block.text)}
            </h3>
          );
        }

        if (block.type === 'ul') {
          return (
            <ul key={`ul-${index}`} className={`${compact ? 'space-y-1 pl-5' : 'space-y-1.5 pl-6'} list-disc text-white/85`}>
              {block.items.map((item, itemIndex) => (
                <li key={`ul-item-${itemIndex}`} className="leading-relaxed">
                  {renderInlineBold(item)}
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === 'ol') {
          return (
            <ol key={`ol-${index}`} className={`${compact ? 'space-y-1 pl-5' : 'space-y-1.5 pl-6'} list-decimal text-white/85`}>
              {block.items.map((item, itemIndex) => (
                <li key={`ol-item-${itemIndex}`} className="leading-relaxed">
                  {renderInlineBold(item)}
                </li>
              ))}
            </ol>
          );
        }

        return (
          <p key={`paragraph-${index}`} className="whitespace-pre-wrap leading-relaxed text-white/85">
            {renderInlineBold(block.text)}
          </p>
        );
      })}
    </div>
  );
}
