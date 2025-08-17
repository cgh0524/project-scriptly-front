// 현재 커서 위치의 Range 객체 반환
export const getCurrentCursorRange = (): Range | null => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  return selection.getRangeAt(0);
};

// 커서 위치의 좌표 반환
export const getCursorBoundingClientRect = (): DOMRect | null => {
  const range = getCurrentCursorRange();
  if (!range) return null;
  return range.getBoundingClientRect();
};

// 첫 번째 문자의 좌표 반환
export const getFirstCharBoundingClientRect = (element: HTMLElement): DOMRect | null => {
  const range = document.createRange();
  const firstTextNode = getFirstTextNode(element);
  if (!firstTextNode) return null;

  range.setStart(firstTextNode, 0);
  range.setEnd(firstTextNode, 1);
  return range.getBoundingClientRect();
};

// cursor offset 반환
export const getCursorOffset = (element: HTMLElement): number => {
  const cursorRange = getCurrentCursorRange();
  if (!cursorRange) return 0;

  let offset = 0;
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);

  let node = walker.nextNode();
  while (node) {
    // 커서가 있는 텍스트 노드인 경우,
    if (node === cursorRange.startContainer) {
      return (offset += cursorRange.startOffset);
    }

    offset += node.textContent?.length || 0;
    node = walker.nextNode();
  }

  return offset;
};

// 마지막 문자의 좌표 반환
export const getLastCharBoundingClientRect = (element: HTMLElement): DOMRect | null => {
  const range = document.createRange();
  const lastTextNode = getLastTextNode(element);
  if (!lastTextNode) return null;

  const textLength = lastTextNode.textContent?.length || 0;
  range.setStart(lastTextNode, Math.max(0, textLength - 1));
  range.setEnd(lastTextNode, textLength);
  return range.getBoundingClientRect();
};

// 첫 번째 텍스트 노드 찾기
const getFirstTextNode = (element: HTMLElement): Text | null => {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
  return walker.nextNode() as Text | null;
};

// 마지막 텍스트 노드 찾기
const getLastTextNode = (element: HTMLElement): Text | null => {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);

  let lastNode: Text | null = null;
  let node = walker.nextNode();
  while (node) {
    lastNode = node as Text;
    node = walker.nextNode();
  }
  return lastNode;
};

// 커서 위치 비교 허용 범위
const TOLERANCE = 2;

// 커서가 첫 번째 줄에 있는지 확인
export const isFirstLine = (element: HTMLElement): boolean => {
  const firstCharRect = getFirstCharBoundingClientRect(element);
  if (!firstCharRect) return true;

  const cursorRect = getCursorBoundingClientRect();
  if (!cursorRect) return false;

  return Math.abs(cursorRect.top - firstCharRect.top) <= TOLERANCE;
};

// 커서가 마지막 줄에 있는지 확인
export const isLastLine = (element: HTMLElement): boolean => {
  const lastCharRect = getLastCharBoundingClientRect(element);
  if (!lastCharRect) return true;

  const cursorRect = getCursorBoundingClientRect();
  if (!cursorRect) return false;

  return Math.abs(cursorRect.top - lastCharRect.top) <= TOLERANCE;
};
