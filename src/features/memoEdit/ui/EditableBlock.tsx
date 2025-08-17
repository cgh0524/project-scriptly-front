import { useEffect, useRef } from 'react';

import { useRequestAnimationFrame } from '@/shared/hooks/useRequestAnimationFrame';
import { clearContentEditable, isContentEditableEmpty } from '@/shared/lib/utils/contentEditable';

import { getCursorOffset, isFirstLine, isLastLine, splitTextAtCursor } from '../lib/cursorUtils';
import { detectMarkdownPattern } from '../lib/parseMarkdown';
import type { Block } from '../types/block.types';
import {
  KEYBOARD_ARROW_DIRECTION,
  type KeyboardArrowDirection,
} from '../types/keyboardArrow.types';
import * as S from './EditableBlock.styles';

interface EditableBlockProps {
  index: number;
  block: Block;
  showPlaceholder: boolean;
  onChange: (blockId: string, newInnerHTML: string) => void;
  onEnterKey: (index: number, beforeText: string, afterText: string) => void;
  onBackspace: (index: number, currentText: string) => void;
  onArrowNavigate?: (index: number, direction: KeyboardArrowDirection) => void;
  onTransform?: (blockId: string, tagName: string, content: string, cursorOffset?: number) => void;
}

// tagName에 따라 동적으로 컴포넌트 선택
const getBlockComponent = (block: Block) => {
  const componentMap = {
    div: { component: S.Block, placeholder: '내용을 입력해주세요' },
    h1: { component: S.H1, placeholder: '제목1' },
    h2: { component: S.H2, placeholder: '제목2' },
    h3: { component: S.H3, placeholder: '제목3' },
    h4: { component: S.H4, placeholder: '제목4' },
    h5: { component: S.H5, placeholder: '제목5' },
    h6: { component: S.H6, placeholder: '제목6' },
  };
  return componentMap[block.tagName] || { component: S.Block, placeholder: '내용을 입력해주세요' };
};

export const EditableBlock = ({
  index,
  block,
  showPlaceholder = true,
  onChange,
  onEnterKey,
  onBackspace,
  onArrowNavigate,
  onTransform,
}: EditableBlockProps) => {
  const blockRef = useRef<HTMLDivElement>(null);

  const { executeRAF } = useRequestAnimationFrame();
  const { component: BlockComponent, placeholder } = getBlockComponent(block);

  const handleInput = (event: React.FormEvent<HTMLDivElement>) => {
    if (isContentEditableEmpty(event.currentTarget)) {
      clearContentEditable(event.currentTarget);
    }

    if (!blockRef.current) return;
    const parsedHtml = event.currentTarget.textContent || '';
    onChange(block.id, parsedHtml);
  };

  // 키보드 이벤트 처리 (트리거 기반 마크다운 파싱)
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!blockRef.current) return;

    if (event.key === 'ArrowUp' && isFirstLine(event.currentTarget)) {
      event.preventDefault();
      onArrowNavigate?.(index, KEYBOARD_ARROW_DIRECTION.UP);
      return;
    }

    if (event.key === 'ArrowDown' && isLastLine(event.currentTarget)) {
      event.preventDefault();
      onArrowNavigate?.(index, KEYBOARD_ARROW_DIRECTION.DOWN);
      return;
    }

    if (event.key === 'ArrowLeft') {
      const cursorOffset = getCursorOffset(event.currentTarget);
      if (cursorOffset > 0) return;

      event.preventDefault();
      onArrowNavigate?.(index, KEYBOARD_ARROW_DIRECTION.LEFT);
      return;
    }

    if (event.key === 'ArrowRight') {
      const cursorOffset = getCursorOffset(event.currentTarget);

      // 텍스트가 존재하는데, 커서가 마지막 위치가 아닌 경우
      if (
        !isContentEditableEmpty(event.currentTarget) &&
        cursorOffset < (blockRef.current?.textContent?.length || 0)
      )
        return;

      event.preventDefault();
      onArrowNavigate?.(index, KEYBOARD_ARROW_DIRECTION.RIGHT);
      return;
    }

    if (event.key === ' ') {
      const element = event.currentTarget;
      const text = element.textContent || '';

      // 마크다운 패턴 감지
      const pattern = detectMarkdownPattern(text + ' ');
      if (pattern) {
        event.preventDefault();

        // 현재 커서 위치 계산 (마크다운 문법 제거 후 위치)
        const cursorOffset = pattern.content.length;
        onTransform?.(block.id, pattern.tagName, pattern.content, cursorOffset);
        return;
      }
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      const { beforeText, afterText } = splitTextAtCursor(event.currentTarget);

      onEnterKey(index, beforeText, afterText);
      executeRAF(() => {
        if (!blockRef.current) return;
        blockRef.current.textContent = beforeText;
      });
      return;
    }

    if (event.key === 'Backspace') {
      const element = event.currentTarget;
      const cursorOffset = getCursorOffset(element);

      // 커서가 맨 앞에 있을 때만 처리
      if (cursorOffset > 0) return;

      // 첫 번째 블록이면 처리하지 않음
      if (index === 0) return;

      event.preventDefault();
      const currentText = element.textContent || '';
      onBackspace(index, currentText);
    }
  };

  useEffect(() => {
    if (!blockRef.current) return;
    if (blockRef.current.innerHTML === block.innerHTML) return;

    // 현재 포커스가 있는 경우 업데이트하지 않음
    if (document.activeElement === blockRef.current) return;

    blockRef.current.innerHTML = block.innerHTML || '';
  }, [block.id, block.innerHTML, block.tagName]);

  return (
    <BlockComponent
      ref={blockRef}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      data-block-id={block.id}
      data-placeholder={showPlaceholder ? placeholder : undefined}
    />
  );
};
