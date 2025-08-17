/**
 * 노션 스타일 블록 기반 마크다운 파서
 */

interface MarkdownPattern {
  name: string;
  pattern: RegExp;
  trigger: string;
  transform: (match: RegExpMatchArray) => { tagName: string; content: string };
}

// 마크다운 패턴 정의
const PATTERNS: MarkdownPattern[] = [
  {
    name: 'heading',
    pattern: /^(#{1,6})\s*(.*)$/,
    trigger: ' ',
    transform: (match) => {
      const [, hashes, content] = match;
      const level = hashes.length;
      return {
        tagName: `h${level}`,
        content: content.trim(),
      };
    },
  },
  // @TODO 추가할 패턴들:
  // {
  //   name: 'unordered-list',
  //   pattern: /^[-*+]\s+(.*)$/,
  //   trigger: ' ',
  //   transform: (match) => ({
  //     tagName: 'ul',
  //     content: match[1].trim()
  //   })
  // },
  // {
  //   name: 'blockquote',
  //   pattern: /^>\s+(.*)$/,
  //   trigger: ' ',
  //   transform: (match) => ({
  //     tagName: 'blockquote',
  //     content: match[1].trim()
  //   })
  // }
];

/**
 * 스페이스 키 트리거로 마크다운 패턴 감지
 */
export const detectMarkdownPattern = (
  text: string,
  trigger: string = ' ',
): {
  type: string;
  tagName: string;
  content: string;
} | null => {
  for (const pattern of PATTERNS) {
    if (pattern.trigger !== trigger) continue;

    const match = text.match(pattern.pattern);

    if (match) {
      const result = pattern.transform(match);
      return {
        type: pattern.name,
        ...result,
      };
    }
  }

  return null;
};

/**
 * 텍스트가 마크다운 트리거 패턴인지 확인
 */
export const isMarkdownTrigger = (text: string): boolean => {
  return PATTERNS.some((pattern) => pattern.pattern.test(text));
};
