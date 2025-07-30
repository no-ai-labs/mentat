<template>
  <div class="result-node">
    <Handle
      type="target"
      position="left"
      :style="{ background: '#06b6d4' }"
    />
    
    <div class="block-card result-block">
      <!-- 블록 헤더 라벨 -->
      <div class="block-header">
        <div class="block-title">
          <span>✅ Result</span>
        </div>
        <span class="block-command">/result</span>
      </div>
      
      <div class="space-y-3">
        <!-- 시각화 타입 선택 -->
        <div class="form-group">
          <label class="form-label">📊 시각화 타입</label>
          <select
            v-model="visualizationType"
            class="form-select"
            @change="updateAttributes"
          >
            <option value="text">📝 텍스트</option>
            <option value="table">📋 테이블</option>
            <option value="chart">📈 차트</option>
            <option value="map">🗺️ 지도</option>
            <option value="code">💻 코드</option>
            <option value="markdown">📄 마크다운</option>
          </select>
        </div>

        <!-- 분석 스타일 선택 -->
        <div class="form-group">
          <label class="form-label">🔍 분석 스타일</label>
          <select
            v-model="analysisStyle"
            class="form-select"
            @change="updateAttributes"
          >
            <option value="핵심 요약">📝 핵심 요약</option>
            <option value="키워드 추출">🏷️ 키워드 추출</option>
            <option value="감정 분석">😊 감정 분석</option>
            <option value="구조 분석">🏗️ 구조 분석</option>
            <option value="통계 분석">📊 통계 분석</option>
          </select>
        </div>

        <!-- 동적 시각화 렌더링 -->
        <div class="visualization-container">
          <!-- 텍스트 렌더링 -->
          <div v-if="visualizationType === 'text'" class="text-renderer">
            <div class="text-sm text-gray-600 mb-2">📝 텍스트 결과:</div>
            <div class="result-content nodrag nozoom">
              {{ output }}
            </div>
          </div>

          <!-- 테이블 렌더링 -->
          <div v-else-if="visualizationType === 'table'" class="table-renderer">
            <div class="text-sm text-gray-600 mb-2">📋 테이블 결과:</div>
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th v-for="header in tableHeaders" :key="header" class="table-header">
                      {{ header }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in tableData" :key="index" class="table-row">
                    <td v-for="header in tableHeaders" :key="header" class="table-cell">
                      {{ row[header] || '' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 차트 렌더링 -->
          <div v-else-if="visualizationType === 'chart'" class="chart-renderer">
            <div class="text-sm text-gray-600 mb-2">📈 차트 결과:</div>
            <div class="chart-container">
              <div class="chart-placeholder">
                <canvas ref="chartCanvas" width="300" height="200"></canvas>
              </div>
              <div class="chart-controls">
                <select v-model="chartType" @change="renderChart" class="form-select">
                  <option value="line">📈 라인 차트</option>
                  <option value="bar">📊 막대 차트</option>
                  <option value="pie">🥧 파이 차트</option>
                  <option value="doughnut">🍩 도넛 차트</option>
                  <option value="radar">🕸️ 레이더 차트</option>
                </select>
              </div>
            </div>
          </div>

          <!-- 지도 렌더링 -->
          <div v-else-if="visualizationType === 'map'" class="map-renderer">
            <div class="text-sm text-gray-600 mb-2">🗺️ 지도 결과:</div>
            <div class="map-container">
              <div class="map-placeholder">
                <div class="map-info">
                  <div>마커 개수: {{ mapMarkers.length }}개</div>
                </div>
                <div class="map-preview">
                  🗺️ 지도 미리보기 (실제 지도 라이브러리 연동 필요)
                </div>
              </div>
            </div>
          </div>

          <!-- 코드 렌더링 -->
          <div v-else-if="visualizationType === 'code'" class="code-renderer">
            <div class="text-sm text-gray-600 mb-2">💻 코드 결과:</div>
            <div class="code-container">
              <div class="code-header">
                <span class="code-language">{{ codeConfig.language || 'text' }}</span>
              </div>
              <pre class="code-content"><code>{{ codeConfig.content || output }}</code></pre>
            </div>
          </div>

          <!-- 마크다운 렌더링 -->
          <div v-else-if="visualizationType === 'markdown'" class="markdown-renderer">
            <div class="text-sm text-gray-600 mb-2">📄 마크다운 결과:</div>
            <div class="markdown-content" v-html="renderedMarkdown">
            </div>
          </div>
        </div>
        
        <!-- AI 분석 프롬프트 미리보기 -->
        <div class="template-preview">
          <div class="text-sm text-gray-600 mb-2">🤖 AI 분석 프롬프트:</div>
          <div class="prompt-preview">
            <pre>{{ renderedAnalysisPrompt }}</pre>
          </div>
          <button @click="analyzeWithAI" class="btn btn-warning mt-2" :disabled="isAnalyzing">
            {{ isAnalyzing ? '⏳ 분석 중...' : '🔍 AI 분석 실행' }}
          </button>
        </div>

        <!-- AI 분석 결과 -->
        <div v-if="analysisResult" class="analysis-result">
          <div class="text-sm text-gray-600 mb-2">🤖 AI 분석 결과:</div>
          <div class="result-content">
            <pre>{{ JSON.stringify(analysisResult, null, 2) }}</pre>
          </div>
        </div>

        <!-- 액션 버튼들 -->
        <div class="flex items-center gap-2">
          <button @click="copyToClipboard" class="btn btn-info nodrag">
            📋 복사
          </button>
          <button @click="exportData" class="btn btn-success nodrag">
            📤 내보내기
          </button>
          <div class="text-sm text-gray-600">
            길이: {{ output.length }} 문자
          </div>
        </div>
      </div>
    </div>

    <Handle
      type="source"
      position="right"
      :style="{ background: '#06b6d4' }"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { Handle } from '@vue-flow/core'
import { generatePreview, getDefaultVariables } from '../../utils/templates.js'
import Chart from 'chart.js/auto'
import { marked } from 'marked'

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:data'])

// 반응형 데이터
const output = ref(props.data.output || '결과가 없습니다.')
const visualizationType = ref(props.data.visualizationType || 'text')
const visualizationConfig = ref(props.data.visualizationConfig || {})
const analysisStyle = ref(props.data.analysisStyle || '핵심 요약')
const isAnalyzing = ref(false)
const analysisResult = ref(null)
const chartCanvas = ref(null)
const chartInstance = ref(null)
const chartType = ref('line')

// 계산된 속성들
const tableHeaders = computed(() => {
  if (visualizationType.value !== 'table') return []
  try {
    const data = JSON.parse(output.value)
    if (Array.isArray(data) && data.length > 0) {
      return Object.keys(data[0])
    }
    return []
  } catch {
    return []
  }
})

const tableData = computed(() => {
  if (visualizationType.value !== 'table') return []
  try {
    const data = JSON.parse(output.value)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
})

const chartData = computed(() => {
  if (visualizationType.value !== 'chart') return []
  try {
    const data = JSON.parse(output.value)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
})

const chartConfig = computed(() => {
  return visualizationConfig.value.chart || {
    title: '차트 제목',
    xKey: 'x',
    yKey: 'y'
  }
})

const mapMarkers = computed(() => {
  if (visualizationType.value !== 'map') return []
  try {
    const data = JSON.parse(output.value)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
})

const codeConfig = computed(() => {
  return visualizationConfig.value.code || {
    language: 'text',
    content: output.value
  }
})

// 렌더링된 분석 프롬프트 계산
const renderedAnalysisPrompt = computed(() => {
  const variables = {
    input_text: output.value,
    style: analysisStyle.value,
    desired_output_format: 'JSON 형식으로 분석 결과를 출력해주세요.',
    data: output.value,
    analysis_request: '데이터를 분석하고 인사이트를 제공해주세요.',
    title: chartConfig.value.title,
    xKey: chartConfig.value.xKey,
    yKey: chartConfig.value.yKey,
    markers: '마커 정보',
    content: output.value,
    language: codeConfig.value.language
  }
  
  return generatePreview(visualizationType.value, 'result', variables)
})

// 마크다운 렌더링
const renderedMarkdown = computed(() => {
  if (visualizationType.value !== 'markdown') return ''
  try {
    return marked(output.value)
  } catch {
    return output.value
  }
})

// 속성 업데이트
function updateAttributes() {
  const newData = {
    ...props.data,
    visualizationType: visualizationType.value,
    visualizationConfig: visualizationConfig.value
  }
  emit('update:data', newData)
}

// 클립보드 복사
async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(output.value)
    alert('클립보드에 복사되었습니다!')
  } catch (err) {
    console.error('복사 실패:', err)
  }
}

// 데이터 내보내기
function exportData() {
  const dataStr = JSON.stringify({
    output: output.value,
    visualizationType: visualizationType.value,
    visualizationConfig: visualizationConfig.value
  }, null, 2)
  
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = 'result-data.json'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// AI 분석 실행
async function analyzeWithAI() {
  if (isAnalyzing.value) return

  isAnalyzing.value = true
  analysisResult.value = null

  try {
    const payload = {
      prompt: renderedAnalysisPrompt.value,
      visualizationType: visualizationType.value,
      output: output.value,
      analysisStyle: analysisStyle.value
    }

    const response = await fetch('/api/result/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    analysisResult.value = result

  } catch (error) {
    console.error('AI 분석 실패:', error)
    analysisResult.value = {
      error: true,
      message: error.message
    }
  } finally {
    isAnalyzing.value = false
  }
}

// 차트 렌더링
async function renderChart() {
  if (visualizationType.value !== 'chart' || !chartCanvas.value) return
  
  // 기존 차트 제거
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }
  
  await nextTick()
  
  try {
    const data = JSON.parse(output.value)
    const ctx = chartCanvas.value.getContext('2d')
    
    // 차트 데이터 준비
    const chartData = prepareChartData(data, chartType.value)
    
    chartInstance.value = new Chart(ctx, {
      type: chartType.value,
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: chartConfig.value.title || '차트'
          }
        }
      }
    })
  } catch (e) {
    console.error('차트 렌더링 실패:', e)
  }
}

// 차트 데이터 준비
function prepareChartData(data, type) {
  if (!Array.isArray(data) || data.length === 0) {
    return {
      labels: [],
      datasets: []
    }
  }
  
  const xKey = chartConfig.value.xKey || Object.keys(data[0])[0]
  const yKey = chartConfig.value.yKey || Object.keys(data[0])[1]
  
  if (type === 'pie' || type === 'doughnut') {
    return {
      labels: data.map(item => item[xKey]),
      datasets: [{
        data: data.map(item => item[yKey]),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ]
      }]
    }
  } else {
    return {
      labels: data.map(item => item[xKey]),
      datasets: [{
        label: yKey,
        data: data.map(item => item[yKey]),
        borderColor: '#36A2EB',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        tension: 0.1
      }]
    }
  }
}

// 시각화 타입 변경 시 차트 재렌더링
watch(visualizationType, async (newVal) => {
  if (newVal === 'chart') {
    await nextTick()
    renderChart()
  }
})

// 차트 타입 변경 시 재렌더링
watch(chartType, () => {
  renderChart()
})

// 출력 데이터 변경 시 차트 재렌더링
watch(output, () => {
  if (visualizationType.value === 'chart') {
    renderChart()
  }
})

// 컴포넌트 마운트 시 초기화
onMounted(() => {
  if (!props.data.visualizationType) {
    updateAttributes()
  }
})
</script>

<style scoped>
.result-node {
  position: relative;
}

.block-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  transition: all 0.2s ease;
  border: 1px solid rgba(229, 231, 235, 0.8);
  position: relative;
  min-width: 280px;
  max-width: 320px;
}

.block-card:hover {
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  transform: translateY(-1px);
}

/* Result Block 특별 스타일 */
.result-block {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.02), rgba(249, 115, 22, 0.05));
  border: 1px solid rgba(249, 115, 22, 0.1);
}

.result-block:hover {
  border-color: rgba(249, 115, 22, 0.2);
  box-shadow: 0 4px 10px rgba(249, 115, 22, 0.1);
}

.block-header {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f3f4f6;
}

.block-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #ea580c;
}

.block-command {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 400;
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
}

.result-content {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  white-space: pre-wrap;
  max-height: 200px;
  overflow-y: auto;
  color: #374151;
}

.space-y-3 > * + * {
  margin-top: 0.75rem;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.gap-2 {
  gap: 0.5rem;
}

.text-sm {
  font-size: 0.875rem;
}

.text-gray-600 {
  color: #4b5563;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.btn-info {
  background: #06b6d4;
  color: white;
}

.btn-info:hover {
  background: #0891b2;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover {
  background: #059669;
}

/* 폼 스타일 */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.form-select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.form-select:focus {
  outline: none;
  border-color: #06b6d4;
  box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
}

/* 시각화 컨테이너 */
.visualization-container {
  margin-top: 0.75rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

/* 테이블 스타일 */
.table-container {
  overflow-x: auto;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.table-header {
  background: #f9fafb;
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.table-row:nth-child(even) {
  background: #f9fafb;
}

.table-cell {
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  color: #374151;
}

/* 차트 스타일 */
.chart-container {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.chart-placeholder {
  padding: 1rem;
  background: #f9fafb;
  text-align: center;
}

.chart-controls {
  padding: 1rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.chart-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.chart-info {
  display: flex;
  justify-content: space-around;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.chart-preview {
  padding: 2rem;
  background: white;
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  color: #6b7280;
  font-style: italic;
}

/* 지도 스타일 */
.map-container {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.map-placeholder {
  padding: 1rem;
  background: #f9fafb;
  text-align: center;
}

.map-info {
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.map-preview {
  padding: 2rem;
  background: white;
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  color: #6b7280;
  font-style: italic;
}

/* 코드 스타일 */
.code-container {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.code-header {
  background: #f3f4f6;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.code-language {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
}

.code-content {
  margin: 0;
  padding: 1rem;
  background: #1f2937;
  color: #f9fafb;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  overflow-x: auto;
  white-space: pre-wrap;
}

/* 템플릿 미리보기 스타일 */
.template-preview {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
}

.prompt-preview {
  background: #1f2937;
  color: #f9fafb;
  padding: 1rem;
  border-radius: 0.375rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  overflow-x: auto;
  white-space: pre-wrap;
  max-height: 300px;
  overflow-y: auto;
}

.prompt-preview pre {
  margin: 0;
  font-family: inherit;
}

.btn-warning {
  background: #f59e0b;
  color: white;
}

.btn-warning:hover:not(:disabled) {
  background: #d97706;
}

.btn-warning:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.analysis-result {
  margin-top: 1rem;
  padding: 1rem;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 0.5rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

/* 마크다운 스타일 */
.markdown-renderer {
  margin-top: 0.75rem;
}

.markdown-content {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  font-size: 0.875rem;
  line-height: 1.6;
  color: #374151;
  max-height: 400px;
  overflow-y: auto;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.markdown-content h1 { font-size: 1.5rem; }
.markdown-content h2 { font-size: 1.25rem; }
.markdown-content h3 { font-size: 1.125rem; }
.markdown-content h4 { font-size: 1rem; }
.markdown-content h5 { font-size: 0.875rem; }
.markdown-content h6 { font-size: 0.75rem; }

.markdown-content p {
  margin-bottom: 0.5rem;
}

.markdown-content ul,
.markdown-content ol {
  margin-left: 1.5rem;
  margin-bottom: 0.5rem;
}

.markdown-content li {
  margin-bottom: 0.25rem;
}

.markdown-content code {
  background: #e5e7eb;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
}

.markdown-content pre {
  background: #1f2937;
  color: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-bottom: 0.5rem;
}

.markdown-content pre code {
  background: transparent;
  padding: 0;
}

.markdown-content blockquote {
  border-left: 4px solid #d1d5db;
  padding-left: 1rem;
  margin: 0.5rem 0;
  color: #6b7280;
}

.markdown-content table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 0.5rem;
}

.markdown-content th,
.markdown-content td {
  border: 1px solid #e5e7eb;
  padding: 0.5rem;
  text-align: left;
}

.markdown-content th {
  background: #f3f4f6;
  font-weight: 600;
}

.markdown-content a {
  color: #3b82f6;
  text-decoration: underline;
}

.markdown-content a:hover {
  color: #2563eb;
}

.markdown-content img {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 0.5rem 0;
}
</style> 