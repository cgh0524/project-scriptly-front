/**
 * 마크다운 텍스트를 HTML로 변환하는 파서
 */

// 헤딩 (h1 ~ h6)
const parseHeading = (text: string): string => {
  return text.replace(/^(#{1,6})\s+(.+)$/gm, (_, hashes, content) => {
    const level = hashes.length;
    return `<h${level}>${content.trim()}</h${level}>`;
  });
};

// 강조 (bold, italic)
const parseEmphasis = (text: string): string => {
  // Bold (**text** or __text__)
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Italic (*text* or _text_)
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
  text = text.replace(/_(.+?)_/g, '<em>$1</em>');

  return text;
};

// 목록 (ul, ol)
const parseList = (text: string): string => {
  // 순서 없는 목록 (-, *, +)
  text = text.replace(/^[\s]*[-*+]\s+(.+)$/gm, '<li>$1</li>');

  // 순서 있는 목록 (1. 2. 3.)
  text = text.replace(/^[\s]*\d+\.\s+(.+)$/gm, '<li>$1</li>');

  // li 태그들을 ul로 감싸기
  text = text.replace(/(<li>.*<\/li>)/s, (match) => {
    const items = match.match(/<li>.*?<\/li>/g);
    if (!items) return match;

    // 연속된 li들을 ul로 감싸기
    return `<ul>${items.join('')}</ul>`;
  });

  return text;
};

// 링크 [text](url)
const parseLink = (text: string): string => {
  return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
};

// 이미지 ![alt](src)
const parseImage = (text: string): string => {
  return text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');
};

// 인라인 코드 `code`
const parseInlineCode = (text: string): string => {
  return text.replace(/`([^`]+)`/g, '<code>$1</code>');
};

// 코드 블록 ```code```
const parseCodeBlock = (text: string): string => {
  return text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
};

// 인용문 > text
const parseBlockquote = (text: string): string => {
  return text.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');
};

// 수평선 --- or ***
const parseHorizontalRule = (text: string): string => {
  return text.replace(/^(---+|\*\*\*+)$/gm, '<hr />');
};

// 테이블
const parseTable = (text: string): string => {
  const tableRegex = /^\|(.+)\|\s*\n\|([:\-\s|]+)\|\s*\n((?:\|.+\|\s*\n?)*)/gm;

  return text.replace(tableRegex, (_, header: string, _separator: string, rows: string) => {
    const headerCells = header
      .split('|')
      .map((cell: string) => `<th>${cell.trim()}</th>`)
      .join('');
    const bodyRows = rows
      .trim()
      .split('\n')
      .map((row: string) => {
        const cells = row
          .split('|')
          .slice(1, -1)
          .map((cell: string) => `<td>${cell.trim()}</td>`)
          .join('');
        return `<tr>${cells}</tr>`;
      })
      .join('');

    return `<table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`;
  });
};

// 줄바꿈 (두 개의 스페이스 + 엔터)
const parseLineBreak = (text: string): string => {
  return text.replace(/ {2}\n/g, '<br />');
};

// 단락 (빈 줄로 구분된 텍스트)
const parseParagraph = (text: string): string => {
  // 이미 HTML 태그가 있는 줄은 제외하고 p 태그로 감싸기
  return text.replace(/^(?!<[h1-6|ul|ol|blockquote|pre|hr|table].*>)(.+)$/gm, (match, content) => {
    if (content.trim() === '') return match;
    if (content.includes('<')) return match; // 이미 HTML 태그가 있으면 제외
    return `<p>${content}</p>`;
  });
};

/**
 * 마크다운 텍스트를 HTML로 변환
 */
export const parseMarkdown = (markdown: string): string => {
  if (!markdown) return '';

  let html = markdown;

  // 파싱 순서가 중요 (코드 블록 먼저, 단락은 마지막)
  html = parseCodeBlock(html);
  html = parseInlineCode(html);
  html = parseHeading(html);
  html = parseTable(html);
  html = parseList(html);
  html = parseBlockquote(html);
  html = parseHorizontalRule(html);
  html = parseImage(html);
  html = parseLink(html);
  html = parseEmphasis(html);
  html = parseLineBreak(html);
  html = parseParagraph(html);

  return html;
};
