# Scriptly

마크다운 기반 메모작성 툴

## 📋 목차

- [프로젝트 개요](#-프로젝트-개요)
- [기술 스택 및 아키텍처](#-기술-스택-및-아키텍처)
- [아키텍처 선택 배경](#-아키텍처-선택-배경)
- [폴더 구조](#-폴더-구조)
- [개발 로드맵](#-개발-로드맵)
- [커밋 컨벤션](#-커밋-컨벤션)
- [현재 상황](#-현재-상황)
- [📊 현재 진행상황 →](./.docs/PROGRESS.md)
- [🎯 개발 인사이트 →](./.docs/INSIGHTS.md)

<br>

## 🚀 프로젝트 개요

Scriptly는 마크다운 기반의 직관적인 메모 작성 도구입니다. 개인 메모부터 팀 협업까지 지원하는 것을 목표로 하며, MVP 방식으로 단계적으로 개발됩니다.

**핵심 목표:**

- **기술 역량 강화**: React, TypeScript, FSD 아키텍처 등 프론트엔드 기술 스택 학습
- **점진적 성장**: 각 Phase별로 새로운 기술 도전 (IndexedDB → Backend → 실시간 협업)
- **실용적 결과물**: 실제 사용 가능한 수준의 메모 도구 완성

<br>

## 🛠 기술 스택 및 아키텍처

### Frontend

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: styled-components
- **Routing**: React Router
- **Local Storage**: IndexedDB
- **Architecture**: Feature-Sliced Design (FSD)

### 향후 확장 예정

- **Backend**: Node.js + NestJS (Phase 2)
- **Database**: PostgreSQL (Phase 2)
- **Real-time**: WebSocket (Phase 3)
- **PWA**: Service Worker (Phase 4)

<br>

## 🎯 아키텍처 선택 배경

프론트엔드 실무에서 클린 아키텍처 적용을 시도하는 과정에서 다음과 같은 한계를 경험했습니다

### 🚨 클린 아키텍처의 프론트엔드 적용 한계

- **설계 철학의 불일치**: 클린 아키텍처는 외부 의존성으로부터 도메인을 보호하는 것이 핵심이지만, 실무에서는 도메인 변경이 더 빈번하고 프론트엔드 프레임워크는 한번 선택되면 변경될 일이 거의 없음
- **보일러플레이트 과다**: UI 코드 비중이 높은 프론트엔드에서 도메인 관리를 위한 다층 레이어 구조로 인해 과도한 보일러플레이트 코드 발생
- **UI Layer 설계 기준 부재**: 프론트엔드 특화된 UI/UX 설계 가이드라인 부재
- **도메인 경계의 모호함**: 프론트엔드 기능과 UI는 비즈니스 도메인으로 명확하게 떨어지지 않음

### ✅ FSD 도입으로 기대되는 개선점

- **변경 격리**: 도메인 변경이 Features에서 멈춰 상위 레이어(Widgets, Pages) 보호
- **기능별 응집**: 기존 코드 보호하며 새로운 Features를 조립식으로 추가 가능
- **UI 재사용성**: shared/ui로 공통 컴포넌트 분리, entities에서 도메인별 데이터만 관리
- **점진적 확장**: 레고 블록처럼 필요한 기능만 선택적 조합 가능

> 💡 **Note**: Repository, Parser 등의 보일러플레이트는 어느 아키텍처든 불가피하지만, FSD는 이런 변경이 전체 시스템에 미치는 영향을 최소화합니다.

<br>

## 📁 폴더 구조

> 💡 **참고**: 아래는 FSD 아키텍처의 주요 레이어 구조와 대표적인 예시입니다. 개발 진행에 따라 slice와 segment가 추가됩니다.

```
src/
├── app/                    # 앱 초기화, 전역 설정, 라우터
│   ├── providers/          # (예시) Context Provider들
│   └── styles/             # (예시) 전역 스타일
├── pages/                  # 페이지 레벨 라우팅 컴포넌트
│   ├── home/               # (예시) 홈 페이지
│   └── editor/             # (예시) 에디터 페이지
├── widgets/                # 독립적인 UI 블록 (여러 feature 조합)
│   ├── header/             # (예시) 헤더 위젯
│   └── sidebar/            # (예시) 사이드바 위젯
├── features/               # 비즈니스 기능 단위
│   ├── memo-create/        # (예시) 메모 생성 기능
│   └── markdown-parse/     # (예시) 마크다운 파싱 기능
├── entities/               # 비즈니스 엔티티 (도메인 모델)
│   └── memo/               # (예시) 메모 엔티티
│       ├── model/          # 타입 정의, 상태 관리
│       ├── api/            # API 통신 로직
│       └── ui/             # 엔티티 관련 UI 컴포넌트
└── shared/                 # 재사용 가능한 공통 코드
    ├── ui/                 # 공통 UI 컴포넌트
    ├── lib/                # 유틸리티, 헬퍼 함수
    ├── api/                # API 설정, 인터셉터
    └── config/             # 환경 설정
```

<br>

## 🗺 개발 로드맵

### Phase 1: Frontend MVP

**목표**: 로컬 기반 마크다운 에디터 완성

- 마크다운 텍스트 에디터 및 실시간 프리뷰
- IndexedDB 기반 로컬 저장
- 문서 리스트 관리 (테이블 형태)
- 기본 CRUD 기능

### Phase 2: Backend Integration

**목표**: 서버 연동 및 데이터 동기화

- REST API 서버 구현
- 사용자 인증 시스템
- 로컬-서버 데이터 동기화
- 오프라인 지원

### Phase 3: Collaboration Features

**목표**: 실시간 협업 기능

- WebSocket 기반 실시간 편집
- 메모 공유 및 권한 관리
- 버전 히스토리

### Phase 4: PWA (선택)

**목표**: 네이티브 앱 수준의 사용자 경험

- Service Worker 구현
- 오프라인 작동
- 푸시 알림

<br>

## 📝 커밋 컨벤션

- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `sanitize`: 불필요한 코드 제거 (기능 변화 없음)
- `refactor`: 코드 개선 (기능 변화 없음)
- `style`: 코드 스타일 변경 (포맷팅, 세미콜론 등)
- `chore`: 설정 파일, 도구 관련 변경
- `docs`: 문서 변경

<br>

## 📊 현재 상황

**진행 Phase**: Phase 1 - Frontend MVP  
**현재 진행 단계**: 마크다운 파싱 엔진 구현

<br>

상세한 진행상황은 [📊 PROGRESS.md](./.docs/PROGRESS.md)에서 확인하세요.

## ⚡ Quick Start

```bash
# 프로젝트 클론
git clone [repository-url]

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

> 💡 **Note**: 이 프로젝트는 FSD 아키텍처 학습 및 포트폴리오 목적으로 개발되고 있습니다.
