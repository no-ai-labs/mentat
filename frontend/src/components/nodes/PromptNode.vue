<template>
  <div class="prompt-node">
    <Handle
      type="target"
      position="left"
      :style="{ background: '#374151' }"
    />
    
    <div class="block-card prompt-block">
      <!-- 블록 헤더 라벨 -->
      <div class="block-header">
        <div class="block-title">
          <span>🤖 Prompt</span>
        </div>
        <span class="block-command">/prompt</span>
      </div>

      <div class="space-y-3">
        <textarea
            v-model="localPrompt"
            @input="updatePrompt"
            class="form-textarea nodrag"
            placeholder="GPT에게 묻고 싶은 내용을 입력하세요"
            rows="3"
        />

        <div class="text-sm text-gray-600">🔗 연결된 블록: {{ data.inputRefs?.length || 0 }}개</div>
        
        <div class="flex items-center gap-2">
          <button
              @click="run"
              class="btn btn-primary nodrag"
          >
            ▶ 실행
          </button>
        </div>
      </div>
    </div>

    <Handle
      type="source"
      position="right"
      :style="{ background: '#374151' }"
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

const localPrompt = ref(props.data.prompt || '')

function updatePrompt() {
  // 노드 데이터 업데이트 로직
  if (props.data) {
    props.data.prompt = localPrompt.value
  }
}

async function run() {
  // 실행 로직 (나중에 구현)
  console.log('Running prompt node:', props.data.id)
}
</script>

<style scoped>
.prompt-node {
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

/* Prompt Block 특별 스타일 */
.prompt-block {
  background: linear-gradient(135deg, rgba(55, 65, 81, 0.02), rgba(55, 65, 81, 0.05));
  border: 1px solid rgba(55, 65, 81, 0.1);
}

.prompt-block:hover {
  border-color: rgba(55, 65, 81, 0.2);
  box-shadow: 0 4px 10px rgba(55, 65, 81, 0.1);
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
  color: #1f2937;
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
  border-color: #374151;
  box-shadow: 0 0 0 3px rgba(55, 65, 81, 0.1);
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
  background: #374151;
  color: white;
}

.btn-primary:hover {
  background: #1f2937;
}
</style> 