<template>
  <div class="action-node">
    <Handle
      type="target"
      position="left"
      :style="{ background: '#8b5cf6' }"
    />
    
    <div class="block-card action-block">
      <!-- 블록 헤더 라벨 -->
      <div class="block-header">
        <div class="block-title">
          <span>⚡ Action</span>
        </div>
        <span class="block-command">/action</span>
      </div>
      
      <div class="space-y-3">
        <!-- Goal 입력 -->
        <div class="form-group">
          <label class="form-label">🎯 목표</label>
          <input
            v-model="goal"
            type="text"
            class="form-input"
            placeholder="실행할 작업의 목표를 입력하세요"
            @input="updateAttributes"
          />
        </div>

        <!-- Action Type 선택 -->
        <div class="form-group">
          <label class="form-label">🔧 액션 타입</label>
          <select
            v-model="actionType"
            class="form-select"
            @change="updateAttributes"
          >
            <option value="apiCall">🌐 API 호출</option>
            <option value="dagExecution">🔄 DAG 실행</option>
            <option value="fileWrite">📝 파일 쓰기</option>
            <option value="visualization">📊 시각화</option>
          </select>
        </div>

        <!-- 동적 설정 필드들 -->
        <div class="dynamic-settings">
          <!-- API Call 설정 -->
          <div v-if="actionType === 'apiCall'" class="space-y-2">
            <div class="form-group">
              <label class="form-label">🔗 엔드포인트</label>
              <input
                v-model="settings.endpoint"
                type="text"
                class="form-input"
                placeholder="https://api.example.com/endpoint"
                @input="updateAttributes"
              />
            </div>
            <div class="form-group">
              <label class="form-label">📡 메서드</label>
              <select
                v-model="settings.method"
                class="form-select"
                @change="updateAttributes"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">📋 헤더 (JSON)</label>
              <textarea
                v-model="settings.headers"
                class="form-textarea"
                placeholder='{"Content-Type": "application/json"}'
                @input="updateAttributes"
              ></textarea>
            </div>
          </div>

          <!-- DAG Execution 설정 -->
          <div v-if="actionType === 'dagExecution'" class="space-y-2">
            <div class="form-group">
              <label class="form-label">🆔 DAG ID</label>
              <input
                v-model="settings.dagId"
                type="text"
                class="form-input"
                placeholder="dag_123456"
                @input="updateAttributes"
              />
            </div>
            <div class="form-group">
              <label class="form-label">
                <input
                  v-model="settings.waitForCompletion"
                  type="checkbox"
                  class="form-checkbox"
                  @change="updateAttributes"
                />
                완료까지 대기
              </label>
            </div>
          </div>

          <!-- File Write 설정 -->
          <div v-if="actionType === 'fileWrite'" class="space-y-2">
            <div class="form-group">
              <label class="form-label">📁 파일명</label>
              <input
                v-model="settings.filename"
                type="text"
                class="form-input"
                placeholder="output.txt"
                @input="updateAttributes"
              />
            </div>
            <div class="form-group">
              <label class="form-label">📄 내용</label>
              <textarea
                v-model="settings.content"
                class="form-textarea"
                placeholder="파일에 쓸 내용을 입력하세요"
                @input="updateAttributes"
              ></textarea>
            </div>
          </div>

          <!-- Visualization 설정 -->
          <div v-if="actionType === 'visualization'" class="space-y-2">
            <div class="form-group">
              <label class="form-label">📊 시각화 타입</label>
              <select
                v-model="settings.type"
                class="form-select"
                @change="updateAttributes"
              >
                <option value="text">📝 텍스트</option>
                <option value="table">📋 테이블</option>
                <option value="chart">📈 차트</option>
                <option value="map">🗺️ 지도</option>
                <option value="code">💻 코드</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">📊 데이터 (JSON)</label>
              <textarea
                v-model="settings.data"
                class="form-textarea"
                placeholder='{"key": "value"}'
                @input="updateAttributes"
              ></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">⚙️ 설정 (JSON)</label>
              <textarea
                v-model="settings.config"
                class="form-textarea"
                placeholder='{"title": "제목", "xKey": "x축", "yKey": "y축"}'
                @input="updateAttributes"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- AI 프롬프트 미리보기 -->
        <div class="template-preview">
          <div class="text-sm text-gray-600 mb-2">🤖 AI 프롬프트 미리보기:</div>
          <div class="prompt-preview">
            <pre>{{ renderedPrompt }}</pre>
          </div>
        </div>

        <!-- 실행 상태 및 버튼 -->
        <div class="execution-section">
          <div class="status-indicator">
            <span class="status-text" :class="statusClass">
              {{ statusText }}
            </span>
          </div>
          <button 
            @click="executeAction" 
            class="btn btn-primary"
            :disabled="isExecuting"
          >
            {{ isExecuting ? '⏳ 실행 중...' : '▶️ 실행' }}
          </button>
        </div>

        <!-- 실행 결과 -->
        <div v-if="executionResult" class="result-section">
          <div class="text-sm text-gray-600">📤 실행 결과:</div>
          <div class="result-content">
            <pre>{{ JSON.stringify(executionResult, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>

    <Handle
      type="source"
      position="right"
      :style="{ background: '#8b5cf6' }"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Handle } from '@vue-flow/core'
import { generatePreview, getDefaultVariables } from '../../utils/templates.js'

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:data'])

// 반응형 데이터
const goal = ref(props.data.goal || '')
const actionType = ref(props.data.actionType || 'apiCall')
const settings = ref(props.data.settings || getDefaultSettings())
const isExecuting = ref(false)
const executionResult = ref(null)

// 상태 계산
const statusClass = computed(() => {
  if (isExecuting.value) return 'status-executing'
  if (executionResult.value) return 'status-success'
  return 'status-waiting'
})

const statusText = computed(() => {
  if (isExecuting.value) return '실행 중'
  if (executionResult.value) return '완료'
  return '대기'
})

// 렌더링된 프롬프트 계산
const renderedPrompt = computed(() => {
  const variables = {
    goal: goal.value,
    ...settings.value
  }
  
  // actionType에 따라 settings에서 해당 속성들을 추출
  if (actionType.value === 'apiCall') {
    variables.endpoint = settings.value.endpoint || ''
    variables.method = settings.value.method || 'GET'
    variables.headers = settings.value.headers || '{}'
  } else if (actionType.value === 'dagExecution') {
    variables.dagId = settings.value.dagId || ''
    variables.waitForCompletion = settings.value.waitForCompletion || true
  } else if (actionType.value === 'fileWrite') {
    variables.filename = settings.value.filename || ''
    variables.content = settings.value.content || ''
  } else if (actionType.value === 'visualization') {
    variables.type = settings.value.type || 'text'
    variables.data = settings.value.data || '{}'
    variables.config = settings.value.config || '{}'
  }
  
  return generatePreview(actionType.value, 'action', variables)
})

// 기본 설정값
function getDefaultSettings() {
  return {
    apiCall: {
      endpoint: '',
      method: 'GET',
      headers: '{"Content-Type": "application/json"}'
    },
    dagExecution: {
      dagId: '',
      waitForCompletion: true
    },
    fileWrite: {
      filename: '',
      content: ''
    },
    visualization: {
      type: 'text',
      data: '{}',
      config: '{}'
    }
  }
}

// 속성 업데이트
function updateAttributes() {
  const newData = {
    ...props.data,
    goal: goal.value,
    actionType: actionType.value,
    settings: settings.value
  }
  emit('update:data', newData)
}

// 액션 실행
async function executeAction() {
  if (isExecuting.value) return

  isExecuting.value = true
  executionResult.value = null

  try {
    // 프론트엔드 액션 타입을 백엔드 enum 형식으로 변환
    const mapActionType = (frontendType) => {
      const mapping = {
        'apiCall': 'API_CALL',
        'dagExecution': 'DAG_EXECUTION',
        'fileWrite': 'FILE_WRITE',
        'visualization': 'VISUALIZATION'
      }
      return mapping[frontendType] || frontendType
    }

    const payload = {
      prompt: renderedPrompt.value,
      actionType: mapActionType(actionType.value),
      settings: settings.value,
      goal: goal.value
    }

    const response = await fetch('/api/action/execute', {
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
    executionResult.value = result

    // ResultNode로 결과 전달 (선택적)
    // emit('create-result', result)

  } catch (error) {
    console.error('Action 실행 실패:', error)
    executionResult.value = {
      error: true,
      message: error.message
    }
  } finally {
    isExecuting.value = false
  }
}

// 컴포넌트 마운트 시 초기화
onMounted(() => {
  if (!props.data.settings) {
    settings.value = getDefaultSettings()
    updateAttributes()
  }
})
</script>

<style scoped>
.action-node {
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
  max-width: 400px;
}

.block-card:hover {
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  transform: translateY(-1px);
}

/* Action Block 특별 스타일 */
.action-block {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.02), rgba(139, 92, 246, 0.05));
  border: 1px solid rgba(139, 92, 246, 0.1);
}

.action-block:hover {
  border-color: rgba(139, 92, 246, 0.2);
  box-shadow: 0 4px 10px rgba(139, 92, 246, 0.1);
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
  color: #8b5cf6;
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

.space-y-2 > * + * {
  margin-top: 0.5rem;
}

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

.form-input,
.form-select,
.form-textarea {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.form-textarea {
  min-height: 80px;
  resize: vertical;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.form-checkbox {
  margin-right: 0.5rem;
}

.execution-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.status-indicator {
  display: flex;
  align-items: center;
}

.status-text {
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
}

.status-waiting {
  color: #6b7280;
  background: #f3f4f6;
}

.status-executing {
  color: #d97706;
  background: #fef3c7;
}

.status-success {
  color: #059669;
  background: #d1fae5;
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

.btn-primary {
  background: #8b5cf6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #7c3aed;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.result-section {
  margin-top: 1rem;
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

.text-sm {
  font-size: 0.875rem;
}

.text-gray-600 {
  color: #4b5563;
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
</style> 