import dayjs from 'dayjs';
import { useCallback, useEffect, useRef, useState } from 'react';

import { EditableBlock } from './EditableBlock';
import * as S from './MarkdownEditor.styles';

interface MarkdownEditorProps {
  content: string;
  onChangeContent: (content: string) => void;
}

export interface Block {
  id: string;
  tagName: string;
  innerHTML: string;
}

const parseHtmlToBlocks = (htmlString: string): Block[] => {
  const blockCreatedMillis = dayjs().valueOf();

  if (!htmlString.trim()) {
    return [{ id: `block-${blockCreatedMillis}`, tagName: 'p', innerHTML: '' }];
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const elements = Array.from(doc.body.children);

  if (elements.length === 0) {
    return [{ id: `block-${blockCreatedMillis}`, tagName: 'p', innerHTML: htmlString }];
  }

  return elements.map((element, index) => ({
    id: `block-${blockCreatedMillis}-${index}`,
    tagName: element.tagName.toLowerCase(),
    innerHTML: element.innerHTML,
  }));
};

const blocksToHtml = (blocks: Block[]): string => {
  return blocks.map((block) => `<${block.tagName}>${block.innerHTML}</${block.tagName}>`).join('');
};

export const MarkdownEditor = ({ content, onChangeContent }: MarkdownEditorProps) => {
  const [blocks, setBlocks] = useState<Block[]>(() => parseHtmlToBlocks(content));
  const containerRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);
  const lastEnterTime = useRef<number>(0);

  const handleBlockChange = (blockId: string, newInnerHTML: string) => {
    const updatedBlocks = blocks.map((block) =>
      block.id === blockId ? { ...block, innerHTML: newInnerHTML } : block,
    );
    setBlocks(updatedBlocks);

    isInternalChange.current = true;
    onChangeContent(blocksToHtml(updatedBlocks));
  };

  const handleEnterKey = useCallback((blockId: string) => {
    const now = Date.now();
    if (now - lastEnterTime.current < 50) {
      return; // 50ms 내 중복 실행 방지
    }
    lastEnterTime.current = now;

    const blockCreatedMillis = dayjs().valueOf();
    const blockIndex = blocks.findIndex((block) => block.id === blockId);
    const newBlock: Block = {
      id: `block-${blockCreatedMillis}`,
      tagName: 'p',
      innerHTML: '',
    };

    const updatedBlocks = [
      ...blocks.slice(0, blockIndex + 1),
      newBlock,
      ...blocks.slice(blockIndex + 1),
    ];

    setBlocks(updatedBlocks);

    isInternalChange.current = true;
    onChangeContent(blocksToHtml(updatedBlocks));

    // 새 블록으로 포커스 이동
    setTimeout(() => {
      const newBlockElement = document.querySelector(
        `[data-block-id="${newBlock.id}"]`,
      ) as HTMLElement;

      if (!newBlockElement) return;
      newBlockElement.focus();
    }, 0);
  }, [blocks, onChangeContent]);

  const handleDeleteBlock = (blockId: string) => {
    // 블록이 하나만 남았다면 삭제하지 않음
    if (blocks.length <= 1) return;

    const blockIndex = blocks.findIndex((block) => block.id === blockId);

    // 삭제 전에 이전 블록 id 미리 저장
    const prevBlockIndex = Math.max(0, blockIndex - 1);
    const prevBlockId = blocks[prevBlockIndex]?.id;

    const updatedBlocks = blocks.filter((block) => block.id !== blockId);

    setBlocks(updatedBlocks);

    isInternalChange.current = true;
    onChangeContent(blocksToHtml(updatedBlocks));

    // 이전 블록으로 포커스 이동
    setTimeout(() => {
      if (prevBlockId) {
        const prevBlockElement = document.querySelector(
          `[data-block-id="${prevBlockId}"]`,
        ) as HTMLElement;

        if (prevBlockElement) {
          prevBlockElement.focus();
          // 커서를 블록 끝으로 이동
          const range = document.createRange();
          const selection = window.getSelection();
          range.selectNodeContents(prevBlockElement);
          range.collapse(false);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      }
    }, 0);
  };

  useEffect(() => {
    // 내부에서 변경한 경우 스킵
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }

    if (!containerRef.current) return;

    // 현재 포커스가 있는 블록 확인
    const focusedElement = document.activeElement;
    const isFocusedInEditor = containerRef.current.contains(focusedElement);

    if (isFocusedInEditor) {
      return; // 사용자 입력 중이면 업데이트 안함
    }

    const newBlocks = parseHtmlToBlocks(content);
    setBlocks(newBlocks);
  }, [content]);

  return (
    <S.MarkdownEditor ref={containerRef}>
      {blocks.map((block) => (
        <EditableBlock
          key={block.id}
          block={block}
          onChange={handleBlockChange}
          onEnterKey={handleEnterKey}
          onDelete={handleDeleteBlock}
        />
      ))}
    </S.MarkdownEditor>
  );
};
