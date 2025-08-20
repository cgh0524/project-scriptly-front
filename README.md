# Scriptly - 블록 기반 마크다운 에디터

> 실무 경험을 바탕으로 프론트엔드 특화 아키텍처를 학습하고 적용한 메모 도구

🔗 **Live Demo**: [배포 링크](https://cgh0524.github.io/project-scriptly-front)

## 🚀 주요 성취

### 핵심 성과

- **아키텍처 개선**: 클린 아키텍처의 한계를 분석하고 FSD 아키텍처 학습 적용
- **확장 가능한 설계**: Repository 패턴으로 IndexedDB → REST API 마이그레이션 대비
- **커스텀 에디터**: Selection API 활용한 블록 기반 실시간 마크다운 렌더링

## 🏗️ 아키텍처 선택 과정

### 문제 인식: 클린 아키텍처의 프론트엔드 적용 한계

실무에서 클린 아키텍처를 사용하며 경험한 어려움들:

- 실무에서는 외부 기술보다 **내부 비즈니스 로직이 더 자주 변경**
- UI 컴포넌트 설계 기준 부재로 인한 **거대 컴포넌트와 로직 강결합**
- 과도한 추상화로 인한 **개발 복잡성 증가**

### 해결 방안: Feature Sliced Design 도입

**선택 근거**:

- 프론트엔드에 특화된 아키텍처로 UI 계층 체계화
- 기능 중심 구조로 높은 코드 응집도 확보
- 보일러플레이트 최소화로 실용적 개발 환경 구축

**도입 결과**:

- 작업 효율성 향상 (코드 위치 파악 용이)
- 유지보수성 개선 (기능별 독립적 관리)
- 확장성 확보 (MVP → 고도화 자연스러운 전환)

### 실무 적용 인사이트

- **Repository 패턴**: 데이터 추상화의 장점은 유지하되 FSD 구조 내에서 적용
- **기능 중심 폴더링**: "어느 폴더에 넣을까?" 고민 시간 대폭 단축
- **점진적 개발**: MVP부터 복잡한 기능까지 자연스러운 확장 경로 확보

## 💡 핵심 기술 구현

### 1. 확장 가능한 데이터 레이어 설계

**문제**: IndexedDB → REST API 전환 시 비즈니스 로직 변경 최소화 필요

**해결**: Repository 패턴으로 데이터 소스 추상화

```typescript
// 공통 인터페이스 정의
interface MemoRepository {
  findAll(): Promise<Memo[]>;
  findById(id: string): Promise<Memo | null>;
  create(memo: CreateMemoRequest): Promise<Memo>;
  update(id: string, memo: UpdateMemoRequest): Promise<Memo>;
  delete(id: string): Promise<void>;
}

// IndexedDB 구현체
class IdbMemoRepository implements MemoRepository { ... }

// REST API 구현체 (향후 구현)
class HttpMemoRepository implements MemoRepository { ... }

// 싱글톤 패턴으로 일관된 인스턴스 제공
export const memoRepository = new IdbMemoRepository();
```

### 2. 블록 기반 에디터 아키텍처

**문제**: 기존 textarea로는 블록 단위 조작 불가

**해결**: Selection API + 커스텀 블록 시스템

```typescript
// 블록에 포커스 설정 및 커서 위치 제어
export const focusBlock = (blockId: string, cursorOffset?: number): void => {
  const blockElement = getBlockElement(blockId);
  if (!blockElement) return;

  blockElement.focus();

  if (cursorOffset === undefined) return;

  // Selection API로 정확한 커서 위치 설정
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

// 커서 위치에서 HTML을 앞/뒤로 분할 (엔터키 처리용)
export const splitHtmlAtCursor = (element: HTMLElement) => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return { beforeHtml: element.innerHTML || '', afterHtml: '' };
  }

  const range = selection.getRangeAt(0);
  // ... HTML 구조를 유지하며 분할 로직
};
```

### 3. 실시간 마크다운 렌더링

**문제**: 입력과 동시에 마크다운 문법을 시각적으로 렌더링 필요

**해결**: 확장 가능한 패턴 기반 파서 + 스페이스바 트리거

```typescript
// 확장 가능한 마크다운 패턴 정의
interface MarkdownPattern {
  name: string;
  pattern: RegExp;
  trigger: string;
  transform: (match: RegExpMatchArray) => { tagName: string; content: string };
}

const PATTERNS: MarkdownPattern[] = [
  {
    name: 'heading',
    pattern: /^(#{1,6})\s*(.*)$/,
    trigger: ' ',
    transform: (match) => {
      const [, hashes, content] = match;
      const level = hashes.length;
      return { tagName: `h${level}`, content: content.trim() };
    },
  },
  // TODO: 리스트, 인용구 등 추가 패턴 확장 예정
];

// 패턴 감지 함수
export const detectMarkdownPattern = (text: string, trigger: string = ' ') => {
  for (const pattern of PATTERNS) {
    if (pattern.trigger !== trigger) continue;

    const match = text.match(pattern.pattern);
    if (match) {
      const result = pattern.transform(match);
      return { type: pattern.name, ...result };
    }
  }
  return null;
};

// 키보드 이벤트에서 실시간 변환 처리
const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
  if (event.key === ' ') {
    const element = event.currentTarget;
    const text = element.textContent || '';

    const pattern = detectMarkdownPattern(text);
    if (pattern) {
      event.preventDefault();
      const cursorOffset = pattern.content.length;
      onTransform?.(block.id, pattern.tagName, pattern.content, cursorOffset);
    }
  }
};
```

### 4. IndexedDB Promise 래핑

**문제**: IndexedDB의 이벤트 기반 API로 인한 콜백 헬과 복잡한 에러 처리

**해결**: Promise 기반 트랜잭션 래퍼로 비동기 처리 개선

```typescript
// 트랜잭션 헬퍼 함수 - 이벤트를 Promise로 래핑
export async function executeTransaction<T>(
  db: IDBDatabase,
  storeName: string,
  mode: IDBTransactionMode = 'readonly',
  work: (store: IDBObjectStore) => Promise<T | undefined>,
): Promise<T | undefined> {
  const store = db.transaction([storeName], mode).objectStore(storeName);
  const result = await work(store);
  return result;
}

// Repository에서 Promise 패턴 활용
const createMemo = async (memo: CreateMemoRequest): Promise<Memo> => {
  const idbMemo = await executeTransaction<IdbMemo>(db, 'memos', 'readwrite', async (store) => {
    const newIdbMemo = toIdb(memo);

    // 이벤트 기반 API를 Promise로 변환
    await new Promise<void>((resolve, reject) => {
      const req = store.add(newIdbMemo);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    return newIdbMemo;
  });

  if (!idbMemo) {
    throw new Error('Failed to create memo');
  }
  return toDomain(idbMemo);
};
```

## 🚀 주요 기능

### 현재 구현된 기능

- **블록 기반 실시간 마크다운 렌더링**: Heading 문법 지원 (# ~ ######)
- **방향키 네비게이션**: 화살표 키를 통한 직관적인 블록 간 이동
- **Repository 패턴**: IndexedDB 기반 메모 CRUD 구현

### 📈 성능 최적화 및 확장 계획

- **마크다운 문법 확장**: 리스트, 강조 표시 등 인라인 문법 지원
- **가상 스크롤링**: 대량 메모 데이터 최적화
- **REST API 연동**: 백엔드 서버와의 데이터 동기화

## 🛠️ 기술 스택

| 분야                 | 기술                        |
| -------------------- | --------------------------- |
| **Framework**        | React 18 + TypeScript       |
| **Build Tool**       | Vite                        |
| **Styling**          | styled-components           |
| **State Management** | Jotai                       |
| **Local Storage**    | IndexedDB                   |
| **Architecture**     | Feature-Sliced Design (FSD) |

## ⚡ Quick Start

```bash
# 프로젝트 클론
git clone [repository-url]

# 의존성 설치
yarn install

# 개발 서버 실행
yarn dev
```
