import { useRef } from 'react';

import { useRequestAnimationFrame } from '@/shared/hooks/useRequestAnimationFrame';

import { useBlockManagement } from '../hooks/useBlockManagement';
import { useBlockState } from '../hooks/useBlockState';
import { getCursorOffset } from '../lib/cursorUtils';
import {
  findClosestBlock,
  focusBlock,
  focusBlockAtEnd,
  getBlockElement,
  getBlockId,
} from '../lib/domUtils';
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

  // 엔터 키 중복 방지 (StrictMode 때문에 두 번 실행되는 것을 방지)
  const lastEnterTime = useRef<number>(0);

  // 블록 변환 시 포커스 이동을 위한 RAF 사용
  const { executeRAF } = useRequestAnimationFrame();

  // 블록 상태 관리
  const { blocks, setBlocks, skipUpdateBlocks } = useBlockState({
    content,
    containerRef: containerRef as React.RefObject<HTMLElement>,
  });

  // 블록 생성, 수정, 삭제 처리
  const { addBlock } = useBlockManagement({
    blocks,
    setBlocks,
    skipUpdateBlocks,
    onChangeContent,
  });

  // MarkdownEditor의 블록이 아닌 곳 클릭 시, 가장 가까운 블록으로 포커스 이동
  const handleContainerClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // 클릭된 요소가 블록이면 무시
    const target = event.target as HTMLElement;

    if (getBlockId(target)) return;

    const closestBlockId = findClosestBlock(event.clientY);

    if (closestBlockId) {
      executeRAF(() => {
        focusBlockAtEnd(closestBlockId);
      });
    }
  };

  // 엔터키 처리
  const handleEnterKey = (index: number, beforeHtml: string, afterHtml: string) => {
    const now = Date.now();
    // 50ms 내 중복 실행 방지 (StrictMode 때문에 두 번 실행되는 것을 방지)
    if (now - lastEnterTime.current < 50) {
      return;
    }
    lastEnterTime.current = now;

    const currentBlock = blocks[index];
    if (!currentBlock) return;

    // 현재 블록 내용을 beforeText로 업데이트
    const updatedBlocks = blocks.map((block) =>
      block.id === currentBlock.id
        ? {
            ...block,
            innerHTML: beforeHtml,
            tagName: currentBlock.tagName,
          }
        : block,
    );

    setBlocks(updatedBlocks);
    skipUpdateBlocks();
    onChangeContent(blocksToHtml(updatedBlocks));

    // 새 블록 생성 (항상 div로 생성하고 afterText 설정)
    const newBlock = addBlock(currentBlock.id, afterHtml, updatedBlocks);

    // 새 블록으로 포커스 이동
    executeRAF(() => {
      focusBlock(newBlock.id);
    });
  };

  // 백스페이스 처리: 현재 블록의 텍스트를 이전 블록에 병합하고 현재 블록 삭제
  const handleBackspace = (currentIndex: number, currentText: string) => {
    if (currentIndex === 0) return; // 첫 번째 블록이면 처리하지 않음

    const previousIndex = currentIndex - 1;
    const previousBlock = blocks[previousIndex];

    // 이전 블록의 텍스트 길이 저장 (커서 위치 설정용)
    const previousTextLength = previousBlock.innerHTML.length;

    // 이전 블록에 현재 블록의 텍스트 병합
    const updatedBlocks = blocks
      .map((block, index) => {
        if (index === previousIndex) {
          return { ...block, innerHTML: block.innerHTML + currentText };
        }
        return block;
      })
      .filter((_, index) => index !== currentIndex); // 현재 블록 제거

    setBlocks(updatedBlocks);
    skipUpdateBlocks();
    onChangeContent(blocksToHtml(updatedBlocks));

    // 이전 블록의 병합 지점으로 포커스 이동
    executeRAF(() => {
      focusBlock(previousBlock.id, previousTextLength);
    });
  };

  // 블록 내용 변경 시
  const handleChangeBlockContent = (blockId: string, newInnerHTML: string) => {
    const updatedBlocks = blocks.map((block) =>
      block.id === blockId ? { ...block, innerHTML: newInnerHTML } : block,
    );

    setBlocks(updatedBlocks);

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
          onBackspace={handleBackspace}
          onArrowNavigate={handleArrowNavigate}
          onTransform={handleTransformBlock}
        />
      ))}
    </S.MarkdownEditor>
  );
};
