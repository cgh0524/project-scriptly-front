import { useEffect, useRef, useState } from 'react';

import { parseHtmlToBlocks } from '../lib/htmlParser';
import type { Block } from '../types/block.types';

interface UseMarkdownBlocksProps {
  content: string;
  containerRef: React.RefObject<HTMLElement>;
}

/**
 * 블록 상태 관리 훅
 */
export const useBlockState = ({ content, containerRef }: UseMarkdownBlocksProps) => {
  const [blocks, setBlocks] = useState<Block[]>(() => parseHtmlToBlocks(content));

  // 블록을 업데이트 해야하는지 판단하는 플래그
  // 사용자가 블록 내에서 입력하는 경우, 업데이트 X
  // 외부 (Component Props)에서 변경하는 경우, 업데이트 O
  const sholudSkipUpdateBlocks = useRef(false);

  useEffect(() => {
    // 내부에서 변경한 경우 스킵
    if (sholudSkipUpdateBlocks.current) {
      sholudSkipUpdateBlocks.current = false;
      return;
    }

    if (!containerRef.current) return;

    // 사용자 입력 중이면 업데이트 안함
    const focusedElement = document.activeElement;
    const isFocusedInEditor = containerRef.current.contains(focusedElement);

    if (isFocusedInEditor) {
      return;
    }

    const newBlocks = parseHtmlToBlocks(content);
    setBlocks(newBlocks);
  }, [content, containerRef]);

  /**
   * 내부 변경 플래그 설정 (외부 content 변경으로 인한 업데이트 방지)
   */
  const skipUpdateBlocks = () => {
    sholudSkipUpdateBlocks.current = true;
  };

  return {
    blocks,
    setBlocks,
    skipUpdateBlocks,
  };
};
