import dayjs from 'dayjs';

import { blocksToHtml } from '../lib/htmlParser';
import type { Block } from '../types/block';

interface UseBlockOperationsProps {
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  skipUpdateBlocks: () => void;
  onChangeContent: (content: string) => void;
}

/**
 * 블록 CRUD 작업 관리 훅
 */
export const useBlockOperations = ({
  blocks,
  setBlocks,
  skipUpdateBlocks,
  onChangeContent,
}: UseBlockOperationsProps) => {
  const updateContent = (updatedBlocks: Block[]) => {
    skipUpdateBlocks();
    onChangeContent(blocksToHtml(updatedBlocks));
  };

  const createNewBlock = (): Block => {
    const blockCreatedMillis = dayjs().valueOf();
    return {
      id: `block-${blockCreatedMillis}`,
      tagName: 'p',
      innerHTML: '',
    };
  };

  const addBlock = (afterBlockId: string) => {
    const blockIndex = blocks.findIndex((block) => block.id === afterBlockId);
    const newBlock = createNewBlock();

    const updatedBlocks = [
      ...blocks.slice(0, blockIndex + 1),
      newBlock,
      ...blocks.slice(blockIndex + 1),
    ];

    setBlocks(updatedBlocks);
    updateContent(updatedBlocks);

    return newBlock;
  };

  const deleteBlock = (blockId: string): string | null => {
    // 블록이 하나만 남았다면 삭제하지 않음
    if (blocks.length <= 1) return null;

    const blockIndex = blocks.findIndex((block) => block.id === blockId);
    const prevBlockIndex = Math.max(0, blockIndex - 1);
    const prevBlockId = blocks[prevBlockIndex]?.id;

    const updatedBlocks = blocks.filter((block) => block.id !== blockId);

    setBlocks(updatedBlocks);
    updateContent(updatedBlocks);

    return prevBlockId;
  };

  return {
    addBlock,
    deleteBlock,
  };
};
