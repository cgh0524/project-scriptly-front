import { useEffect, useRef } from 'react';

import { clearContentEditable, isContentEditableEmpty } from '@/shared/lib/utils/contentEditable';

import { parseMarkdown } from '../lib/parseMarkdown';
import type { Block } from '../types/block';
import * as S from './EditableBlock.styles';

interface EditableBlockProps {
  block: Block;
  onChange: (blockId: string, newInnerHTML: string) => void;
  onEnterKey: (blockId: string) => void;
  onDelete: (blockId: string) => void;
}

export const EditableBlock = ({ block, onChange, onEnterKey, onDelete }: EditableBlockProps) => {
  const blockRef = useRef<HTMLDivElement>(null);

  const handleInput = (event: React.FormEvent<HTMLDivElement>) => {
    if (isContentEditableEmpty(event.currentTarget)) {
      clearContentEditable(event.currentTarget);
    }

    if (!blockRef.current) return;
    const parsedHtml = parseMarkdown(event.currentTarget.innerHTML);
    onChange(block.id, parsedHtml);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onEnterKey(block.id);
    }

    if (event.key === 'Backspace') {
      const element = event.currentTarget;
      if (isContentEditableEmpty(element)) {
        event.preventDefault();
        onDelete(block.id);
      }
    }
  };

  useEffect(() => {
    if (!blockRef.current) return;
    if (blockRef.current.innerHTML === block.innerHTML) return;

    // 현재 포커스가 있는 경우 업데이트하지 않음
    if (document.activeElement === blockRef.current) return;

    blockRef.current.innerHTML = block.innerHTML || '';
  }, [block.innerHTML]);

  return (
    <S.Block
      ref={blockRef}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      data-block-id={block.id}
    />
  );
};
