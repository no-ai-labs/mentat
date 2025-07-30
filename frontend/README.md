# Mentat Vue - AI 기반 스마트 문서 편집기

Mentat Vue는 AI와 함께하는 스마트 문서 작성 플랫폼입니다. 블록 기반 에디터를 통해 데이터, 프롬프트, 에이전트, 결과를 연결하여 복잡한 워크플로우를 구성할 수 있습니다.

## 🚀 주요 기능

### 📊 DataBlock 기능

다양한 외부 데이터 형식을 업로드하고 관리하는 기능입니다.

#### 🔧 파일 업로드 기능

- **다중 형식 지원**: CSV, TSV, JSON, TXT, XLSX 파일
- **드래그 앤 드롭**: 직관적인 파일 업로드 인터페이스
- **자동 파싱**: 파일 형식 자동 감지 및 파싱
- **진행 상태 표시**: 업로드 및 파싱 진행률 표시

#### 🎯 데이터 관리 기능

- **미리보기**: 파싱된 데이터의 테이블/JSON/텍스트 미리보기
- **텍스트 편집**: 직접 데이터 입력 및 편집
- **데이터 내보내기**: 파싱된 데이터를 JSON 형태로 내보내기
- **메타데이터**: 파일 정보 및 데이터 요약 표시

### 📊 스프레드시트 기능

DataBlock에서 사용할 수 있는 스프레드시트 편집 기능입니다.

#### 🔧 구성 요소

- **SpreadsheetData 인터페이스**: 스프레드시트 데이터 구조 정의
- **LuckysheetRenderer**: Luckysheet 기반 스프레드시트 렌더러

#### 🎯 특징

- **실시간 편집**: 셀 편집 시 자동 데이터 업데이트
- **데이터 구조화**: 표 형태로 데이터를 구조화하여 관리
- **JSON 내보내기**: 스프레드시트 데이터를 JSON 형식으로 내보내기
- **반응형 UI**: 크기 조절 가능한 스프레드시트 뷰

### 🧠 블록 시스템

- **DataBlock** (`/data`): 다양한 파일 형식 업로드 및 데이터 관리
- **PromptBlock** (`/prompt`): AI 프롬프트 작성
- **AgentBlock** (`/agent`): AI 에이전트 실행
- **ResultBlock** (`/result`): 결과 표시


### 🔗 노드 기반 워크플로우

- Vue Flow를 활용한 시각적 워크플로우 구성
- 노드 간 연결 및 데이터 흐름 관리
- DAG 실행 순서 자동 계산
- 사이클 감지 및 시각적 표시

## 🛠️ 기술 스택

- **Frontend**: Vue 3 + Composition API
- **Editor**: TipTap (ProseMirror 기반)
- **Flow**: Vue Flow
- **Styling**: Tailwind CSS
- **Build Tool**: Vite

## 📦 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

## 🎨 사용법

### 기본 블록 생성
- `/data` - 데이터 블록 생성
- `/prompt` - 프롬프트 블록 생성
- `/agent` - 에이전트 블록 생성
- `/result` - 결과 블록 생성


### DataBlock 사용법
1. `/data` 명령어로 DataBlock 생성
2. 파일을 드래그 앤 드롭하거나 클릭하여 업로드
3. 지원 형식: CSV, TSV, JSON, TXT, XLSX
4. 파싱된 데이터 미리보기 확인
5. 필요시 텍스트 편집 영역에서 직접 수정
6. "내보내기" 버튼으로 데이터 다운로드

### 스프레드시트 기능 사용
1. `/data` 명령어로 DataBlock 생성
2. 스프레드시트 모드로 전환
3. Luckysheet를 사용한 실시간 편집
4. 데이터 구조화 및 JSON 내보내기

## 🔧 개발 가이드

### 새로운 스프레드시트 렌더러 추가

1. `src/components/spreadsheet/` 디렉토리에 새 렌더러 컴포넌트 생성
2. SpreadsheetRenderer 인터페이스 구현
3. DataBlock에서 새 렌더러 옵션 추가

### 블록 확장

1. `src/extensions/` 디렉토리에 새 블록 확장 생성
2. `src/components/` 디렉토리에 블록 컴포넌트 생성
3. Editor.vue에 확장 등록
4. SlashCommand에 명령어 추가

## 📝 라이선스

MIT License

## 🤝 기여

프로젝트에 기여하고 싶으시다면 Pull Request를 보내주세요!
