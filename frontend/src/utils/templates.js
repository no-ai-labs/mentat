// 프롬프트 템플릿 관리 시스템

// ActionNode용 템플릿
export const actionTemplates = {
  apiCall: {
    template: `다음 설정으로 API 호출을 최적화하세요.

🔗 API 설정:
- 엔드포인트: {{endpoint}}
- 메서드: {{method}}
- 헤더: {{headers}}

🎯 목표: {{goal}}

👉 출력 형식:
{
  "optimized_endpoint": "최적화된 URL",
  "suggested_headers": "추천 헤더",
  "error_handling": "에러 처리 방법",
  "timeout": "권장 타임아웃",
  "retry_strategy": "재시도 전략"
}`,
    variables: ['endpoint', 'method', 'headers', 'goal']
  },
  
  dagExecution: {
    template: `다음 DAG 실행을 최적화하세요.

🔄 DAG 설정:
- DAG ID: {{dagId}}
- 대기 여부: {{waitForCompletion}}

🎯 목표: {{goal}}

👉 출력 형식:
{
  "execution_strategy": "실행 전략",
  "monitoring_points": "모니터링 포인트",
  "fallback_plan": "대체 계획",
  "estimated_duration": "예상 소요 시간",
  "resource_requirements": "필요 리소스"
}`,
    variables: ['dagId', 'waitForCompletion', 'goal']
  },
  
  fileWrite: {
    template: `다음 파일 쓰기 작업을 최적화하세요.

📁 파일 설정:
- 파일명: {{filename}}
- 내용: {{content}}

🎯 목표: {{goal}}

👉 출력 형식:
{
  "file_format": "권장 파일 형식",
  "content_structure": "내용 구조화 방법",
  "validation_rules": "검증 규칙",
  "backup_strategy": "백업 전략",
  "permissions": "권한 설정"
}`,
    variables: ['filename', 'content', 'goal']
  },
  
  visualization: {
    template: `다음 시각화 작업을 최적화하세요.

📊 시각화 설정:
- 타입: {{type}}
- 데이터: {{data}}
- 설정: {{config}}

🎯 목표: {{goal}}

👉 출력 형식:
{
  "recommended_type": "추천 시각화 타입",
  "data_preprocessing": "데이터 전처리 방법",
  "visual_config": "시각화 설정",
  "interactivity": "상호작용 옵션",
  "accessibility": "접근성 개선사항"
}`,
    variables: ['type', 'data', 'config', 'goal']
  }
}

// ResultNode용 템플릿
export const resultTemplates = {
  text: {
    template: `다음 텍스트를 {{style}}로 분석하세요.

📄 텍스트:
{{input_text}}

📝 분석 스타일: {{style}}

예시 스타일:
- 핵심 요약
- 키워드 추출
- 감정 분석
- 구조 분석

👉 출력 형식:
{{desired_output_format}}`,
    variables: ['input_text', 'style', 'desired_output_format']
  },
  
  table: {
    template: `다음 테이블 데이터를 분석하세요.

📊 테이블 데이터:
{{data}}

📝 분석 요청: {{analysis_request}}

👉 출력 형식:
{
  "summary": "데이터 요약",
  "insights": ["인사이트1", "인사이트2", "인사이트3"],
  "recommendations": ["권장사항1", "권장사항2"],
  "visualization_suggestions": "시각화 제안"
}`,
    variables: ['data', 'analysis_request']
  },
  
  chart: {
    template: `다음 차트 데이터를 분석하고 개선안을 제시하세요.

📈 차트 데이터:
{{data}}

📊 현재 설정:
- 제목: {{title}}
- X축: {{xKey}}
- Y축: {{yKey}}

👉 출력 형식:
{
  "chart_analysis": "차트 분석",
  "improvement_suggestions": ["개선안1", "개선안2"],
  "alternative_charts": ["대안 차트1", "대안 차트2"],
  "data_insights": "데이터 인사이트"
}`,
    variables: ['data', 'title', 'xKey', 'yKey']
  },
  
  map: {
    template: `다음 지도 데이터를 분석하세요.

🗺️ 지도 데이터:
{{data}}

📍 마커 정보:
{{markers}}

👉 출력 형식:
{
  "geographic_insights": "지리적 인사이트",
  "clustering_analysis": "클러스터링 분석",
  "route_optimization": "경로 최적화",
  "coverage_analysis": "커버리지 분석"
}`,
    variables: ['data', 'markers']
  },
  
  code: {
    template: `다음 코드를 분석하고 개선안을 제시하세요.

💻 코드:
{{content}}

🔧 언어: {{language}}

👉 출력 형식:
{
  "code_analysis": "코드 분석",
  "improvements": ["개선사항1", "개선사항2"],
  "best_practices": ["모범 사례1", "모범 사례2"],
  "performance_tips": "성능 팁",
  "security_considerations": "보안 고려사항"
}`,
    variables: ['content', 'language']
  }
}

// 템플릿 렌더링 함수
export function renderTemplate(template, variables) {
  let result = template
  
  Object.keys(variables).forEach(key => {
    const placeholder = `{{${key}}}`
    const value = variables[key] || ''
    result = result.replace(new RegExp(placeholder, 'g'), value)
  })
  
  return result
}

// 템플릿 미리보기 생성
export function generatePreview(templateType, nodeType, variables) {
  const templates = nodeType === 'action' ? actionTemplates : resultTemplates
  const template = templates[templateType]
  
  if (!template) {
    return '템플릿을 찾을 수 없습니다.'
  }
  
  return renderTemplate(template.template, variables)
}

// 기본 변수값 생성
export function getDefaultVariables(templateType, nodeType) {
  const templates = nodeType === 'action' ? actionTemplates : resultTemplates
  const template = templates[templateType]
  
  if (!template) {
    return {}
  }
  
  const defaults = {}
  template.variables.forEach(variable => {
    switch (variable) {
      case 'goal':
        defaults[variable] = '작업 목표를 입력하세요'
        break
      case 'endpoint':
        defaults[variable] = 'https://api.example.com/endpoint'
        break
      case 'method':
        defaults[variable] = 'GET'
        break
      case 'headers':
        defaults[variable] = '{"Content-Type": "application/json"}'
        break
      case 'dagId':
        defaults[variable] = 'dag_123456'
        break
      case 'filename':
        defaults[variable] = 'output.txt'
        break
      case 'content':
        defaults[variable] = '파일 내용을 입력하세요'
        break
      case 'type':
        defaults[variable] = 'text'
        break
      case 'data':
        defaults[variable] = '{"key": "value"}'
        break
      case 'config':
        defaults[variable] = '{"title": "제목"}'
        break
      case 'input_text':
        defaults[variable] = '분석할 텍스트를 입력하세요'
        break
      case 'style':
        defaults[variable] = '핵심 요약'
        break
      case 'desired_output_format':
        defaults[variable] = 'JSON 형식으로 출력'
        break
      case 'analysis_request':
        defaults[variable] = '데이터 분석 요청'
        break
      case 'title':
        defaults[variable] = '차트 제목'
        break
      case 'xKey':
        defaults[variable] = 'x'
        break
      case 'yKey':
        defaults[variable] = 'y'
        break
      case 'markers':
        defaults[variable] = '마커 정보'
        break
      case 'language':
        defaults[variable] = 'javascript'
        break
      default:
        defaults[variable] = `${variable} 값`
    }
  })
  
  return defaults
} 