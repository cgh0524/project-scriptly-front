# Scriptly

마크다운 기반 실시간 문서 협업 및 메모 툴

## 📋 프로젝트 소개

## 아키텍처

FSD(Feature Sliced Design)

src/  
├── app/ &nbsp;&nbsp;&nbsp;&nbsp; # 앱 초기화, 라우터, 전역 설정  
├── pages/ &nbsp;&nbsp;&nbsp;&nbsp; # 페이지 컴포넌트  
├── widgets/ &nbsp;&nbsp;&nbsp;&nbsp; # 독립적인 UI 블록  
├── features/ &nbsp;&nbsp;&nbsp;&nbsp; # 비즈니스 기능  
├── entities/ &nbsp;&nbsp;&nbsp;&nbsp; # 비즈니스 엔티티  
├── shared/ &nbsp;&nbsp;&nbsp;&nbsp; # 재사용 가능한 코드  
└── index.tsx

## 커밋 컨벤션

feat: 새로운 기능 추가  
fix: 버그 수정  
refactor: 코드 개선 (기능 변화 없음)  
style: 코드 스타일 변경 (포맷팅, 세미콜론 등)  
chore: 설정 파일, 도구 관련 변경  
docs: 문서 변경
