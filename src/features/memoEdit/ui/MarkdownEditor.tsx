import { useRef } from 'react';

import { useRequestAnimationFrame } from '@/shared/hooks/useRequestAnimationFrame';

import { useBlockInteraction } from '../hooks/useBlockInteraction';
import { useBlockManagement } from '../hooks/useBlockManagement';
import { useBlockState } from '../hooks/useBlockState';
import { getCursorOffset } from '../lib/cursorUtils';
import { focusBlock, focusBlockAtEnd, getBlockElement } from '../lib/domUtils';
import { blocksToHtml } from '../lib/htmlParser';
import type { Block } from '../types/block.types';
import {
  KEYBOARD_ARROW_DIRECTION,
  type KeyboardArrowDirection,
} from '../types/keyboardArrow.types';
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

  // 블록 상태 관리
  const { blocks, setBlocks, skipUpdateBlocks } = useBlockState({
    content,
    containerRef: containerRef as React.RefObject<HTMLElement>,
  });

  // 블록 생성, 수정, 삭제 처리
  const { addBlock, deleteBlock } = useBlockManagement({
    blocks,
    setBlocks,
    skipUpdateBlocks,
    onChangeContent,
  });

  // 키보드 이벤트 및 포커스 관리
  const { handleEnterKey, handleDeleteBlock, handleContainerClick } = useBlockInteraction({
    blocks,
    setBlocks,
    addBlock,
    deleteBlock,
    onChangeContent,
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

  // 방향키로 블록간 이동
  const handleArrowNavigate = (currentIndex: number, direction: KeyboardArrowDirection) => {
    const currentBlockElement = getBlockElement(blocks[currentIndex].id) as HTMLElement;
    let targetIndex = currentIndex;

    switch (direction) {
      case KEYBOARD_ARROW_DIRECTION.UP:
        targetIndex = currentIndex - 1;
        if (targetIndex < 0) return;

        executeRAF(() => {
          const cursorOffset = getCursorOffset(currentBlockElement);
          focusBlock(blocks[targetIndex].id, cursorOffset);
        });
        break;

      case KEYBOARD_ARROW_DIRECTION.DOWN:
        targetIndex = currentIndex + 1;
        if (targetIndex >= blocks.length) return;

        executeRAF(() => {
          const cursorOffset = getCursorOffset(currentBlockElement);
          focusBlock(blocks[targetIndex].id, cursorOffset);
        });
        break;

      case KEYBOARD_ARROW_DIRECTION.LEFT:
        targetIndex = currentIndex - 1;
        if (targetIndex < 0) return;

        executeRAF(() => {
          focusBlockAtEnd(blocks[targetIndex].id);
        });
        break;

      case KEYBOARD_ARROW_DIRECTION.RIGHT:
        targetIndex = currentIndex + 1;
        if (targetIndex >= blocks.length) return;

        executeRAF(() => {
          focusBlock(blocks[targetIndex].id, 0);
        });
        break;
    }
  };

  return (
    <S.MarkdownEditor ref={containerRef} onClick={handleContainerClick}>
      {blocks.map((block, index) => (
        <EditableBlock
          key={block.id}
          index={index}
          block={block}
          showPlaceholder={index === blocks.length - 1}
          onChange={handleChangeBlockContent}
          onEnterKey={handleEnterKey}
          onDelete={handleDeleteBlock}
          onArrowNavigate={handleArrowNavigate}
          onTransform={handleTransformBlock}
        />
      ))}
    </S.MarkdownEditor>
  );
};
