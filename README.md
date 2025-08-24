# Scriptly - 블록 기반 마크다운 에디터

> 실무 경험을 바탕으로 프론트엔드 특화 아키텍처를 학습하고 적용한 메모 도구

🔗 **Live Demo**: [배포 링크](https://cgh0524.github.io/project-scriptly-front)

## 🚀 주요 성취

### 핵심 성과

- **아키텍처 개선**: 클린 아키텍처의 한계를 분석하고 FSD 아키텍처 학습 적용
- **확장 가능한 설계**: Repository 패턴으로 IndexedDB → REST API 마이그레이션 대비
- **커스텀 에디터**: Selection API 활용한 블록 기반 실시간 마크다운 렌더링

## 🏗️ 아키텍처 선택 과정

### 클린 아키텍처의 프론트엔드 적용 한계점 인식

**1. 프론트엔드 환경에서의 변경 패턴 불일치**
- 클린 아키텍처는 **외부 기술 변경으로부터 비즈니스 로직 보호**를 목표로 설계 <-> 프론트엔드에서는 UI 요구사항과 사용자 경험이 더 자주 변경
- UseCase 레이어에서의 과도한 검증 로직이 오히려 개발 복잡성 증가 및 보일러 플레이트 증가
  - 백엔드: 도메인 규칙 검증이 핵심 (DB 무결성 보장)
  - 프론트엔드: 서버 API가 이미 검증을 담당, 클라이언트는 UI 중심 에러 처리가 자연스러움 (현재 실무에서도 결국 useCase레이어 삭제)
```typescript
// 클린 아키텍처 - 불필요한 검증과 의존성
export class FavoriteRouteUseCase {
  constructor(
    private userRepo: UserRepository,    // 프론트엔드에서는 불필요
    private routeRepo: RouteRepository,  // 이미 화면에 보이는 데이터
    private favoriteRepo: FavoriteRepository
  ) {}
}

// FSD - 서버 검증에 위임하여 간소화
import { favoriteApi } from 'entities/favorite'
export const useBookmark = () => {
  const addBookmark = (routeId: string) => favoriteApi.add(routeId)
}
```
**2. UI 컴포넌트 설계 가이드라인 부재**
- 비즈니스 로직은 체계화되지만 UI 레이어의 구조화 기준 부족
- 거대 컴포넌트와 로직 강결합 문제가 Presentation 레이어에서 반복 발생
- UI Layer에 대해서도 비즈니스 도메인 중심의 폴더 구조가 적용되어 기능이 많아질수록 코드 위치 파악 어려움

### Feature Sliced Design 선택 근거
- 프론트엔드 특화 설계: 도메인부터 UI까지 프로젝트 전반의 통일된 구조 제공
- 기능 중심 응집도: 사용자 관점의 기능별로 코드를 그룹화하여 높은 응집도 확보
- 순환 참조 방지: 계층적 의존성 규칙으로 아키텍처 안정성 보장

### 도입 후 느낀점

**장점**
- 개발 효율성
  - 기능 중심 폴더링으로 코드 위치 직관적 파악. (추후 기능이 복잡해지고, 코드가 많아져도 코드 위치 파악이 빨라질 것으로 기대)
  - 직접 import로 보일러플레이트 최소화
    - 의존성 주입이 없는 것처럼 보이지만 feature => Container, entity => Presenter의 역할로 책임이 분리되어 테스트 용이)
```
// 클린 아키텍처 - 기술적 레이어 분리 (프론트엔드 컴포넌트와는 동떨어진 기준)
domain/usecases/user/AddFavoriteRoute.ts
domain/usecases/route/GetRouteDetail.ts

// FSD - 기능별 응집된 컴포넌트 설계 기준
features/
├── route-bookmark/    # 즐겨찾기 관련 모든 것
├── route-search/      # 검색 관련 모든 것
└── route-filter/      # 필터 관련 모든 것
```
    
- 기능별 독립적 관리
  - 메모 추가 기능 작업 시,  `features/memo`폴더 내에서만 작업 진행 (같은 화면이어도 병렬 작업 가능)
 
- 확장성
  - 기능을 추가하더라도, features내에서 기능 단위로 작업이 이루어지고, 페이지에서는 기능들을 조합하는 수준에서의 변경이 이루어질 것으로 기대


**단점**
- 학습 장벽
  - 클린 아키텍처와 마찬가지로 적용하기 위한 학습 곡선이 존재
  - 어떤 폴더에 어떤 코드가 들어가는게 옳은지 감을 잡지 못해 오랜 시간 고민함 (초기 생산성 저하)
 
### 핵심 인사이트
- 아키텍처 선택은 변경 패턴과 일치해야 함: 프론트엔드에서는 UI 중심의 변경이 많아 FSD가 더 적합
- 도메인 분할 기준은 동일: 클린 아키텍처든 FSD든 적절한 도메인 경계 설정이 핵심
- 실용성과 원칙의 균형: 순수한 이론보다는 팀과 프로젝트 상황에 맞는 하이브리드 접근이 효과적 (현재 프로젝트에서 데이터 레이어 추상화를 위해 Repository 패턴 사용 유지)

**개선 방향**
- 페이지를 순수 조합 컴포넌트로 분리
- 비즈니스 로직을 features/memo-edit/model 레이어로 이관
- UI 계층의 역할 분리로 FSD 원칙 완전 준수


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
