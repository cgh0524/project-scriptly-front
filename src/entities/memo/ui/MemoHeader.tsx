import { useEffect, useRef } from 'react';

import { useTheme } from '@/app/providers/ThemeProvider';
import { focusBlockAtEnd, getAllBlockElements, getBlockId } from '@/features/memoEdit/lib/domUtils';
import { clearContentEditable, isContentEditableEmpty } from '@/shared/lib/utils/contentEditable';

import * as S from './MemoHeader.styles';

interface MemoHeaderProps {
  title: string;
  createdAt: string;
  onChangeTitle: (event: string) => void;
  titlePlaceholder?: string;
}

export const MemoHeader = ({
  title,
  createdAt,
  titlePlaceholder,
  onChangeTitle,
}: MemoHeaderProps) => {
  const titleRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const handleInput = (event: React.FormEvent<HTMLDivElement>) => {
    if (isContentEditableEmpty(event.currentTarget)) {
      clearContentEditable(event.currentTarget);
    }

    onChangeTitle(event.currentTarget.textContent || '');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      // RAF로 포커스 이동 지연
      requestAnimationFrame(() => {
        const blocks = getAllBlockElements();
        if (blocks.length === 0) return;

        const blockId = getBlockId(blocks[0]);
        if (!blockId) return;

        focusBlockAtEnd(blockId);
      });
    }
  };
  /** 페이지 처음 진입시, 메모 제목 업데이트 */
  useEffect(() => {
    if (!titleRef.current) return;
    if (titleRef.current.innerHTML === title) return;

    // 현재 포커스가 있는 경우 업데이트하지 않음
    if (document.activeElement === titleRef.current) return;

    titleRef.current.innerHTML = title || '';
  }, [title]);

  return (
    <S.MemoHeader>
      <S.CreatedAt>{createdAt}</S.CreatedAt>
      <S.Title
        ref={titleRef}
        contentEditable
        theme={theme}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder={titlePlaceholder || '제목 없음'}
      />
    </S.MemoHeader>
  );
};
