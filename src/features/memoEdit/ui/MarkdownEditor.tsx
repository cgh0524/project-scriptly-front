import { useRef } from 'react';

import { useRequestAnimationFrame } from '@/shared/hooks/useRequestAnimationFrame';

import { useBlockInteraction } from '../hooks/useBlockInteraction';
import { useBlockOperations } from '../hooks/useBlockOperations';
import { useMarkdownBlocks } from '../hooks/useMarkdownBlocks';
import { focusBlock } from '../lib/domUtils';
import { blocksToHtml } from '../lib/htmlParser';
import type { Block } from '../types/block.types';
import { EditableBlock } from './EditableBlock';
import * as S from './MarkdownEditor.styles';

interface MarkdownEditorProps {
  content: string;
  onChangeContent: (content: string) => void;
}

export const MarkdownEditor = ({ content, onChangeContent }: MarkdownEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // 블록 변환 시 포커스 이동을 위한 RAF 사용
  const { executeRAF } = useRequestAnimationFrame();

  // 마크다운 블록 상태 관리
  const { blocks, setBlocks, skipUpdateBlocks } = useMarkdownBlocks({
    content,
    containerRef: containerRef as React.RefObject<HTMLElement>,
  });

  // 블록 생성, 수정, 삭제 처리
  const { addBlock, deleteBlock } = useBlockOperations({
    blocks,
    setBlocks,
    skipUpdateBlocks,
    onChangeContent,
  });

  // 키보드 이벤트 및 포커스 관리
  const { handleEnterKey, handleDeleteBlock, handleContainerClick } = useBlockInteraction({
    addBlock,
    deleteBlock,
  });

  // 블록 내용 변경 시
  const handleChangeBlockContent = (blockId: string, newInnerHTML: string) => {
    const updatedBlocks = blocks.map((block) =>
      block.id === blockId ? { ...block, innerHTML: newInnerHTML } : block,
    );

    setBlocks(updatedBlocks);
    skipUpdateBlocks();
    onChangeContent(blocksToHtml(updatedBlocks));
  };

  // 마크다운 패턴으로 블록 변환 시
  const handleTransformBlock = (
    blockId: string,
    tagName: string,
    content: string,
    cursorOffset?: number,
  ) => {
    const updatedBlocks = blocks.map((block) =>
      block.id === blockId
        ? { ...block, tagName: tagName as Block['tagName'], innerHTML: content }
        : block,
    );

    setBlocks(updatedBlocks);
    skipUpdateBlocks();
    onChangeContent(blocksToHtml(updatedBlocks));

    if (cursorOffset !== undefined) {
      executeRAF(() => {
        focusBlock(blockId, cursorOffset);
      });
    }
  };

  return (
    <S.MarkdownEditor ref={containerRef} onClick={handleContainerClick}>
      {blocks.map((block, index) => (
        <EditableBlock
          key={block.id}
          block={block}
          showPlaceholder={index === blocks.length - 1}
          onChange={handleChangeBlockContent}
          onEnterKey={handleEnterKey}
          onDelete={handleDeleteBlock}
          onTransform={handleTransformBlock}
        />
      ))}
    </S.MarkdownEditor>
  );
};
