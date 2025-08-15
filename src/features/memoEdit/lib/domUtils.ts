/**
 * 특정 블록에 포커스 설정
 */
export const focusBlock = (blockId: string, cursorOffset?: number): void => {
  const blockElement = document.querySelector(`[data-block-id="${blockId}"]`) as HTMLElement;

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
  const blockElement = document.querySelector(`[data-block-id="${blockId}"]`) as HTMLElement;
  if (blockElement) {
    blockElement.focus();
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(blockElement);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);
  }
};

/**
 * 클릭 위치와 가장 가까운 블록 찾기
 */
export const findClosestBlock = (clickY: number): string | null => {
  const blocks = document.querySelectorAll('[data-block-id]') as NodeListOf<HTMLElement>;
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

  return (closestBlock as HTMLElement).getAttribute('data-block-id') ?? null;
};
