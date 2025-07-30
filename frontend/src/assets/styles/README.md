# 스타일 구조 가이드

## 📁 파일 구조

```
src/assets/styles/
├── index.css          # 메인 스타일 진입점
├── base.css           # 기본 스타일 (타이포그래피, 버튼, 링크 등)
├── editor.css         # 에디터 관련 스타일
├── blocks.css         # 블록 컴포넌트 스타일
├── components.css     # 공통 컴포넌트 스타일
└── README.md          # 이 파일
```

## 🎨 스타일 가이드라인

### 1. CSS 구조
- **모듈화**: 기능별로 파일을 분리
- **일관성**: 동일한 패턴과 네이밍 컨벤션 사용
- **재사용성**: 공통 클래스와 유틸리티 클래스 활용

### 2. 네이밍 컨벤션
- **BEM 방식**: `.block__element--modifier`
- **케밥 케이스**: `block-wrapper`, `editor-header`
- **의미있는 이름**: 기능을 명확히 표현

### 3. 색상 시스템
```css
/* Primary Colors */
--blue-500: #3b82f6;
--blue-600: #2563eb;
--blue-700: #1d4ed8;

/* Success Colors */
--green-500: #22c55e;
--green-600: #16a34a;

/* Warning Colors */
--yellow-500: #f59e0b;
--yellow-600: #d97706;

/* Gray Colors */
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;
```

## 🧩 컴포넌트 스타일

### 블록 컴포넌트
- `.block-wrapper`: 블록 컨테이너
- `.block-content`: 블록 내용
- `.block-outline`: 외곽선 효과
- `.block-type-badge`: 타입 배지

### 에디터 컴포넌트
- `.editor-page`: 페이지 레이아웃
- `.editor-container`: 에디터 컨테이너
- `.editor-header`: 헤더 섹션
- `.editor-content`: 콘텐츠 영역

### 공통 컴포넌트
- `.btn`: 버튼 기본 스타일
- `.form-input`: 입력 필드
- `.card`: 카드 컴포넌트
- `.badge`: 배지 컴포넌트

## 📱 반응형 디자인

### 브레이크포인트
```css
/* 모바일 */
@media (max-width: 768px) { ... }

/* 태블릿 */
@media (min-width: 769px) and (max-width: 1024px) { ... }

/* 데스크톱 */
@media (min-width: 1025px) { ... }
```

### 유틸리티 클래스
- `.text-sm`, `.text-lg`: 텍스트 크기
- `.mb-1`, `.mb-2`, `.mb-4`: 마진
- `.p-1`, `.p-2`, `.p-4`: 패딩
- `.flex`, `.flex-col`: 플렉스박스
- `.gap-1`, `.gap-2`, `.gap-4`: 간격

## 🎯 사용 예시

### 새로운 블록 타입 추가
```css
/* blocks.css에 추가 */
.new-block .block-outline {
  border-color: rgba(168, 85, 247, 0.2);
}

.new-block:hover .block-outline {
  border-color: rgba(168, 85, 247, 0.4);
}

.new-block .block-type-badge {
  background: linear-gradient(135deg, #a855f7, #9333ea);
}
```

### 새로운 컴포넌트 추가
```css
/* components.css에 추가 */
.new-component {
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
```

## 🔧 유지보수

### 스타일 추가 시
1. 적절한 파일에 스타일 추가
2. 일관된 네이밍 컨벤션 사용
3. 반응형 디자인 고려
4. 문서 업데이트

### 스타일 수정 시
1. 기존 스타일과의 호환성 확인
2. 다른 컴포넌트에 영향 없는지 테스트
3. 변경사항 문서화

## 📚 참고 자료

- [Tailwind CSS](https://tailwindcss.com/)
- [CSS Grid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)
- [Flexbox](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) 