import { useEffect, useRef } from 'react';

import { useTheme } from '@/app/providers/ThemeProvider';
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

  useEffect(() => {
    if (titleRef.current && titleRef.current.innerHTML !== title) {
      titleRef.current.innerHTML = title || '';
    }
  }, [title]);

  return (
    <S.MemoHeader>
      <S.CreatedAt>{createdAt}</S.CreatedAt>
      <S.Title
        ref={titleRef}
        contentEditable
        theme={theme}
        onInput={handleInput}
        data-placeholder={titlePlaceholder || '제목 없음'}
      />
    </S.MemoHeader>
  );
};
