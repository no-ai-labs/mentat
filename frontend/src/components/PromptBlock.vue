<template>
  <NodeViewWrapper>
    <div class="block-card prompt-block">
      <!-- 블록 헤더 라벨 -->
      <div class="block-header">
        <div class="block-title">
          <span>🤖 Prompt</span>
        </div>
        <span class="block-command">/prompt</span>
      </div>
      
      <div class="space-y-3">
        <div class="text-sm text-gray-600">🤖 모델 선택:</div>
        <select v-model="selectedModel" @change="update" class="form-select">
          <option value="gpt-4">GPT-4</option>
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          <option value="claude-3">Claude 3</option>
        </select>
        
        <div class="text-sm text-gray-600">📝 프롬프트:</div>
        <textarea
            v-model="localPrompt"
            @input="update"
            placeholder="프롬프트를 입력하세요..."
            class="form-textarea"
            rows="3"
        />
        
        <div class="flex items-center gap-2">
          <button @click="run" class="btn btn-primary">
            ▶ 실행
          </button>
          <div class="text-sm text-gray-600">
            {{ selectedModel }}
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

const selectedModel = ref(props.node.attrs.model || 'gpt-4')
const localPrompt = ref(props.node.attrs.prompt || '')

function update() {
  props.updateAttributes({
    model: selectedModel.value,
    prompt: localPrompt.value
  })
}

async function run() {
  const response = await fetch('/api/prompt/call', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      model: selectedModel.value,
      prompt: localPrompt.value
    })
  })

  const result = await response.json()
  const content = result.choices?.[0]?.message?.content || '프롬프트 응답 파싱 실패!'

  props.node.view?.editor?.commands.insertContent([
    {
      type: 'resultBlock',
      attrs: {
        output: content
      }
    },
    {
      type: 'paragraph'
    }
  ])
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
  border-color: #374151;
  box-shadow: 0 0 0 3px rgba(55, 65, 81, 0.1);
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