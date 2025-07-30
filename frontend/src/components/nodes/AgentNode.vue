<template>
  <div class="agent-node">
    <Handle
      type="target"
      position="left"
      :style="{ background: '#f59e0b' }"
    />
    
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
            class="form-textarea nodrag"
            rows="3"
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
        <select v-model="selectedAgentType" @change="update" class="form-select nodrag">
          <option value="planner">📋 Planner - 계획 수립형</option>
          <option value="executor">⚡ Executor - 실행 중심형</option>
          <option value="researcher">🔍 Researcher - 연구 분석형</option>
          <option value="analyzer">📊 Analyzer - 데이터 분석형</option>
          <option value="codeGenerator">💻 Code Generator - 코드 생성형</option>
        </select>
        
        <!-- 모델 선택 -->
        <div class="text-sm text-gray-600">🧠 모델 선택:</div>
        <select v-model="selectedModel" @change="update" class="form-select nodrag">
          <option value="gpt-4">GPT-4 (강력함)</option>
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo (빠름)</option>
          <option value="claude-3">Claude 3 (균형)</option>
        </select>
        
        <!-- 반복 설정 -->
        <div class="text-sm text-gray-600">🔄 반복 설정:</div>
        <div class="flex items-center gap-2">
          <input
            v-model="maxIterations"
            type="number"
            min="1"
            max="10"
            class="form-input nodrag"
            style="width: 80px;"
          />
          <span class="text-sm text-gray-600">회 최대 반복</span>
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
            :disabled="isRunning || !localGoal.trim()"
            :class="['btn', isRunning || !localGoal.trim() ? 'btn-disabled' : 'btn-warning', 'nodrag']"
          >
            <span v-if="isRunning">⏳ 실행 중...</span>
            <span v-else>🚀 Agent 시작</span>
          </button>
          <button 
            v-if="isRunning"
            @click="stop" 
            class="btn btn-danger nodrag"
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
          
          <!-- 다음 단계 제안 -->
          <div v-if="showSuggestions" class="next-steps">
            <div class="text-sm text-gray-600 mb-2">🎯 다음 단계 제안:</div>
            <div class="suggestion-buttons">
              <button 
                v-if="hasIntent('apiCall')"
                @click="createActionNode('apiCall')"
                class="btn btn-suggestion nodrag"
              >
                ⚡ Action Node 생성
              </button>
              <button 
                @click="createResultNode()"
                class="btn btn-suggestion nodrag"
              >
                📊 Result Node 생성
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Handle
      type="source"
      position="right"
      :style="{ background: '#f59e0b' }"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Handle } from '@vue-flow/core'

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:data', 'suggest-node'])

// 반응형 데이터
const localGoal = ref(props.data.goal || '')
const selectedAgentType = ref(props.data.agentType || 'planner')
const selectedModel = ref(props.data.model || 'gpt-4')
const maxIterations = ref(props.data.maxIterations || 3)
const isRunning = ref(false)
const currentIteration = ref(0)
const finalOutput = ref(props.data.finalOutput || '')
const showSuggestions = ref(false)

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
  fileWrite: {
    patterns: [
      /(?:파일|저장|쓰기|write|save|file)/,
      /(?:결과를).*(?:저장|파일로)/
    ],
    label: '📝 파일 쓰기'
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
  const intentsCount = detectedIntents.value.length
  
  if (intentsCount === 0) {
    return "목표를 더 구체적으로 작성해보세요!"
  } else if (intentsCount === 1) {
    return `${detectedIntents.value[0].label} 작업을 수행할 준비가 되었습니다!`
  } else {
    return `${intentsCount}개의 작업이 감지되었습니다. Agent가 순차적으로 처리합니다.`
  }
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
  if (props.data) {
    props.data.goal = localGoal.value
    props.data.agentType = selectedAgentType.value
    props.data.model = selectedModel.value
    props.data.maxIterations = maxIterations.value
    props.data.finalOutput = finalOutput.value
  }
}

async function run() {
  if (isRunning.value) return
  
  isRunning.value = true
  currentIteration.value = 0
  finalOutput.value = ''
  showSuggestions.value = false
  
  try {
    console.log('🚀 Agent 시작:', {
      goal: localGoal.value,
      agentType: selectedAgentType.value,
      model: selectedModel.value,
      maxIterations: maxIterations.value,
      detectedIntents: detectedIntents.value
    })
    
    // Agent 실행 로직
    const agentBlock = {
      id: `agent-${Date.now()}`,
      name: `Agent: ${localGoal.value.substring(0, 30)}...`,
      type: selectedAgentType.value,
      config: {
        goal: localGoal.value,
        prompt: localGoal.value,
        model: selectedModel.value,
        maxIterations: maxIterations.value,
        detectedIntents: detectedIntents.value
      },
      contextRefs: []
    }
    
    const response = await fetch('/api/agent/execute', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(agentBlock)
    })
    
    const result = await response.json()
    finalOutput.value = result.config?.result || result.output || 'Agent 실행 완료'
    
    // 실행 성공 후 제안 표시
    if (result.status === 'COMPLETED') {
      showSuggestions.value = true
    }
    
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

// Action Node 생성
function createActionNode(actionType) {
  const suggestions = [{
    type: 'action',
    data: {
      goal: localGoal.value,
      actionType: actionType,
      settings: {}
    },
    message: '⚡ Action Node가 생성되었습니다!'
  }]
  
  emit('suggest-node', {
    sourceNodeId: props.data.id,
    suggestions: suggestions
  })
}

// Result Node 생성
function createResultNode() {
  const suggestions = [{
    type: 'result',
    data: {
      output: finalOutput.value,
      visualizationType: hasIntent('visualization') ? 'chart' : 'text',
      analysisStyle: '핵심 요약'
    },
    message: '📊 Result Node가 생성되었습니다!'
  }]
  
  emit('suggest-node', {
    sourceNodeId: props.data.id,
    suggestions: suggestions
  })
}
</script>

<style scoped>
.agent-node {
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
  min-width: 320px;
  max-width: 380px;
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

/* 다음 단계 제안 스타일 */
.next-steps {
  margin-top: 1rem;
  padding: 1rem;
  background: #fef3c7;
  border-radius: 0.5rem;
  border: 1px solid #fbbf24;
  animation: fadeInUp 0.4s ease-out;
}

.suggestion-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-suggestion {
  background: #f59e0b;
  color: white;
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
}

.btn-suggestion:hover {
  background: #d97706;
  transform: translateY(-1px);
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