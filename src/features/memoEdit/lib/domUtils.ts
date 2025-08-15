/**
 * 특정 블록에 포커스 설정
 */
export const focusBlock = (blockId: string): void => {
  const blockElement = document.querySelector(`[data-block-id="${blockId}"]`) as HTMLElement;
  if (blockElement) {
    blockElement.focus();
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