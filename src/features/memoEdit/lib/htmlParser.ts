import dayjs from 'dayjs';

import type { Block } from '../types/block';
import { parseMarkdown } from './parseMarkdown';

/**
 * HTML 문자열을 Block 배열로 변환
 */
export const parseHtmlToBlocks = (htmlString: string): Block[] => {
  const CURRENT_TIME_MILLIS = dayjs().valueOf();

  // 빈 문자열인 경우 기본 p 태그 블록 반환
  if (!htmlString.trim()) {
    return [{ id: `block-${CURRENT_TIME_MILLIS}`, tagName: 'p', innerHTML: '' }];
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const elements = Array.from(doc.body.children);

  // HTML 요소가 없는 경우 텍스트를 p 태그로 감싸서 반환
  if (elements.length === 0) {
    return [{ id: `block-${CURRENT_TIME_MILLIS}`, tagName: 'p', innerHTML: htmlString }];
  }

  return elements.map((element, index) => ({
    id: `block-${CURRENT_TIME_MILLIS}-${index}`,
    tagName: element.tagName.toLowerCase(),
    innerHTML: element.innerHTML,
  }));
};

/**
 * Block 배열을 HTML 문자열로 변환
 */
export const blocksToHtml = (blocks: Block[]): string => {
  return blocks.map((block) => `<${block.tagName}>${block.innerHTML}</${block.tagName}>`).join('');
};

/**
 * Block 배열을 마크다운 문자열로 변환
 */
export const blocksToMarkdown = (blocks: Block[]): string => {
  return blocks.map((block) => parseMarkdown(block.innerHTML)).join('');
};
