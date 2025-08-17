import { useEffect, useRef } from 'react';

import { clearContentEditable, isContentEditableEmpty } from '@/shared/lib/utils/contentEditable';

import { detectMarkdownPattern } from '../lib/parseMarkdown';
import type { Block } from '../types/block.types';
import * as S from './EditableBlock.styles';

interface EditableBlockProps {
  block: Block;
  showPlaceholder: boolean;
  onChange: (blockId: string, newInnerHTML: string) => void;
  onEnterKey: (blockId: string) => void;
  onDelete: (blockId: string) => void;
  onTransform?: (blockId: string, tagName: string, content: string, cursorOffset?: number) => void;
}

export const EditableBlock = ({
  block,
  showPlaceholder = true,
  onChange,
  onEnterKey,
  onDelete,
  onTransform,
}: EditableBlockProps) => {
  const blockRef = useRef<HTMLDivElement>(null);

  // tagName에 따라 동적으로 컴포넌트 선택
  const getBlockComponent = () => {
    const componentMap = {
      div: { component: S.Block, placeholder: '내용을 입력해주세요' },
      h1: { component: S.H1, placeholder: '제목1' },
      h2: { component: S.H2, placeholder: '제목2' },
      h3: { component: S.H3, placeholder: '제목3' },
      h4: { component: S.H4, placeholder: '제목4' },
      h5: { component: S.H5, placeholder: '제목5' },
      h6: { component: S.H6, placeholder: '제목6' },
    };
    return (
      componentMap[block.tagName] || { component: S.Block, placeholder: '내용을 입력해주세요' }
    );
  };

  const { component: BlockComponent, placeholder } = getBlockComponent();

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
      onEnterKey(block.id);
    }

    if (event.key === 'Backspace') {
      const element = event.currentTarget;
      if (!isContentEditableEmpty(element)) return;
      event.preventDefault();

      // 블록의 태그가 div가 아닌 경우 (markdown문법이 적용되어있는 경우)
      if (block.tagName !== 'div') {
        onTransform?.(block.id, 'div', '', 0);
        return;
      }

      onDelete(block.id);
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
