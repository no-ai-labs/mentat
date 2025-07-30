// Bison 채팅 API 및 GPT 위임 시스템

const API_BASE_URL = 'http://localhost:8080/api'

/**
 * Bison과 채팅하는 함수
 * @param {string} message - 사용자 메시지
 * @returns {Promise<Object>} Bison 응답
 */
export async function chatWithBison(message) {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/bison`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        context: 'mentat_dag_editor'
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Bison 채팅 오류:', error)
    return {
      success: false,
      message: 'Bison과의 연결에 문제가 발생했습니다. 기본 응답으로 대체합니다.',
      response: getDefaultBisonResponse(message)
    }
  }
}

/**
 * Spice Flow Graph 생성 의도를 감지하는 함수
 * @param {string} message - 사용자 메시지
 * @returns {boolean} Spice Flow Graph 생성 의도 여부
 */
export function detectSpiceFlowIntent(message) {
  const spiceFlowKeywords = [
    '워크플로우', 'workflow', '플로우', 'flow',
    '시스템', 'system', '프로세스', 'process',
    '만들어', '생성', '구성', '설계',
    '분석해서', '처리해서', '가져와서',
    '단계', 'step', '순서', 'order',
    'dag', 'DAG', '그래프', 'graph',
    'spice', 'Spice', 'spice flow', 'Spice Flow'
  ]
  
  const lowerMessage = message.toLowerCase()
  return spiceFlowKeywords.some(keyword => 
    lowerMessage.includes(keyword.toLowerCase())
  )
}

/**
 * 하위 호환성을 위한 별칭
 * @deprecated detectSpiceFlowIntent 사용을 권장합니다
 */
export const detectDagIntent = detectSpiceFlowIntent

/**
 * Spice Framework에게 Spice Flow Graph 생성을 위임하는 함수
 * @param {string} userMessage - 사용자 원본 메시지
 * @returns {Promise<Object>} Spice Flow Graph 생성 결과
 */
export async function delegateToSpice(userMessage) {
  try {
    const response = await fetch(`${API_BASE_URL}/spice/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: userMessage,
        options: {
          maxNodes: 8
        }
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Spice Flow Graph 생성 오류:', error)
    throw error
  }
}

/**
 * 하위 호환성을 위한 별칭 (기존 코드에서 사용)
 * @deprecated delegateToSpice 사용을 권장합니다
 */
export const delegateToGPT = delegateToSpice

/**
 * Bison 기본 응답 생성 (오프라인 모드)
 * @param {string} message - 사용자 메시지
 * @returns {string} 기본 응답
 */
function getDefaultBisonResponse(message) {
  const lowerMessage = message.toLowerCase()
  
  if (detectSpiceFlowIntent(message)) {
    return `"${message}"에 대한 워크플로우를 만들어드릴까요? Spice Framework에게 Spice Flow Graph 생성을 위임하시겠습니까? 🌶️✨`
  }
  
  if (lowerMessage.includes('안녕') || lowerMessage.includes('hello')) {
    return '안녕하세요! 멘타트 DAG 에디터에 오신 것을 환영합니다! 어떤 워크플로우를 만들어드릴까요? 😊'
  }
  
  if (lowerMessage.includes('도움') || lowerMessage.includes('help')) {
    return `멘타트에서 할 수 있는 것들:
    
🎯 노드 추가: "[타입] 노드 추가" (prompt, data, agent, action, branch, merge, result)
🔗 연결 규칙: "규칙 설명"으로 Spice Flow Graph 규칙 확인
✨ Spice Flow 생성: 자연어로 워크플로우 설명하면 자동 생성
📊 상태 확인: "상태 확인"으로 현재 그래프 정보 보기

무엇을 도와드릴까요?`
  }
  
  if (lowerMessage.includes('규칙') || lowerMessage.includes('rule')) {
    return `🌶️ Spice Flow Graph 연결 규칙:

✅ 허용되는 연결:
- promptNode → resultNode (원샷)
- promptNode → agentNode
- dataNode → agentNode
- agentNode → actionNode/resultNode/branchNode
- branchNode → agentNode/actionNode/resultNode
- mergeNode → agentNode/actionNode/resultNode

🔄 Message 라우팅 규칙:
- 모든 노드 간 통신은 Message를 통해 수행
- 조건부 라우팅 및 자동 변환 지원
- 메타데이터 기반 지능형 라우팅

🔄 사이클 허용 (피드백 루프)
🎯 자동 노드 삽입 (dataNode → resultNode 사이에 agentNode)
🎨 지능형 레이아웃 (브랜치/머지 노드 주변 자동 정렬)`
  }
  
  return `흥미로운 질문이네요! "${message}"에 대해 더 자세히 알려주시면 도움을 드릴 수 있어요. 혹시 워크플로우나 Spice Flow Graph와 관련된 내용인가요? 🌶️🤔`
}

/**
 * 채팅 응답을 포맷팅하는 함수
 * @param {string} response - 원본 응답
 * @returns {string} 포맷팅된 응답
 */
export function formatChatResponse(response) {
  // 기본적인 마크다운 스타일 텍스트 포맷팅
  return response
    .replace(/\*\*(.*?)\*\*/g, '$1') // **bold** 제거
    .replace(/\*(.*?)\*/g, '$1')     // *italic* 제거
    .trim()
}

/**
 * 에러 메시지 생성
 * @param {Error} error - 에러 객체
 * @returns {string} 사용자 친화적 에러 메시지
 */
export function getChatErrorMessage(error) {
  if (error.message.includes('fetch')) {
    return '서버와의 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.'
  }
  
  if (error.message.includes('timeout')) {
    return '응답 시간이 초과되었습니다. 다시 시도해주세요.'
  }
  
  return '예상치 못한 오류가 발생했습니다. 다시 시도해주세요.'
} 