<template>
  <NodeViewWrapper>
    <div class="block-card data-block">
      <!-- 블록 헤더 라벨 -->
      <div class="block-header">
        <div class="block-title">
          <span>📄 Data</span>
        </div>
        <span class="block-command">/data</span>
      </div>
      
      <div class="space-y-4">
        <!-- 파일 업로드 섹션 -->
        <div class="upload-section">
          <div class="section-title">📁 파일 업로드</div>
          
          <!-- 드래그 앤 드롭 영역 -->
          <div 
            class="drop-zone"
            :class="{ 'drag-over': isDragOver, 'uploading': uploadState.isUploading }"
            @drop="handleFileDrop"
            @dragover="handleDragOver"
            @dragenter="isDragOver = true"
            @dragleave="isDragOver = false"
            @click="triggerFileInput"
          >
            <div v-if="!uploadState.file && !parsedContent" class="drop-zone-content">
              <div class="drop-zone-icon">📁</div>
              <div class="drop-zone-text">
                <strong>파일을 드래그하거나 클릭하여 업로드</strong>
                <div class="drop-zone-hint">
                  CSV, TSV, JSON, TXT, XLSX 파일 지원
                </div>
              </div>
            </div>
            
            <!-- 업로드 진행 상태 -->
            <div v-else-if="uploadState.isUploading" class="upload-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: uploadState.progress + '%' }"></div>
              </div>
              <div class="progress-text">파일 파싱 중... {{ uploadState.progress }}%</div>
            </div>
            
            <!-- 업로드된 파일 정보 -->
            <div v-else-if="uploadState.file" class="uploaded-file">
              <div class="file-info">
                <span class="file-name">{{ uploadState.file.name }}</span>
                <span class="file-size">{{ formatFileSize(uploadState.file.size) }}</span>
              </div>
              <button @click.stop="clearFile" class="clear-btn">❌</button>
            </div>
          </div>
          
          <!-- 숨겨진 파일 입력 -->
          <input
            ref="fileInput"
            type="file"
            accept=".csv,.tsv,.json,.txt,.xlsx,.xls"
            @change="handleFileSelect"
            class="hidden-input"
          />
          
          <!-- 오류 메시지 -->
          <div v-if="uploadState.error" class="error-message">
            ❌ {{ uploadState.error }}
          </div>
        </div>

        <!-- 데이터 미리보기 섹션 (구조화된 데이터만) -->
        <div v-if="parsedContent && ['csv', 'tsv', 'json', 'xlsx'].includes(parsedContent.format)" class="preview-section">
          <div class="section-title">👁️ 데이터 미리보기</div>
          
          <div class="preview-header">
            <div class="preview-info">
              <span class="format-badge">{{ parsedContent.format.toUpperCase() }}</span>
              <span class="preview-summary">{{ parsedContent.summary }}</span>
            </div>

          </div>
          
          <!-- 미리보기 콘텐츠 -->
          <div class="preview-content nodrag nozoom">
            <div v-if="parsedContent.format === 'csv' || parsedContent.format === 'tsv'" class="table-preview">
              <div class="table-info">
                <span class="table-summary">📊 {{ parsedContent.parsed.length }}행 × {{ parsedContent.parsed[0]?.length || 0 }}열</span>
              </div>
              <table class="data-table">
                <tbody>
                  <tr v-for="(row, index) in parsedContent.parsed.slice(0, 10)" :key="index">
                    <td v-for="(cell, cellIndex) in row" :key="cellIndex">{{ cell }}</td>
                  </tr>
                </tbody>
              </table>
              <div v-if="parsedContent.parsed.length > 10" class="preview-note">
                📋 처음 10행 표시 중... (총 {{ parsedContent.parsed.length }}행)
              </div>
            </div>
            
            <div v-else-if="parsedContent.format === 'json'" class="json-preview">
              <pre class="json-content">{{ formatJson(parsedContent.parsed) }}</pre>
            </div>
            
            <div v-else class="text-preview">
              <pre class="text-content">{{ parsedContent.parsed }}</pre>
            </div>
          </div>
        </div>

        <!-- 텍스트 편집 섹션 -->
        <div class="text-section">
          <div class="section-title">✏️ 직접 편집</div>
          
          <textarea
            v-model="localData"
            @input="update"
            placeholder="여기에 데이터를 붙여넣거나 직접 입력하세요..."
            class="form-textarea nodrag nozoom"
            rows="6"
          />
          
          <div class="text-info">
            <span class="char-count">데이터 길이: {{ localData.length }} 문자</span>
            <span v-if="parsedContent" class="format-info">
              | 형식: {{ parsedContent.format.toUpperCase() }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </NodeViewWrapper>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { NodeViewWrapper } from '@tiptap/vue-3'
import { useFileParser } from '@/composables/useFileParser'

const props = defineProps({
  node: Object,
  updateAttributes: Function
})

// 파일 파서 composable 사용
const { uploadState, parseFile, handleDrop, handleDragOver } = useFileParser()

// 로컬 상태
const localData = ref(props.node.attrs.rawContent || '')
const parsedContent = ref(props.node.attrs.parsedContent || null)
const isDragOver = ref(false)
const fileInput = ref()

// 파일 드롭 처리
const handleFileDrop = async (event) => {
  isDragOver.value = false
  const file = handleDrop(event)
  if (file) {
    await processFile(file)
  }
}

// 파일 선택 처리
const handleFileSelect = async (event) => {
  const target = event.target
  const file = target.files?.[0]
  if (file) {
    await processFile(file)
  }
}

// 파일 처리
const processFile = async (file) => {
  const result = await parseFile(file)
  if (result) {
    parsedContent.value = result
    localData.value = result.raw
    updateAttributes()
  }
}

// 파일 입력 트리거
const triggerFileInput = () => {
  fileInput.value?.click()
}

// 파일 클리어
const clearFile = () => {
  uploadState.value.file = null
  parsedContent.value = null
  updateAttributes()
}



// 속성 업데이트
const updateAttributes = () => {
  props.updateAttributes({
    rawContent: localData.value,
    parsedContent: parsedContent.value
  })
}

// 유틸리티 함수들
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatJson = (data) => {
  try {
    // JSON 데이터를 보기 좋게 포맷팅
    const formatted = JSON.stringify(data, null, 2)
    
    // 데이터가 너무 크면 일부만 표시하고 요약 정보 추가
    if (formatted.length > 1500) {
      const preview = formatted.slice(0, 1500)
      const lines = formatted.split('\n').length
      const size = formatted.length
      
      return `${preview}...\n\n📊 JSON 요약:\n- 총 ${lines}줄\n- ${size.toLocaleString()}자\n- ${getJsonStructure(data)}`
    }
    
    return formatted
  } catch {
    return String(data)
  }
}

// JSON 구조 분석 함수
const getJsonStructure = (data) => {
  if (Array.isArray(data)) {
    return `배열 (${data.length}개 요소)`
  } else if (typeof data === 'object' && data !== null) {
    const keys = Object.keys(data)
    return `객체 (${keys.length}개 속성: ${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''})`
  } else {
    return typeof data
  }
}

// 텍스트 변경 감지
const update = () => {
  updateAttributes()
}

// 초기 데이터 로드
watch(() => props.node.attrs.parsedContent, (newContent) => {
  if (newContent) {
    parsedContent.value = newContent
  }
}, { immediate: true })
</script>

<style scoped>
.block-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  margin-bottom: 0;
  transition: all 0.2s ease;
  border: 1px solid rgba(229, 231, 235, 0.8);
  position: relative;
}

.block-card:hover {
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  transform: translateY(-1px);
}

/* Data Block 특별 스타일 */
.data-block {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.02), rgba(34, 197, 94, 0.05));
  border: 1px solid rgba(34, 197, 94, 0.1);
}

.data-block:hover {
  border-color: rgba(34, 197, 94, 0.2);
  box-shadow: 0 4px 10px rgba(34, 197, 94, 0.1);
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
  color: #15803d;
}

.block-command {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 400;
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

/* 드롭 존 스타일 */
.drop-zone {
  border: 3px dashed #10b981;
  border-radius: 12px;
  padding: 2.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
  min-height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  position: relative;
  overflow: hidden;
}

.drop-zone::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.1), transparent);
  transition: left 0.5s ease;
}

.drop-zone:hover::before {
  left: 100%;
}

.drop-zone:hover {
  border-color: #10b981;
  background: #f0fdf4;
}

.drop-zone.drag-over {
  border-color: #10b981;
  background: #f0fdf4;
  transform: scale(1.02);
}

.drop-zone.uploading {
  border-color: #3b82f6;
  background: #eff6ff;
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.drop-zone-icon {
  font-size: 3rem;
  color: #10b981;
  margin-bottom: 1rem;
  filter: drop-shadow(0 2px 4px rgba(16, 185, 129, 0.2));
}

.drop-zone-text {
  color: #065f46;
  font-weight: 500;
}

.drop-zone-hint {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.hidden-input {
  display: none;
}

/* 업로드 진행 상태 */
.upload-progress {
  width: 100%;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: #10b981;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.875rem;
  color: #6b7280;
}

/* 업로드된 파일 정보 */
.uploaded-file {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f0fdf4;
  border-radius: 6px;
  border: 1px solid #bbf7d0;
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.file-name {
  font-weight: 500;
  color: #15803d;
}

.file-size {
  font-size: 0.75rem;
  color: #6b7280;
}

.clear-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.clear-btn:hover {
  background: #fecaca;
}

/* 오류 메시지 */
.error-message {
  padding: 0.75rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  font-size: 0.875rem;
}

/* 미리보기 섹션 */
.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 6px;
}

.preview-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.format-badge {
  background: #10b981;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.preview-summary {
  font-size: 0.875rem;
  color: #6b7280;
}

.preview-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem 0.75rem;
  background: #374151;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.action-btn:hover {
  background: #1f2937;
}

/* 미리보기 콘텐츠 */
.preview-content {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
  max-height: 300px;
  overflow-y: auto;
  /* Vue Flow 줌 방지 */
  pointer-events: auto;
}

.preview-content.nodrag.nozoom {
  /* 스크롤 이벤트가 Vue Flow로 전파되지 않도록 */
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
  /* Vue Flow 줌 방지 */
  pointer-events: auto;
}

.form-textarea.nodrag.nozoom {
  /* 텍스트 영역에서 Vue Flow 줌 방지 */
  pointer-events: auto;
  touch-action: pan-y;
}

.table-preview {
  overflow-x: auto;
}

.table-info {
  padding: 0.5rem;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
  text-align: center;
}

.table-summary {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.data-table td {
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  background: white;
}

.data-table tr:nth-child(even) td {
  background: #f9fafb;
}

.preview-note {
  padding: 0.5rem;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 0.75rem;
  text-align: center;
}

.json-preview {
  padding: 1rem;
  background: #1f2937;
  color: #f9fafb;
}

.json-content {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.75rem;
  line-height: 1.4;
  margin: 0;
  white-space: pre-wrap;
}

.text-preview {
  padding: 1rem;
  background: #f9fafb;
}

.text-content {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;
  color: #374151;
}

/* 텍스트 편집 섹션 */
.text-section {
  margin-top: 1rem;
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
  background: white;
}

.form-textarea:focus {
  outline: none;
  border-color: #374151;
  box-shadow: 0 0 0 3px rgba(55, 65, 81, 0.1);
  background-color: white;
}

.text-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.char-count {
  font-weight: 500;
}

.format-info {
  color: #10b981;
}
</style>
