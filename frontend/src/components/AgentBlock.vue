<template>
  <NodeViewWrapper>
    <div class="block-card agent-block">
      <!-- 블록 헤더 라벨 -->
      <div class="block-header">
        <div class="block-title">
          <span>🤖 Agent</span>
        </div>
        <span class="block-command">/agent</span>
      </div>
      
      <div class="space-y-3">
        <!-- Goal 설정 -->
        <div class="text-sm text-gray-600">🎯 목표 (Goal):</div>
        <textarea
            v-model="localGoal"
            @input="update"
            placeholder="에이전트가 달성해야 할 목표를 명확히 정의하세요..."
            class="form-textarea"
            rows="2"
        />
        
        <!-- 의도 감지 결과 표시 -->
        <div v-if="detectedIntents.length > 0" class="intent-detection">
          <div class="text-sm text-gray-600">🔍 감지된 의도:</div>
          <div class="intent-tags">
            <span 
              v-for="intent in detectedIntents" 
              :key="intent.type"
              class="intent-tag"
              :class="intent.type"
            >
              {{ intent.label }}
            </span>
          </div>
          
          <!-- 유저 친화적인 툴팁 메시지 -->
          <div class="intent-tooltip">
            <div class="tooltip-icon">💡</div>
            <div class="tooltip-content">
              {{ getIntentTooltipMessage() }}
            </div>
          </div>
        </div>
        
        <!-- Agent 타입 선택 -->
        <div class="text-sm text-gray-600">🤖 Agent 타입:</div>
        <select v-model="selectedAgentType" @change="update" class="form-select">
          <option value="planner">📋 Planner - 계획 수립형</option>
          <option value="executor">⚡ Executor - 실행 중심형</option>
          <option value="researcher">🔍 Researcher - 연구 분석형</option>
          <option value="critic">🎭 Critic - 비판 검토형</option>
          <option value="coordinator">🎯 Coordinator - 조율 통합형</option>
        </select>
        
        <!-- 모델 선택 -->
        <div class="text-sm text-gray-600">🧠 모델 선택:</div>
        <select v-model="selectedModel" @change="update" class="form-select">
          <option value="gpt-4">GPT-4</option>
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          <option value="claude-3">Claude 3</option>
        </select>
        
        <!-- 반복 설정 -->
        <div class="text-sm text-gray-600">🔄 반복 설정:</div>
        <div class="flex items-center gap-2">
          <input
            v-model="maxIterations"
            type="number"
            min="1"
            max="10"
            class="form-input"
            style="width: 80px;"
          />
          <span class="text-sm text-gray-600">회 최대 반복</span>
        </div>
        
        <!-- 동적 UI: API 호출 의도 -->
        <div v-if="hasIntent('apiCall')" class="dynamic-ui api-call-ui">
          <div class="text-sm text-gray-600">🌐 API 호출 설정:</div>
          <input
            v-model="apiEndpoint"
            placeholder="API 엔드포인트 (예: /api/analytics)"
            class="form-input"
          />
          <select v-model="httpMethod" class="form-select">
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
          <textarea
            v-model="apiHeaders"
            placeholder="헤더 (JSON 형식, 선택사항)"
            class="form-textarea"
            rows="2"
          />
        </div>
        
        <!-- 동적 UI: DAG 실행 의도 -->
        <div v-if="hasIntent('dagExecution')" class="dynamic-ui dag-execution-ui">
          <div class="text-sm text-gray-600">🔄 DAG 실행 설정:</div>
          <select v-model="selectedDag" class="form-select">
            <option value="">DAG 선택...</option>
            <option value="data-preprocessing">데이터 전처리</option>
            <option value="analysis-pipeline">분석 파이프라인</option>
            <option value="ml-training">ML 학습</option>
            <option value="report-generation">보고서 생성</option>
          </select>
          <div class="flex items-center gap-2">
            <input
              v-model="dagWaitForCompletion"
              type="checkbox"
              id="dagWait"
              class="form-checkbox"
            />
            <label for="dagWait" class="text-sm text-gray-600">
              완료까지 대기
            </label>
          </div>
        </div>
        
        <!-- 동적 UI: 시각화 의도 -->
        <div v-if="hasIntent('visualization')" class="dynamic-ui visualization-ui">
          <div class="text-sm text-gray-600">📊 시각화 설정:</div>
          <select v-model="visualizationType" class="form-select">
            <option value="chart">📈 차트</option>
            <option value="map">🗺️ 지도</option>
            <option value="table">📋 테이블</option>
            <option value="heatmap">🔥 히트맵</option>
          </select>
          <input
            v-model="visualizationTitle"
            placeholder="시각화 제목"
            class="form-input"
          />
        </div>
        
        <!-- 동적 UI: 노드 연결 의도 -->
        <div v-if="hasIntent('nodeConnection')" class="dynamic-ui node-connection-ui">
          <div class="text-sm text-gray-600">🔗 노드 연결 설정:</div>
          <select v-model="targetNodeType" class="form-select">
            <option value="">연결할 노드 타입...</option>
            <option value="result">✅ Result Node</option>
            <option value="data">📥 Data Node</option>
            <option value="prompt">🤖 Prompt Node</option>
            <option value="agent">🤖 Agent Node</option>
          </select>
          <div class="flex items-center gap-2">
            <input
              v-model="autoCreateNode"
              type="checkbox"
              id="autoCreate"
              class="form-checkbox"
            />
            <label for="autoCreate" class="text-sm text-gray-600">
              자동으로 노드 생성
            </label>
          </div>
        </div>
        
        <!-- 상태 표시 -->
        <div class="agent-status">
          <div class="text-sm text-gray-600">📊 상태:</div>
          <div class="status-indicator" :class="statusClass">
            {{ statusText }}
          </div>
        </div>
        
        <!-- 실행 버튼 -->
        <div class="flex items-center gap-2">
          <button 
            @click="run" 
            :disabled="isRunning"
            :class="['btn', isRunning ? 'btn-disabled' : 'btn-warning']"
          >
            <span v-if="isRunning">⏳ 실행 중...</span>
            <span v-else>🚀 Agent 시작</span>
          </button>
          <button 
            v-if="isRunning"
            @click="stop" 
            class="btn btn-danger"
          >
            ⏹️ 중지
          </button>
        </div>
        
        <!-- 진행 상황 -->
        <div v-if="currentIteration > 0" class="progress-info">
          <div class="text-sm text-gray-600">
            🔄 반복 {{ currentIteration }}/{{ maxIterations }}
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: `${(currentIteration / maxIterations) * 100}%` }"
            ></div>
          </div>
        </div>
        
        <!-- 최종 결과 -->
        <div v-if="finalOutput" class="final-result">
          <div class="text-sm text-gray-600">✅ 최종 결과:</div>
          <div class="result-content">
            {{ finalOutput }}
          </div>
        </div>
      </div>
    </div>
  </NodeViewWrapper>
</template>

<script setup>
import {ref, computed, watch} from 'vue'
import {NodeViewWrapper} from "@tiptap/vue-3";

const props = defineProps({
  node: Object,
  updateAttributes: Function
})

// 반응형 데이터
const localGoal = ref(props.node.attrs.goal || '')
const selectedAgentType = ref(props.node.attrs.agentType || 'planner')
const selectedModel = ref(props.node.attrs.model || 'gpt-4')
const maxIterations = ref(props.node.attrs.maxIterations || 3)
const isRunning = ref(false)
const currentIteration = ref(0)
const finalOutput = ref(props.node.attrs.finalOutput || '')

// 동적 UI 데이터
const apiEndpoint = ref('')
const httpMethod = ref('POST')
const apiHeaders = ref('')
const selectedDag = ref('')
const dagWaitForCompletion = ref(true)
const visualizationType = ref('chart')
const visualizationTitle = ref('')
const targetNodeType = ref('')
const autoCreateNode = ref(true)

// 의도 감지 패턴
const intentPatterns = {
  apiCall: {
    patterns: [
      /(?:API|api|호출|전송|POST|GET|PUT|DELETE|엔드포인트|endpoint)/,
      /(?:http|https):\/\/[^\s]+/,
      /\/api\/[^\s]+/
    ],
    label: '🌐 API 호출'
  },
  dagExecution: {
    patterns: [
      /(?:DAG|dag|워크플로우|파이프라인|실행|workflow|pipeline)/,
      /(?:이전|기존|만든).*(?:워크플로우|파이프라인|DAG)/
    ],
    label: '🔄 DAG 실행'
  },
  visualization: {
    patterns: [
      /(?:시각화|차트|그래프|맵|지도|히트맵|visualization|chart|map|heatmap)/,
      /(?:표시|보여줘|그려줘|시각적으로)/
    ],
    label: '📊 시각화'
  },
  nodeConnection: {
    patterns: [
      /(?:연결|전달|다음|단계|노드|node|connect)/,
      /(?:결과를).*(?:전달|연결|보내)/
    ],
    label: '🔗 노드 연결'
  }
}

// 의도 감지 함수
function detectIntents(text) {
  const intents = []
  
  Object.entries(intentPatterns).forEach(([type, config]) => {
    const hasMatch = config.patterns.some(pattern => pattern.test(text))
    if (hasMatch) {
      intents.push({ type, label: config.label })
    }
  })
  
  return intents
}

// 감지된 의도들
const detectedIntents = computed(() => {
  return detectIntents(localGoal.value)
})

// 의도 확인 함수
function hasIntent(type) {
  return detectedIntents.value.some(intent => intent.type === type)
}

// 유저 친화적인 툴팁 메시지 생성
function getIntentTooltipMessage() {
  const messages = []
  
  if (hasIntent('apiCall')) {
    messages.push("목표에 API 호출이 포함되어 있어요! 아래에서 API를 설정해보세요.")
  }
  
  if (hasIntent('dagExecution')) {
    messages.push("다른 워크플로우를 실행하고 싶으신가요? DAG를 선택해보세요.")
  }
  
  if (hasIntent('visualization')) {
    messages.push("분석 후 시각화하고 싶으신가요? 그래프 종류를 선택해보세요.")
  }
  
  if (hasIntent('nodeConnection')) {
    messages.push("결과를 다른 노드와 연결하고 싶으신가요? 연결 설정을 해보세요.")
  }
  
  // 여러 의도가 있을 때는 첫 번째 메시지만 표시
  return messages[0] || "감지된 의도에 맞는 설정을 확인해보세요!"
}

// 상태 계산
const statusClass = computed(() => {
  if (isRunning.value) return 'status-running'
  if (finalOutput.value) return 'status-completed'
  return 'status-idle'
})

const statusText = computed(() => {
  if (isRunning.value) return '실행 중'
  if (finalOutput.value) return '완료'
  return '대기 중'
})

function update() {
  props.updateAttributes({
    goal: localGoal.value,
    agentType: selectedAgentType.value,
    model: selectedModel.value,
    maxIterations: maxIterations.value,
    finalOutput: finalOutput.value,
    // 동적 UI 데이터도 저장
    apiEndpoint: apiEndpoint.value,
    httpMethod: httpMethod.value,
    apiHeaders: apiHeaders.value,
    selectedDag: selectedDag.value,
    dagWaitForCompletion: dagWaitForCompletion.value,
    visualizationType: visualizationType.value,
    visualizationTitle: visualizationTitle.value,
    targetNodeType: targetNodeType.value,
    autoCreateNode: autoCreateNode.value
  })
}

async function run() {
  if (isRunning.value) return
  
  isRunning.value = true
  currentIteration.value = 0
  finalOutput.value = ''
  
  try {
    console.log('🚀 Agent 시작:', {
      goal: localGoal.value,
      agentType: selectedAgentType.value,
      model: selectedModel.value,
      maxIterations: maxIterations.value,
      detectedIntents: detectedIntents.value,
      // 동적 UI 데이터도 전송
      apiEndpoint: apiEndpoint.value,
      httpMethod: httpMethod.value,
      selectedDag: selectedDag.value,
      visualizationType: visualizationType.value,
      targetNodeType: targetNodeType.value
    })
    
    // Agent 실행 로직 (실제 구현은 백엔드에서)
    const response = await fetch('/api/agent/execute', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        goal: localGoal.value,
        agentType: selectedAgentType.value,
        model: selectedModel.value,
        maxIterations: maxIterations.value,
        // 동적 UI 설정도 포함
        dynamicSettings: {
          apiCall: hasIntent('apiCall') ? {
            endpoint: apiEndpoint.value,
            method: httpMethod.value,
            headers: apiHeaders.value
          } : null,
          dagExecution: hasIntent('dagExecution') ? {
            dagId: selectedDag.value,
            waitForCompletion: dagWaitForCompletion.value
          } : null,
          visualization: hasIntent('visualization') ? {
            type: visualizationType.value,
            title: visualizationTitle.value
          } : null,
          nodeConnection: hasIntent('nodeConnection') ? {
            targetType: targetNodeType.value,
            autoCreate: autoCreateNode.value
          } : null
        }
      })
    })
    
    const result = await response.json()
    finalOutput.value = result.output || 'Agent 실행 완료'
    
    // ResultBlock 생성
    props.node.view?.editor?.commands.insertContent([
      {
        type: 'resultBlock',
        attrs: {
          output: finalOutput.value
        }
      },
      {
        type: 'paragraph'
      }
    ])
    
  } catch (error) {
    console.error('❌ Agent 실행 실패:', error)
    finalOutput.value = 'Agent 실행 중 오류가 발생했습니다.'
  } finally {
    isRunning.value = false
    update()
  }
}

function stop() {
  isRunning.value = false
  console.log('⏹️ Agent 중지됨')
}

// 초기화: 저장된 동적 UI 데이터 복원
if (props.node.attrs.apiEndpoint) apiEndpoint.value = props.node.attrs.apiEndpoint
if (props.node.attrs.httpMethod) httpMethod.value = props.node.attrs.httpMethod
if (props.node.attrs.apiHeaders) apiHeaders.value = props.node.attrs.apiHeaders
if (props.node.attrs.selectedDag) selectedDag.value = props.node.attrs.selectedDag
if (props.node.attrs.dagWaitForCompletion !== undefined) dagWaitForCompletion.value = props.node.attrs.dagWaitForCompletion
if (props.node.attrs.visualizationType) visualizationType.value = props.node.attrs.visualizationType
if (props.node.attrs.visualizationTitle) visualizationTitle.value = props.node.attrs.visualizationTitle
if (props.node.attrs.targetNodeType) targetNodeType.value = props.node.attrs.targetNodeType
if (props.node.attrs.autoCreateNode !== undefined) autoCreateNode.value = props.node.attrs.autoCreateNode
</script>

<style scoped>
.block-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  margin-bottom: 16px;
  transition: all 0.2s ease;
  border: 1px solid rgba(229, 231, 235, 0.8);
  position: relative;
}

.block-card:hover {
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  transform: translateY(-1px);
}

/* Agent Block 특별 스타일 */
.agent-block {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.02), rgba(245, 158, 11, 0.05));
  border: 1px solid rgba(245, 158, 11, 0.1);
}

.agent-block:hover {
  border-color: rgba(245, 158, 11, 0.2);
  box-shadow: 0 4px 10px rgba(245, 158, 11, 0.1);
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
  color: #d97706;
}

.block-command {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 400;
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
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

.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
}

.form-select:focus {
  outline: none;
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.5;
  resize: vertical;
  font-family: inherit;
}

.form-textarea:focus {
  outline: none;
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

.form-input {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.form-input:focus {
  outline: none;
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

.form-checkbox {
  width: 1rem;
  height: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  cursor: pointer;
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

.btn-warning {
  background: #f59e0b;
  color: white;
}

.btn-warning:hover {
  background: #d97706;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.btn-disabled {
  background: #9ca3af;
  color: #6b7280;
  cursor: not-allowed;
}

.btn-disabled:hover {
  background: #9ca3af;
}

.btn-run {
  background: #374151;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-run:hover {
  background: #1f2937;
}

/* 의도 감지 스타일 */
.intent-detection {
  padding: 0.75rem;
  background: #f0f9ff;
  border-radius: 0.5rem;
  border: 1px solid #bae6fd;
}

.intent-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.intent-tag {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
}

.intent-tag.apiCall {
  background: #374151;
}

.intent-tag.dagExecution {
  background: #8b5cf6;
}

.intent-tag.visualization {
  background: #10b981;
}

.intent-tag.nodeConnection {
  background: #f59e0b;
}

/* 동적 UI 스타일 */
.dynamic-ui {
  padding: 0.75rem;
  background: #fef3c7;
  border-radius: 0.5rem;
  border: 1px solid #fbbf24;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.agent-status {
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.status-indicator {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-top: 0.25rem;
}

.status-idle {
  background: #e5e7eb;
  color: #6b7280;
}

.status-running {
  background: #fef3c7;
  color: #d97706;
  animation: pulse 2s infinite;
}

.status-completed {
  background: #d1fae5;
  color: #059669;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.progress-info {
  padding: 0.75rem;
  background: #f0f9ff;
  border-radius: 0.5rem;
  border: 1px solid #bae6fd;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e0e7ff;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #d97706);
  transition: width 0.3s ease;
}

.final-result {
  padding: 0.75rem;
  background: #f0fdf4;
  border-radius: 0.5rem;
  border: 1px solid #bbf7d0;
}

.result-content {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: white;
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  font-size: 0.875rem;
  line-height: 1.5;
  max-height: 200px;
  overflow-y: auto;
}

/* 유저 친화적인 툴팁 스타일 */
.intent-tooltip {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: 0.5rem;
  border: 1px solid #fbbf24;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  animation: fadeInUp 0.4s ease-out;
}

.tooltip-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.tooltip-content {
  font-size: 0.875rem;
  color: #92400e;
  line-height: 1.4;
  font-weight: 500;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
