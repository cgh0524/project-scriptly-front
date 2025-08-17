const BLOCK_ID_ATTRIBUTE = 'data-block-id';

/**
 * 특정 블록에 포커스 설정
 */
export const focusBlock = (blockId: string, cursorOffset?: number): void => {
  const blockElement = getBlockElement(blockId);

  if (!blockElement) return;
  blockElement.focus();

  if (cursorOffset === undefined) return;

  // 커서 위치 복원
  const selection = window.getSelection();
  const range = document.createRange();

  const textNode = blockElement.firstChild;
  if (textNode && textNode.nodeType === Node.TEXT_NODE) {
    const maxOffset = Math.min(cursorOffset, textNode.textContent?.length || 0);
    range.setStart(textNode, maxOffset);
    range.setEnd(textNode, maxOffset);

    selection?.removeAllRanges();
    selection?.addRange(range);
  }
};

/**
 * 특정 블록에 포커스 설정하고 커서를 끝으로 이동
 */
export const focusBlockAtEnd = (blockId: string): void => {
  const blockElement = getBlockElement(blockId);
  if (blockElement) {
    blockElement.focus();

    const range = document.createRange();
    const selection = window.getSelection();

    // 블록 엘리먼트의 모든 내용을 선택 범위로 설정
    range.selectNodeContents(blockElement);

    // 선택 범위를 끝 위치로 축소 (false = 끝으로 축소)
    range.collapse(false);

    //기존 선택 범위 제거 후 새로운 범위 적용
    selection?.removeAllRanges();
    selection?.addRange(range);
  }
};

/**
 * 클릭 위치와 가장 가까운 블록 찾기
 */
export const findClosestBlock = (clickY: number): string | null => {
  const blocks = getAllBlockElements();
  if (blocks.length === 0) return null;

  let closestBlock: HTMLElement | null = null;
  let closestDistance = Infinity;

  blocks.forEach((block) => {
    const rect = block.getBoundingClientRect();
    const blockCenterY = rect.top + rect.height / 2;
    const distance = Math.abs(clickY - blockCenterY);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestBlock = block;
    }
  });

  if (!closestBlock) return null;

  return (closestBlock as HTMLElement).getAttribute(BLOCK_ID_ATTRIBUTE) ?? null;
};

/**
 * 특정 블록의 텍스트 내용 반환
 */
export const getBlockTextContent = (blockId: string): string => {
  const blockElement = getBlockElement(blockId);
  if (!blockElement) return '';
  return blockElement.textContent || '';
};

/**
 * 특정 블록 엘리먼트 반환
 */
export const getBlockElement = (blockId: string): HTMLElement | null => {
  return document.querySelector(`[${BLOCK_ID_ATTRIBUTE}="${blockId}"]`);
};

/**
 * 모든 블록 엘리먼트 반환
 */
export const getAllBlockElements = (): HTMLElement[] => {
  return Array.from(document.querySelectorAll(`[${BLOCK_ID_ATTRIBUTE}]`)) as HTMLElement[];
};

/** 블록 id 반환 */
export const getBlockId = (blockElement: HTMLElement): string | null => {
  return blockElement.getAttribute(BLOCK_ID_ATTRIBUTE);
};
