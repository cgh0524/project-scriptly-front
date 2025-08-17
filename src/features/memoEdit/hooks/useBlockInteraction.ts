import { useRef } from 'react';

import { findClosestBlock, focusBlock, focusBlockAtEnd } from '../lib/domUtils';
import type { Block } from '../types/block.types';

interface UseFocusManagerProps {
  addBlock: (afterBlockId: string) => Block;
  deleteBlock: (blockId: string) => string | null;
}

/**
 * 블록 포커스 및 키보드 이벤트 관리 훅
 */
export const useBlockInteraction = ({ addBlock, deleteBlock }: UseFocusManagerProps) => {
  const lastEnterTime = useRef<number>(0);

  const handleEnterKey = (blockId: string) => {
    const now = Date.now();
    // 50ms 내 중복 실행 방지 (StrictMode 때문에 두 번 실행되는 것을 방지)
    if (now - lastEnterTime.current < 50) {
      return;
    }
    lastEnterTime.current = now;

    const newBlock = addBlock(blockId);

    // 새 블록으로 포커스 이동
    setTimeout(() => {
      focusBlock(newBlock.id);
    }, 0);
  };

  const handleDeleteBlock = (blockId: string) => {
    const prevBlockId = deleteBlock(blockId);

    // 이전 블록으로 포커스 이동
    if (prevBlockId) {
      setTimeout(() => {
        focusBlockAtEnd(prevBlockId);
      }, 0);
    }
  };

  const handleContainerClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // 클릭된 요소가 블록이면 무시
    const target = event.target as HTMLElement;

    if (target.getAttribute('data-block-id')) {
      return;
    }

    const closestBlockId = findClosestBlock(event.clientY);

    if (closestBlockId) {
      setTimeout(() => {
        focusBlockAtEnd(closestBlockId);
      }, 0);
    }
  };

  return {
    handleEnterKey,
    handleDeleteBlock,
    handleContainerClick,
  };
};
