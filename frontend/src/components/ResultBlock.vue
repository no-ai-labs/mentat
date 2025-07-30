<template>
  <NodeViewWrapper>
    <div class="block-card result-block">
      <!-- 블록 헤더 라벨 -->
      <div class="block-header">
        <div class="block-title">
          <span>✅ Result</span>
        </div>
        <span class="block-command">/result</span>
      </div>
      
      <div class="space-y-3">
        <div class="text-sm text-gray-600">📊 결과:</div>
        <div class="result-content">
          {{ output }}
        </div>
        
        <div class="flex items-center gap-2">
          <button @click="copyToClipboard" class="btn btn-secondary">
            📋 복사
          </button>
          <div class="text-sm text-gray-600">
            길이: {{ output.length }} 문자
          </div>
        </div>
      </div>
    </div>
  </NodeViewWrapper>
</template>

<script setup>
import {ref} from 'vue'
import {NodeViewWrapper} from "@tiptap/vue-3";

const props = defineProps({
  node: Object,
  updateAttributes: Function
})

const output = ref(props.node.attrs.output || '결과가 없습니다.')

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(output.value)
    alert('클립보드에 복사되었습니다!')
  } catch (err) {
    console.error('복사 실패:', err)
  }
}
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
  max-height: 300px;
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
</style>