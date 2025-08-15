import { useRef } from 'react';

import { useBlockOperations } from '../hooks/useBlockOperations';
import { useFocusManager } from '../hooks/useFocusManager';
import { useMarkdownBlocks } from '../hooks/useMarkdownBlocks';
import { EditableBlock } from './EditableBlock';
import * as S from './MarkdownEditor.styles';

interface MarkdownEditorProps {
  content: string;
  onChangeContent: (content: string) => void;
}

export const MarkdownEditor = ({ content, onChangeContent }: MarkdownEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // 마크다운 블록 상태 관리
  const { blocks, setBlocks, skipUpdateBlocks } = useMarkdownBlocks({
    content,
    containerRef: containerRef as React.RefObject<HTMLElement>,
  });

  // 블록 생성, 수정, 삭제 처리
  const { handleBlockChange, addBlock, deleteBlock } = useBlockOperations({
    blocks,
    setBlocks,
    skipUpdateBlocks,
    onChangeContent,
  });

  // 키보드 이벤트 및 포커스 관리
  const { handleEnterKey, handleDeleteBlock } = useFocusManager({
    addBlock,
    deleteBlock,
  });

  return (
    <S.MarkdownEditor ref={containerRef}>
      {blocks.map((block) => (
        <EditableBlock
          key={block.id}
          block={block}
          onChange={handleBlockChange}
          onEnterKey={handleEnterKey}
          onDelete={handleDeleteBlock}
        />
      ))}
    </S.MarkdownEditor>
  );
};
