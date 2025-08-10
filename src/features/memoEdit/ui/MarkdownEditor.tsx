import { useEffect, useRef } from 'react';

import { clearContentEditable, isContentEditableEmpty } from '@/shared/lib/utils/contentEditable';

import * as S from './MarkdownEditor.styles';

interface MarkdownEditorProps {
  content: string;
  onChangeContent: (content: string) => void;
}

export const MarkdownEditor = ({ content, onChangeContent }: MarkdownEditorProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleChangeContent = (event: React.FormEvent<HTMLDivElement>) => {
    if (isContentEditableEmpty(event.currentTarget)) {
      clearContentEditable(event.currentTarget);
    }

    onChangeContent(event.currentTarget.textContent || '');
  };

  /** 페이지 처음 진입시, 메모 내용 업데이트 */
  useEffect(() => {
    if (!contentRef.current) return;
    if (contentRef.current.textContent === content) return;

    // 현재 포커스가 있는 경우 업데이트하지 않음
    if (document.activeElement === contentRef.current) return;

    contentRef.current.textContent = content || '';
  }, [content]);

  return <S.MarkdownEditor ref={contentRef} contentEditable onInput={handleChangeContent} />;
};
