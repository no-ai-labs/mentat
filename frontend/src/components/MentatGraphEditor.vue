<template>
  <div class="mentat-graph-editor">
    <!-- 상단 툴바 -->
    <div class="toolbar">
      <h2>🧠 Mentat Graph Editor</h2>
      <div class="toolbar-actions">
        <button 
          @click="showDagGenerator" 
          class="btn btn-primary"
          title="자연어로 DAG 자동 생성"
        >
          ✨ Generate DAG
        </button>
        <button 
          @click="toggleChat" 
          class="btn btn-secondary"
          title="채팅 UI 열기/닫기"
        >
          💬 Chat
        </button>
        <button @click="clearGraph" class="btn btn-danger">🗑️ Clear All</button>
        <button @click="fitView" class="btn btn-secondary">📐 Fit View</button>
      </div>
    </div>

    <!-- 메인 컨테이너 -->
    <div class="main-container">
      <!-- 그래프 컨테이너 -->
      <div class="graph-container" :class="{ 'with-chat': showChat }">
      <VueFlow
        v-model:nodes="nodes"
        v-model:edges="edges"
        :default-viewport="{ zoom: 1.2 }"
        :node-types="nodeTypes"
        :edge-types="edgeTypes"
        :pan-on-drag="true"
        :pan-on-scroll="false"
        :zoom-on-scroll="true"
        :zoom-on-double-click="true"
        :select-nodes-on-drag="false"
        :nodes-draggable="true"
        :nodes-connectable="true"
        :elements-selectable="true"
        :edges-selectable="true"
        :nodes-selectable="true"
        :snap-to-grid="false"
        :snap-grid="[15, 15]"
        @connect="onConnect"
        @edge-click="onEdgeClick"
        @selection-change="onSelectionChange"
        @node-click="onNodeClick"
        fit-view
        class="graph-flow"
      >
        <Background variant="dots" :gap="20" :size="1" />
        <MiniMap />
        <Controls />
      </VueFlow>
      </div>

      <!-- 채팅 UI -->
      <div v-if="showChat" class="chat-container">
        <div class="chat-header">
          <h3>💬 Mentat Chat</h3>
          <button @click="toggleChat" class="close-chat-btn">×</button>
        </div>
        
        <div class="chat-messages" ref="chatMessages_ref">
          <div 
            v-for="message in chatMessages" 
            :key="message.id"
            class="message"
            :class="{ 'user': message.type === 'user', 'ai': message.type === 'ai' }"
          >
            <div class="message-avatar">
              <span v-if="message.type === 'user'">👤</span>
              <span v-else>🤖</span>
            </div>
            <div class="message-content">
              <div class="message-text">{{ message.text }}</div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>
        </div>
        
        <div class="chat-input-container">
          <input 
            v-model="chatInput"
            @keypress.enter="sendMessage"
            placeholder="DAG에 대해 질문하거나 명령을 입력하세요..."
            class="chat-input"
          >
          <button @click="sendMessage" class="send-btn" :disabled="!chatInput.trim()">
            📤
          </button>
        </div>
      </div>
    </div>

    <!-- 우측 노드 생성 패널 -->
    <div class="node-panel">
      <h3>🎯 Add Nodes</h3>
      <div class="node-buttons">
        <button @click="addPromptNode" class="node-btn prompt-btn">
          <span class="node-icon">💭</span>
          <span class="node-label">Prompt</span>
        </button>
        <button @click="addDataNode" class="node-btn data-btn">
          <span class="node-icon">📄</span>
          <span class="node-label">Data</span>
        </button>
        <button @click="addAgentNode" class="node-btn agent-btn">
          <span class="node-icon">🤖</span>
          <span class="node-label">Agent</span>
        </button>
        <button @click="addActionNode" class="node-btn action-btn">
          <span class="node-icon">⚡</span>
          <span class="node-label">Action</span>
        </button>
        <button @click="addBranchNode" class="node-btn branch-btn">
          <span class="node-icon">🔀</span>
          <span class="node-label">Branch</span>
        </button>
        <button @click="addMergeNode" class="node-btn merge-btn">
          <span class="node-icon">🔗</span>
          <span class="node-label">Merge</span>
        </button>
        <button @click="addResultNode" class="node-btn result-btn">
          <span class="node-icon">✅</span>
          <span class="node-label">Result</span>
        </button>
      </div>
    </div>

    <!-- DAG 생성 모달 -->
    <div v-if="showDagGeneratorModal" class="dag-generator-modal">
      <div class="modal-overlay" @click="closeDagGenerator"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>✨ DAG 자동 생성</h3>
          <button @click="closeDagGenerator" class="close-btn">×</button>
      </div>
        
        <div class="modal-body">
          <div class="prompt-section">
            <label for="dagPrompt">원하는 워크플로우를 자연어로 설명해주세요:</label>
            <textarea 
              id="dagPrompt"
              v-model="dagPrompt"
              placeholder="예: 뉴스 기사를 가져와서 요약해주는 시스템을 만들어줘"
              rows="4"
              class="prompt-input"
            ></textarea>
      </div>
      
          <div class="options-section">
            <h4>⚙️ 생성 옵션:</h4>
            <div class="option-group">
              <label>
                <input 
                  type="range" 
                  v-model="dagOptions.maxNodes" 
                  min="3" 
                  max="15" 
                  step="1"
                >
                최대 노드 수: {{ dagOptions.maxNodes }}
              </label>
        </div>
        </div>
        </div>

        <div class="modal-footer">
          <button @click="closeDagGenerator" class="btn btn-secondary">취소</button>
          <button 
            @click="generateDag" 
            :disabled="!dagPrompt.trim() || isGenerating"
            class="btn btn-primary"
          >
            {{ isGenerating ? '생성 중...' : '✨ DAG 생성' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, markRaw, nextTick } from 'vue'
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { MiniMap } from '@vue-flow/minimap'
import { Controls } from '@vue-flow/controls'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

// 커스텀 노드 컴포넌트들
import PromptNode from './nodes/PromptNode.vue'
import DataNode from './nodes/DataNode.vue'
import AgentNode from './nodes/AgentNode.vue'
import ActionNode from './nodes/ActionNode.vue'
import ResultNode from './nodes/ResultNode.vue'
import BranchNode from './nodes/BranchNode.vue'
import MergeNode from './nodes/MergeNode.vue'

// DAG 생성 유틸리티
import { generateDagFromPrompt, convertToVueFlowFormat, getErrorMessage, PROMPT_EXAMPLES } from '../utils/dagGeneratorApi.js'

// Bison 채팅 시스템
import { chatWithBison, detectDagIntent, delegateToGPT, formatChatResponse, getChatErrorMessage } from '../utils/bisonChatApi.js'

// 노드 타입 등록
const nodeTypes = reactive({
  promptNode: markRaw(PromptNode),
  dataNode: markRaw(DataNode),
  agentNode: markRaw(AgentNode),
  actionNode: markRaw(ActionNode),
  resultNode: markRaw(ResultNode),
  branchNode: markRaw(BranchNode),
  mergeNode: markRaw(MergeNode),
})

// 엣지 타입 (기본 사용)
const edgeTypes = reactive({})

// 반응형 데이터
const nodes = ref([])
const edges = ref([])
const selectedEdge = ref(null)
const selectedNode = ref(null)

// 채팅 관련 상태
const showChat = ref(false)
const chatMessages = ref([
  {
    id: 1,
    type: 'ai',
    text: '안녕하세요! Mentat DAG 에디터입니다. 어떤 도움이 필요하신가요?',
    timestamp: new Date()
  }
])
const chatInput = ref('')
const chatMessages_ref = ref(null)

// DAG 생성 관련 상태
const showDagGeneratorModal = ref(false)
const dagPrompt = ref('')
const isGenerating = ref(false)
const dagOptions = ref({
  maxNodes: 8,
  preferredModel: 'gpt-4',
  includeExamples: true
})

// 노드 ID 카운터
let nodeIdCounter = 0

// 지능형 레이아웃 시스템
const getNextPosition = (nodeType) => {
  const existingNodes = nodes.value.filter(n => n.type === nodeType)
  const baseX = 150 + (existingNodes.length * 350)
  const baseY = 150 + (existingNodes.length * 200)
  
  const offsetX = Math.random() * 50 - 25
  const offsetY = Math.random() * 50 - 25
  
  return {
    x: baseX + offsetX,
    y: baseY + offsetY
  }
}

// 브랜치 노드 주변 자동 정렬
const arrangeAroundBranch = (branchNodeId) => {
  const branchNode = nodes.value.find(n => n.id === branchNodeId)
  if (!branchNode) return
  
  // 브랜치 노드에 연결된 자식 노드들 찾기
  const childEdges = edges.value.filter(e => e.source === branchNodeId)
  const childNodes = childEdges.map(e => nodes.value.find(n => n.id === e.target)).filter(Boolean)
  
  if (childNodes.length > 0) {
    const branchX = branchNode.position.x + 300
    const branchY = branchNode.position.y
    const spreadY = 200
    
    childNodes.forEach((childNode, index) => {
      const offset = (index - (childNodes.length - 1) / 2) * spreadY
      childNode.position.x = branchX
      childNode.position.y = branchY + offset
    })
    
    addChatMessage('ai', `🎯 브랜치 노드 주변 자동 정렬 완료: ${childNodes.length}개 노드`)
  }
}

// 머지 노드 주변 자동 정렬
const arrangeAroundMerge = (mergeNodeId) => {
  const mergeNode = nodes.value.find(n => n.id === mergeNodeId)
  if (!mergeNode) return
  
  // 머지 노드로 들어오는 부모 노드들 찾기
  const parentEdges = edges.value.filter(e => e.target === mergeNodeId)
  const parentNodes = parentEdges.map(e => nodes.value.find(n => n.id === e.source)).filter(Boolean)
  
  if (parentNodes.length > 0) {
    const mergeX = mergeNode.position.x - 300
    const mergeY = mergeNode.position.y
    const spreadY = 150
    
    parentNodes.forEach((parentNode, index) => {
      const offset = (index - (parentNodes.length - 1) / 2) * spreadY
      parentNode.position.x = mergeX
      parentNode.position.y = mergeY + offset
    })
    
    addChatMessage('ai', `🎯 머지 노드 주변 자동 정렬 완료: ${parentNodes.length}개 노드`)
  }
}

// 노드 추가 함수들
const addPromptNode = () => {
  const position = getNextPosition('promptNode')
  const newNode = {
    id: `prompt-${++nodeIdCounter}`,
    type: 'promptNode',
    position,
    data: {
      prompt: '새로운 프롬프트를 입력하세요...',
      inputRefs: [],
      id: `prompt-${nodeIdCounter}`
    }
  }
  nodes.value.push(newNode)
  addChatMessage('ai', `Prompt 노드가 추가되었습니다: ${newNode.id}`)
}

const addDataNode = () => {
  const position = getNextPosition('dataNode')
  const newNode = {
    id: `data-${++nodeIdCounter}`,
    type: 'dataNode',
    position,
    data: {
      rawContent: '새로운 데이터를 입력하세요...',
      id: `data-${nodeIdCounter}`
    }
  }
  nodes.value.push(newNode)
  addChatMessage('ai', `Data 노드가 추가되었습니다: ${newNode.id}`)
}

const addAgentNode = () => {
  const position = getNextPosition('agentNode')
  const newNode = {
    id: `agent-${++nodeIdCounter}`,
    type: 'agentNode',
    position,
    data: {
      agent: 'gpt-4',
      prompt: '에이전트 프롬프트를 입력하세요...',
      id: `agent-${nodeIdCounter}`
    }
  }
  nodes.value.push(newNode)
  addChatMessage('ai', `Agent 노드가 추가되었습니다: ${newNode.id}`)
}

const addActionNode = () => {
  const position = getNextPosition('actionNode')
  const newNode = {
    id: `action-${++nodeIdCounter}`,
    type: 'actionNode',
    position,
    data: {
      action: 'api_call',
      prompt: '액션을 설정하세요...',
      id: `action-${nodeIdCounter}`
    }
  }
  nodes.value.push(newNode)
  addChatMessage('ai', `Action 노드가 추가되었습니다: ${newNode.id}`)
}

const addBranchNode = () => {
  const position = getNextPosition('branchNode')
  const newNode = {
    id: `branch-${++nodeIdCounter}`,
    type: 'branchNode',
    position,
    data: {
      condition: 'if condition',
      branches: ['true', 'false'],
      id: `branch-${nodeIdCounter}`
    }
  }
  nodes.value.push(newNode)
  addChatMessage('ai', `Branch 노드가 추가되었습니다: ${newNode.id}`)
}

const addMergeNode = () => {
  const position = getNextPosition('mergeNode')
  const newNode = {
    id: `merge-${++nodeIdCounter}`,
    type: 'mergeNode',
    position,
    data: {
      strategy: 'combine',
      description: 'Merge multiple inputs',
      inputs: ['input1', 'input2'],
      id: `merge-${nodeIdCounter}`
    }
  }
  nodes.value.push(newNode)
  addChatMessage('ai', `Merge 노드가 추가되었습니다: ${newNode.id}`)
}

const addResultNode = () => {
  const position = getNextPosition('resultNode')
  const newNode = {
    id: `result-${++nodeIdCounter}`,
    type: 'resultNode',
    position,
    data: {
      output: '결과가 여기에 표시됩니다...',
      id: `result-${nodeIdCounter}`
    }
  }
  nodes.value.push(newNode)
  addChatMessage('ai', `Result 노드가 추가되었습니다: ${newNode.id}`)
}

// 멘타트 연결 제약 검증
const validateConnection = (sourceNode, targetNode) => {
  const sourceType = sourceNode.type
  const targetType = targetNode.type
  
  // 규칙 1: promptNode → promptNode (Auto-upgrade)
  if (sourceType === 'promptNode' && targetType === 'promptNode') {
    return {
      valid: false,
      autoUpgrade: 'agentNode',
      message: 'promptNode → promptNode 연결은 허용되지 않습니다. 두 번째 노드를 agentNode로 업그레이드합니다.'
    }
  }
  
  // 규칙 2: promptNode → branchNode (Auto-upgrade)
  if (sourceType === 'promptNode' && targetType === 'branchNode') {
    return {
      valid: false,
      autoUpgrade: 'agentNode',
      message: 'promptNode → branchNode 연결은 허용되지 않습니다. promptNode를 agentNode로 업그레이드합니다.'
    }
  }
  
  // 규칙 3: dataNode → promptNode (Auto-upgrade)
  if (sourceType === 'dataNode' && targetType === 'promptNode') {
    return {
      valid: false,
      autoUpgrade: 'agentNode',
      message: 'dataNode → promptNode 연결은 허용되지 않습니다. promptNode를 agentNode로 업그레이드합니다.'
    }
  }
  
  // 규칙 4: dataNode → resultNode (Auto-insert agentNode)
  if (sourceType === 'dataNode' && targetType === 'resultNode') {
    return {
      valid: false,
      autoInsert: 'agentNode',
      message: 'dataNode → resultNode 연결은 허용되지 않습니다. 중간에 agentNode를 삽입합니다.'
    }
  }
  
  // 규칙 5: resultNode → actionNode (Both must be children of agentNode)
  if (sourceType === 'resultNode' && targetType === 'actionNode') {
    return {
      valid: false,
      message: 'resultNode → actionNode 연결은 허용되지 않습니다. 둘 다 agentNode의 자식이어야 합니다.'
    }
  }
  
  // 규칙 6: Any node → promptNode (except at start)
  if (targetType === 'promptNode' && sourceType !== 'promptNode') {
    return {
      valid: false,
      autoUpgrade: 'agentNode',
      message: 'promptNode는 워크플로우 시작점에서만 사용 가능합니다. agentNode로 업그레이드합니다.'
    }
  }
  
  // 규칙 7: branchNode → branchNode (Not supported)
  if (sourceType === 'branchNode' && targetType === 'branchNode') {
    return {
      valid: false,
      message: '중첩된 브랜치는 아직 지원되지 않습니다.'
    }
  }
  
  // 규칙 8: mergeNode → mergeNode (Not supported)
  if (sourceType === 'mergeNode' && targetType === 'mergeNode') {
    return {
      valid: false,
      message: '중첩된 머지는 아직 지원되지 않습니다.'
    }
  }
  
  // 규칙 9: promptNode → resultNode (Allowed for simple one-shot)
  if (sourceType === 'promptNode' && targetType === 'resultNode') {
    return { valid: true, message: '간단한 원샷 프롬프트 허용' }
  }
  
  // 규칙 11: dataNode is input-only
  if (targetType === 'dataNode') {
    return {
      valid: false,
      message: 'dataNode는 입력 전용입니다. 데이터를 저장하려면 actionNode를 사용하세요.'
    }
  }
  
  // 규칙 12: branchNode must receive input from agentNode
  if (targetType === 'branchNode' && sourceType !== 'agentNode') {
    return {
      valid: false,
      autoUpgrade: 'agentNode',
      message: 'branchNode는 agentNode로부터 입력을 받아야 합니다.'
    }
  }
  
  // 기본적으로 허용되는 연결들
  const allowedConnections = [
    'promptNode → agentNode',
    'promptNode → resultNode',
    'dataNode → agentNode',
    'agentNode → actionNode',
    'agentNode → resultNode',
    'agentNode → branchNode',
    'agentNode → agentNode',
    'actionNode → resultNode',
    'actionNode → agentNode',
    'branchNode → agentNode',
    'branchNode → actionNode',
    'branchNode → resultNode',
    'mergeNode → agentNode',
    'mergeNode → resultNode',
    'mergeNode → actionNode',
    'resultNode → agentNode' // For feedback loops
  ]
  
  const connectionKey = `${sourceType} → ${targetType}`
  
  if (allowedConnections.includes(connectionKey)) {
    return { valid: true, message: `허용된 연결: ${connectionKey}` }
  }
  
  return {
    valid: false,
    message: `허용되지 않는 연결: ${connectionKey}`
  }
}

// 자동 업그레이드 수행
const performAutoUpgrade = (nodeId, newType) => {
  const node = nodes.value.find(n => n.id === nodeId)
  if (!node) return false
  
  const oldType = node.type
  node.type = newType
  
  // 새로운 타입에 맞는 기본 데이터 설정
  switch (newType) {
    case 'agentNode':
      node.data = {
        ...node.data,
        agent: 'gpt-4',
        prompt: node.data.prompt || '에이전트 프롬프트를 입력하세요...'
      }
      break
  }
  
  addChatMessage('ai', `🔄 자동 업그레이드: ${oldType} → ${newType} (${nodeId})`)
  return true
}

// 자동 노드 삽입 수행
const performAutoInsert = (sourceNode, targetNode, insertType) => {
  // 중간 위치 계산
  const midX = (sourceNode.position.x + targetNode.position.x) / 2
  const midY = (sourceNode.position.y + targetNode.position.y) / 2
  
  // 새로운 중간 노드 생성
  const newNode = {
    id: `auto-${insertType}-${++nodeIdCounter}`,
    type: insertType,
    position: { x: midX, y: midY },
    data: {}
  }
  
  // 노드 타입별 기본 데이터 설정
  switch (insertType) {
    case 'agentNode':
      newNode.data = {
        agent: 'gpt-4',
        prompt: '자동 삽입된 에이전트 - 데이터를 처리합니다',
        id: newNode.id
      }
      break
  }
  
  // 노드 추가
  nodes.value.push(newNode)
  
  addChatMessage('ai', `🔄 자동 노드 삽입: ${sourceNode.type} → ${insertType} → ${targetNode.type}`)
  
  return newNode
}

// 연결 처리 (제약 검증 포함)
const onConnect = (params) => {
  if (params.source === params.target) {
    addChatMessage('ai', '❌ 자기 자신과의 연결은 허용되지 않습니다.')
    return
  }
  
  const existingEdge = edges.value.find(edge => 
    edge.source === params.source && edge.target === params.target
  )
  
  if (existingEdge) {
    addChatMessage('ai', '❌ 이미 존재하는 연결입니다.')
    return
  }
  
  const sourceNode = nodes.value.find(n => n.id === params.source)
  const targetNode = nodes.value.find(n => n.id === params.target)
  
  if (!sourceNode || !targetNode) {
    addChatMessage('ai', '❌ 소스 또는 타겟 노드를 찾을 수 없습니다.')
    return
  }
  
  // 멘타트 연결 제약 검증
  const validation = validateConnection(sourceNode, targetNode)
  
  if (!validation.valid) {
    if (validation.autoUpgrade) {
      // 자동 업그레이드 수행
      const upgraded = performAutoUpgrade(targetNode.id, validation.autoUpgrade)
      if (upgraded) {
        addChatMessage('ai', `🔄 ${validation.message}`)
        // 업그레이드 후 연결 재시도
        setTimeout(() => {
          onConnect(params)
        }, 100)
        return
      }
    } else if (validation.autoInsert) {
      // 자동 노드 삽입 수행
      const insertedNode = performAutoInsert(sourceNode, targetNode, validation.autoInsert)
      if (insertedNode) {
        addChatMessage('ai', `🔄 ${validation.message}`)
        
        // 원래 연결 대신 두 개의 연결 생성: source → inserted → target
        setTimeout(() => {
          // 첫 번째 연결: source → inserted
          onConnect({
            source: params.source,
            target: insertedNode.id,
            sourceHandle: params.sourceHandle,
            targetHandle: null
          })
          
          // 두 번째 연결: inserted → target  
          setTimeout(() => {
            onConnect({
              source: insertedNode.id,
              target: params.target,
              sourceHandle: null,
              targetHandle: params.targetHandle
            })
          }, 100)
        }, 100)
        return
      }
    } else {
      addChatMessage('ai', `❌ ${validation.message}`)
      return
    }
  }
  
  // 연결 생성
  const newEdge = {
    id: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    source: params.source,
    target: params.target,
    sourceHandle: params.sourceHandle,
    targetHandle: params.targetHandle,
    type: 'smoothstep',
    animated: true,
    style: { 
      stroke: '#374151', 
      strokeWidth: 3,
      strokeDasharray: '5,5'
    }
  }
  
  edges.value.push(newEdge)
  updateNodeConnections(params.source, params.target)
  
  // 지능형 레이아웃 자동 적용
  if (sourceNode.type === 'branchNode') {
    setTimeout(() => arrangeAroundBranch(sourceNode.id), 200)
  }
  if (targetNode.type === 'mergeNode') {
    setTimeout(() => arrangeAroundMerge(targetNode.id), 200)
  }
  
  addChatMessage('ai', `✅ ${validation.message}: ${sourceNode.type} → ${targetNode.type}`)
}

// 엣지 클릭 처리
const onEdgeClick = (event) => {
  const edge = event.edge
  if (!edge) return
  
  if (confirm(`연결을 삭제하시겠습니까?\n${edge.source} → ${edge.target}`)) {
    const edgeIndex = edges.value.findIndex(e => e.id === edge.id)
    if (edgeIndex !== -1) {
      edges.value.splice(edgeIndex, 1)
      removeNodeConnections(edge.source, edge.target)
      addChatMessage('ai', `연결이 삭제되었습니다: ${edge.source} → ${edge.target}`)
    }
  }
}

// 노드 클릭 처리
const onNodeClick = (event) => {
  const clickedNode = event.node
  if (clickedNode) {
    selectedNode.value = clickedNode
    selectedEdge.value = null
    addChatMessage('ai', `노드 선택됨: ${clickedNode.id} (${clickedNode.type})`)
  }
}

// 선택 변경 처리
const onSelectionChange = (selection) => {
  if (selection.edges && selection.edges.length > 0) {
    selectedEdge.value = selection.edges[0]
    selectedNode.value = null
  } else {
    selectedEdge.value = null
  }
  
  if (selection.nodes && selection.nodes.length > 0) {
    selectedNode.value = selection.nodes[0]
    selectedEdge.value = null
  } else if (!selection.edges || selection.edges.length === 0) {
    selectedNode.value = null
  }
}

// 연결 정보 업데이트
const updateNodeConnections = (sourceId, targetId) => {
  const sourceNode = nodes.value.find(n => n.id === sourceId)
  const targetNode = nodes.value.find(n => n.id === targetId)
  
  if (sourceNode && targetNode) {
    if (!targetNode.data.inputRefs) {
      targetNode.data.inputRefs = []
    }
    if (!targetNode.data.inputRefs.includes(sourceId)) {
      targetNode.data.inputRefs.push(sourceId)
    }
    
    if (!sourceNode.data.usedBy) {
      sourceNode.data.usedBy = []
    }
    if (!sourceNode.data.usedBy.includes(targetId)) {
      sourceNode.data.usedBy.push(targetId)
    }
  }
}

// 연결 해제 처리
const removeNodeConnections = (sourceId, targetId) => {
  const sourceNode = nodes.value.find(n => n.id === sourceId)
  const targetNode = nodes.value.find(n => n.id === targetId)
  
  if (sourceNode && targetNode) {
    if (targetNode.data.inputRefs) {
      targetNode.data.inputRefs = targetNode.data.inputRefs.filter(id => id !== sourceId)
    }
    
    if (sourceNode.data.usedBy) {
      sourceNode.data.usedBy = sourceNode.data.usedBy.filter(id => id !== targetId)
    }
  }
}

// 그래프 초기화
const clearGraph = () => {
  nodes.value = []
  edges.value = []
  nodeIdCounter = 0
  addChatMessage('ai', '그래프가 초기화되었습니다.')
}

// 뷰 맞춤
const fitView = () => {
  console.log('Fit view triggered')
  addChatMessage('ai', '화면이 맞춤 조정되었습니다.')
}

// 채팅 관련 함수들
const toggleChat = () => {
  showChat.value = !showChat.value
  // 자동 스크롤 제거
  // if (showChat.value) {
  //   nextTick(() => {
  //     scrollToBottom()
  //   })
  // }
}

const addChatMessage = (type, text) => {
  const message = {
    id: Date.now() + Math.random(),
    type,
    text,
    timestamp: new Date()
  }
  chatMessages.value.push(message)
  // 자동 스크롤 제거
  // nextTick(() => {
  //   scrollToBottom()
  // })
}

const sendMessage = async () => {
  if (!chatInput.value.trim()) return
  
  const userMessage = chatInput.value.trim()
  addChatMessage('user', userMessage)
  chatInput.value = ''
  
  // DAG 생성 의도 감지
  if (detectDagIntent(userMessage)) {
    addChatMessage('ai', '워크플로우 생성 요청을 감지했습니다! GPT에게 DAG 생성을 위임할까요? 🤖✨')
    
    // GPT 위임 버튼 추가 (임시로 자동 실행)
    setTimeout(async () => {
      try {
        addChatMessage('ai', '🔄 GPT에게 DAG 생성을 위임하고 있습니다...')
        
        const dagResult = await delegateToGPT(userMessage)
        
        if (dagResult.success) {
          // 기존 그래프 클리어
          if (nodes.value.length > 0) {
            clearGraph()
          }
          
          // 새로운 DAG 적용
          const { nodes: newNodes, edges: newEdges, metadata } = convertToVueFlowFormat(dagResult)
          
          const maxId = Math.max(...newNodes.map(n => {
            const match = n.id.match(/\d+/)
            return match ? parseInt(match[0]) : 0
          }), 0)
          nodeIdCounter = maxId
          
          nodes.value = newNodes
          edges.value = newEdges
          updateNodeConnectionsFromEdges(newEdges)
          
          addChatMessage('ai', `✅ GPT가 워크플로우를 생성했습니다!\n📊 노드: ${newNodes.length}개\n🔗 연결: ${newEdges.length}개\n📝 ${metadata.description}`)
        } else {
          addChatMessage('ai', '❌ DAG 생성에 실패했습니다. 다시 시도해주세요.')
        }
      } catch (error) {
        addChatMessage('ai', `❌ GPT 위임 중 오류가 발생했습니다: ${getChatErrorMessage(error)}`)
      }
    }, 1000)
    
    return
  }
  
  // 기존 명령어 처리 확인
  if (isSimpleCommand(userMessage)) {
    setTimeout(() => {
      handleChatCommand(userMessage)
    }, 500)
    return
  }
  
  // Bison과 일반 채팅
  try {
    addChatMessage('ai', '🤔 생각 중...')
    
    const bisonResponse = await chatWithBison(userMessage)
    
    // 마지막 "생각 중..." 메시지 제거
    chatMessages.value = chatMessages.value.filter(msg => msg.text !== '🤔 생각 중...')
    
    const formattedResponse = formatChatResponse(bisonResponse.response || bisonResponse.message)
    addChatMessage('ai', formattedResponse)
    
  } catch (error) {
    // 마지막 "생각 중..." 메시지 제거
    chatMessages.value = chatMessages.value.filter(msg => msg.text !== '🤔 생각 중...')
    
    addChatMessage('ai', getChatErrorMessage(error))
  }
}

// 간단한 명령어인지 확인하는 함수
const isSimpleCommand = (message) => {
  const lowerMessage = message.toLowerCase()
  const simpleCommands = [
    '노드 추가', 'add node', 'clear', '초기화', 
    'dag 생성', '상태', 'status', '규칙', 'rule'
  ]
  
  return simpleCommands.some(cmd => lowerMessage.includes(cmd))
}

const handleChatCommand = (message) => {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('노드 추가') || lowerMessage.includes('add node')) {
    if (lowerMessage.includes('prompt')) {
      addPromptNode()
    } else if (lowerMessage.includes('data')) {
      addDataNode()
    } else if (lowerMessage.includes('agent')) {
      addAgentNode()
    } else if (lowerMessage.includes('action')) {
      addActionNode()
    } else if (lowerMessage.includes('branch')) {
      addBranchNode()
    } else if (lowerMessage.includes('merge')) {
      addMergeNode()
    } else if (lowerMessage.includes('result')) {
      addResultNode()
    } else {
      addChatMessage('ai', '어떤 노드를 추가하시겠습니까?\n- prompt: 간단한 원샷 프롬프트\n- data: 데이터 입력\n- agent: 다단계 추론 및 처리\n- action: API 호출, 파일 저장 등\n- branch: 조건부 분기\n- merge: 여러 플로우 병합\n- result: 결과 시각화')
    }
  } else if (lowerMessage.includes('clear') || lowerMessage.includes('초기화')) {
    clearGraph()
  } else if (lowerMessage.includes('dag') && lowerMessage.includes('생성')) {
    showDagGenerator()
  } else if (lowerMessage.includes('상태') || lowerMessage.includes('status')) {
    addChatMessage('ai', `현재 상태: 노드 ${nodes.value.length}개, 연결 ${edges.value.length}개`)
  } else if (lowerMessage.includes('규칙') || lowerMessage.includes('rule')) {
    addChatMessage('ai', '🎯 멘타트 연결 규칙:\n\n✅ 허용되는 연결:\n- promptNode → resultNode (원샷)\n- promptNode → agentNode\n- dataNode → agentNode\n- agentNode → actionNode/resultNode/branchNode\n- branchNode → agentNode/actionNode/resultNode\n- mergeNode → agentNode/actionNode/resultNode\n\n❌ 금지된 연결 (자동 업그레이드):\n- promptNode → promptNode → agentNode\n- dataNode → promptNode → agentNode\n- Any → promptNode → agentNode\n\n🔄 사이클 허용 (피드백 루프)')
  } else {
    addChatMessage('ai', '죄송합니다. 이해하지 못했습니다. 다음 명령어를 사용해보세요:\n- "[노드타입] 노드 추가"\n- "그래프 초기화"\n- "DAG 생성"\n- "상태 확인"\n- "규칙 설명"')
  }
}

const scrollToBottom = () => {
  // 자동 스크롤 기능 비활성화
  // if (chatMessages_ref.value) {
  //   chatMessages_ref.value.scrollTop = chatMessages_ref.value.scrollHeight
  // }
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('ko-KR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// DAG 생성 관련 함수들
const showDagGenerator = () => {
  showDagGeneratorModal.value = true
  dagPrompt.value = ''
  addChatMessage('ai', 'DAG 생성 모달이 열렸습니다.')
}

const closeDagGenerator = () => {
  showDagGeneratorModal.value = false
  dagPrompt.value = ''
  isGenerating.value = false
}

const generateDag = async () => {
  if (!dagPrompt.value.trim()) {
    alert('프롬프트를 입력해주세요!')
    return
  }
  
  isGenerating.value = true
  addChatMessage('ai', `DAG 생성 중: "${dagPrompt.value}"`)
  
  try {
    if (nodes.value.length > 0) {
      const confirmed = confirm('기존 그래프를 지우고 새로 생성하시겠습니까?')
      if (!confirmed) {
        isGenerating.value = false
    return
      }
      clearGraph()
    }
    
    const generatedDag = await generateDagFromPrompt(dagPrompt.value, dagOptions.value)
    const { nodes: newNodes, edges: newEdges, metadata } = convertToVueFlowFormat(generatedDag)
    
    const maxId = Math.max(...newNodes.map(n => {
      const match = n.id.match(/\d+/)
      return match ? parseInt(match[0]) : 0
    }), 0)
    nodeIdCounter = maxId
    
    nodes.value = newNodes
    edges.value = newEdges
    
    updateNodeConnectionsFromEdges(newEdges)
    
    addChatMessage('ai', `✅ DAG 생성 완료!\n📊 노드: ${newNodes.length}개\n🔗 연결: ${newEdges.length}개\n📝 ${metadata.description}`)
    
    closeDagGenerator()
    
    await nextTick()
    fitView()
    
  } catch (error) {
    console.error('❌ DAG 생성 실패:', error)
    const errorMessage = getErrorMessage(error)
    addChatMessage('ai', `❌ DAG 생성 실패: ${errorMessage}`)
  } finally {
    isGenerating.value = false
  }
}

// 엣지 정보로부터 노드 연결 정보 업데이트
const updateNodeConnectionsFromEdges = (edges) => {
  nodes.value.forEach(node => {
    if (!node.data.inputRefs) node.data.inputRefs = []
    if (!node.data.usedBy) node.data.usedBy = []
    node.data.inputRefs.length = 0
    node.data.usedBy.length = 0
  })
  
  edges.forEach(edge => {
    const sourceNode = nodes.value.find(n => n.id === edge.source)
    const targetNode = nodes.value.find(n => n.id === edge.target)
    
    if (sourceNode && targetNode) {
      if (!targetNode.data.inputRefs.includes(edge.source)) {
        targetNode.data.inputRefs.push(edge.source)
      }
      
      if (!sourceNode.data.usedBy.includes(edge.target)) {
        sourceNode.data.usedBy.push(edge.target)
      }
    }
  })
}

// 컴포넌트 마운트 시 초기 설정
onMounted(() => {
  console.log('MentatGraphEditor mounted')
  
  // 초기 노드들 추가
  addPromptNode()
  addDataNode()
  addAgentNode()
  
  // /generate 명령어 이벤트 리스너 등록
  window.addEventListener('openDagGenerator', showDagGenerator)
})

// 컴포넌트 언마운트 시 이벤트 리스너 제거
onBeforeUnmount(() => {
  window.removeEventListener('openDagGenerator', showDagGenerator)
})
</script>

<style scoped>
.mentat-graph-editor {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8fafc;
  position: relative;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  z-index: 20;
}

.toolbar h2 {
  margin: 0;
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: 600;
}

.toolbar-actions {
  display: flex;
  gap: 0.5rem;
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

.btn-secondary {
  background: #64748b;
  color: white;
}

.btn-secondary:hover {
  background: #475569;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.main-container {
  flex: 1;
  display: flex;
  position: relative;
}

.graph-container {
  flex: 1;
  position: relative;
  background: #f8fafc;
  transition: all 0.3s ease;
}

.graph-container.with-chat {
  flex: 0 0 calc(100% - 400px);
}

.graph-flow {
  width: 100%;
  height: 100%;
}

/* 채팅 UI 스타일 */
.chat-container {
  width: 400px;
  background: white;
  border-left: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.chat-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.125rem;
  font-weight: 600;
}

.close-chat-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
}

.close-chat-btn:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.message.user .message-avatar {
  background: #374151;
  color: white;
}

.message.ai .message-avatar {
  background: #10b981;
  color: white;
}

.message-content {
  max-width: 70%;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.message.user .message-content {
  align-items: flex-end;
}

.message-text {
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  background: #f1f5f9;
  color: #1e293b;
  font-size: 0.875rem;
  line-height: 1.4;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.message.user .message-text {
  background: #374151;
  color: white;
}

.message-time {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.chat-input-container {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.chat-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  transition: all 0.2s ease;
}

.chat-input:focus {
  outline: none;
  border-color: #374151;
  box-shadow: 0 0 0 3px rgba(55, 65, 81, 0.1);
}

.send-btn {
  padding: 0.75rem 1rem;
  background: #374151;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.send-btn:hover:not(:disabled) {
  background: #1f2937;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 우측 노드 생성 패널 */
.node-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 300px;
  height: 100%;
  background: white;
  border-left: 1px solid #e2e8f0;
  padding: 1rem;
  overflow-y: auto;
  z-index: 10;
}

.node-panel h3 {
  margin: 0 0 1rem 0;
  color: #1e293b;
  font-size: 1.125rem;
  font-weight: 600;
}

.node-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.node-btn {
  padding: 0.75rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.node-btn:hover {
  background: #f1f5f9;
  border-color: #374151;
}

.node-btn-title {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.node-btn-desc {
  font-size: 0.75rem;
  color: #64748b;
}

/* DAG 생성 모달 스타일 */
.dag-generator-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  z-index: 1001;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.modal-body {
  padding: 1.5rem;
}

.prompt-section {
  margin-bottom: 1.5rem;
}

.prompt-section label {
  display: block;
  margin-bottom: 0.5rem;
  color: #374151;
  font-weight: 500;
}

.prompt-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

.prompt-input:focus {
  outline: none;
      border-color: #374151;
  box-shadow: 0 0 0 3px rgba(55, 65, 81, 0.1);
}

.options-section {
  margin-bottom: 1.5rem;
}

.options-section h4 {
  margin: 0 0 1rem 0;
  color: #374151;
  font-size: 1rem;
  font-weight: 600;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.option-group label {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  color: #374151;
  font-weight: 500;
}

.option-group input[type="range"] {
  width: 100%;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

/* Vue Flow 기본 스타일 오버라이드 */
:deep(.vue-flow) {
  background: #f8fafc;
}

:deep(.vue-flow__node) {
  cursor: grab;
  background: white !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
  border: 1px solid rgba(229, 231, 235, 0.8) !important;
}

:deep(.vue-flow__node:hover) {
  transform: scale(1.02);
  transition: transform 0.1s ease;
}

:deep(.vue-flow__node-dragging) {
  cursor: grabbing !important;
  transform: scale(1.05) !important;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
  z-index: 1000 !important;
}

:deep(.vue-flow__handle) {
  width: 8px;
  height: 8px;
  border: 2px solid white;
  border-radius: 50%;
}

:deep(.vue-flow__edge-path) {
  stroke: #374151;
  stroke-width: 2;
  stroke-dasharray: 5,5;
  animation: flowAnimation 2s linear infinite;
}

@keyframes flowAnimation {
  0% {
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dashoffset: 10;
  }
}

:deep(.vue-flow__edge:hover .vue-flow__edge-path) {
  stroke: #1d4ed8;
  cursor: pointer;
}

:deep(.vue-flow__edge.selected .vue-flow__edge-path) {
  stroke: #374151;
  stroke-width: 3;
}

:deep(.vue-flow__node.selected) {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(55, 65, 81, 0.3);
      border: 2px solid #374151;
  z-index: 1000;
}

:deep(.vue-flow__controls) {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

:deep(.vue-flow__minimap) {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* 그래프 스타일 */
.vue-flow__edge-path {
  stroke: #374151;
  stroke-width: 2;
}

.vue-flow__edge.selected .vue-flow__edge-path {
  stroke: #374151;
  stroke-width: 3;
}

.vue-flow__connection-path {
  stroke: #374151;
  stroke-width: 2;
  stroke-dasharray: 5, 5;
}

.vue-flow__node {
  border: 2px solid #374151;
}
</style> 