<template>
  <div class="editor-page">
    <div class="editor-container">
      <!-- 헤더 섹션 -->
      <div class="editor-header">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="logo">
              <span>M</span>
            </div>
            <div>
              <h1>Mentat 지능 문서</h1>
              <p>AI와 함께하는 스마트 문서 작성</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="status-indicator">
              <div class="status-dot draft"></div>
              <span>Draft</span>
            </div>
            <div class="char-counter">
              {{ editor?.getCharacterCount() || 0 }} chars
            </div>
          </div>
        </div>
      </div>

      <!-- 에디터 콘텐츠 -->
      <div class="editor-content">
        <editor-content :editor="editor" class="editor-surface" />
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onBeforeUnmount, onMounted} from 'vue'
import {Editor, EditorContent} from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import {PromptBlock} from '../extensions/PromptBlock'
import {DataBlock} from '../extensions/DataBlock.js'
import {ResultBlock} from '../extensions/ResultBlock.js'
import { SlashCommand } from '../extensions/SlashCommand.js'
import { AgentBlock } from '../extensions/AgentBlock.js'
import { ActionBlock } from '../extensions/ActionBlock.js'


const editor = ref()

onMounted(() => {
  editor.value = new Editor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: '문서를 작성하세요... /prompt, /data, /agent, /action, /result 명령어로 블록을 추가할 수 있습니다.',
        emptyEditorClass: 'is-editor-empty',
      }),
      PromptBlock,
      DataBlock,
      ResultBlock,
      AgentBlock,
      ActionBlock,

      SlashCommand
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none',
      },
    },
  })
  window.editor = editor.value

  onBeforeUnmount(() => editor.value?.destroy())
})
</script>

<style scoped>
.editor-page {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1f2937;
}

.editor-container {
  transition: all 0.3s ease-in-out;
  backdrop-filter: blur(10px);
}

.editor-container:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.editor-surface {
  min-height: 400px;
}

/* ProseMirror 스타일링 */
.editor-surface :deep(.ProseMirror) {
  font-size: 1.125rem;
  line-height: 1.75rem;
  outline: none;
  color: #374151;
}

.editor-surface :deep(.ProseMirror p) {
  margin-bottom: 1.5rem;
  color: #374151;
}

.editor-surface :deep(.ProseMirror h1) {
  font-size: 2.25rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1.5rem;
  margin-top: 2rem;
}

.editor-surface :deep(.ProseMirror h2) {
  font-size: 1.875rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1.25rem;
  margin-top: 1.75rem;
}

.editor-surface :deep(.ProseMirror h3) {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
  margin-top: 1.5rem;
}

.editor-surface :deep(.ProseMirror ul),
.editor-surface :deep(.ProseMirror ol) {
  margin-bottom: 1.5rem;
  padding-left: 1.5rem;
}

.editor-surface :deep(.ProseMirror li) {
  margin-bottom: 0.5rem;
}

.editor-surface :deep(.ProseMirror blockquote) {
  border-left: 4px solid #e5e7eb;
  padding-left: 1rem;
  margin: 1.5rem 0;
  font-style: italic;
  color: #6b7280;
}

.editor-surface :deep(.ProseMirror code) {
  background-color: #f3f4f6;
  padding: 0.125rem 0.375rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #dc2626;
}

.editor-surface :deep(.ProseMirror pre) {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1.5rem 0;
}

.editor-surface :deep(.ProseMirror pre code) {
  background-color: transparent;
  padding: 0;
  color: inherit;
}

/* 플레이스홀더 스타일 */
.editor-surface :deep(.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: #9ca3af;
  pointer-events: none;
  height: 0;
  font-style: italic;
}

/* 블록 간격 조정 */
.editor-surface :deep(.ProseMirror > *) {
  margin-bottom: 1.5rem;
}

.editor-surface :deep(.ProseMirror > *:last-child) {
  margin-bottom: 0;
}

/* 블록 선택 상태 스타일 */
.editor-surface :deep(.ProseMirror .is-selected) {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 8px;
}

/* 포커스 상태 */
.editor-surface :deep(.ProseMirror:focus) {
  outline: none;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .editor-container {
    margin: 0 1rem;
    padding: 1.5rem;
  }
  
  .editor-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .editor-surface :deep(.ProseMirror) {
    font-size: 1rem;
    line-height: 1.625rem;
  }
}
</style>
