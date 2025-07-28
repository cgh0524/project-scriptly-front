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

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.textContent = content || '';
    }
  }, [content]);

  return <S.MarkdownEditor ref={contentRef} contentEditable onInput={handleChangeContent} />;
};
