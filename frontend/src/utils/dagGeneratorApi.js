// DAG 자동 생성 API 유틸리티

const API_BASE_URL = 'http://localhost:8080/api'

/**
 * 자연어 프롬프트로부터 DAG를 생성하는 API 호출
 * @param {string} prompt - 자연어 프롬프트
 * @param {number|Object} maxNodesOrOptions - 최대 노드 수 또는 옵션 객체
 * @returns {Promise<Object>} 생성된 DAG 데이터
 */
export async function generateDagFromPrompt(prompt, maxNodesOrOptions = 10) {
  try {
    // maxNodesOrOptions가 객체인 경우 maxNodes 추출, 아니면 그대로 사용
    const maxNodes = typeof maxNodesOrOptions === 'object' ? maxNodesOrOptions.maxNodes : maxNodesOrOptions;
    
    const response = await fetch(`${API_BASE_URL}/dag/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        options: {
          maxNodes: maxNodes
        }
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('DAG 생성 API 호출 실패:', error)
    throw error
  }
}

/**
 * 백엔드 응답을 Vue Flow 형식으로 변환
 * @param {Object} backendResponse - 백엔드에서 받은 전체 응답 데이터
 * @returns {Object} Vue Flow 형식의 노드와 엣지, 그리고 메타데이터
 */
export function convertToVueFlowFormat(backendResponse) {
  // 백엔드 응답에서 DAG 데이터 추출
  const dagData = backendResponse.dag || backendResponse;
  
  const nodes = dagData.nodes.map(node => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: {
      // 노드 타입에 따라 적절한 데이터 구조 생성
      ...(node.data || {}),
      id: node.id,
      // 노드 타입별 기본 속성 설정
      ...(node.type === 'promptNode' && {
        prompt: node.data?.prompt || node.data?.title || '프롬프트를 입력하세요',
        inputRefs: []
      }),
      ...(node.type === 'dataNode' && {
        rawContent: node.data?.data || node.data?.title || '데이터를 입력하세요',
        inputRefs: []
      }),
      ...(node.type === 'agentNode' && {
        prompt: node.data?.prompt || node.data?.title || 'AI 에이전트 프롬프트를 입력하세요',
        agent: 'gpt-4',
        inputRefs: []
      }),
      ...(node.type === 'actionNode' && {
        goal: node.data?.action || node.data?.title || '액션을 설정하세요',
        actionType: 'apiCall',
        inputRefs: []
      }),
      ...(node.type === 'resultNode' && {
        output: node.data?.output || node.data?.title || '결과가 여기에 표시됩니다',
        inputRefs: []
      }),
      usedBy: []
    }
  }))

  const edges = dagData.edges.map(edge => ({
    id: edge.id || `${edge.source}-${edge.target}`,
    source: edge.source,
    target: edge.target,
    type: edge.type || 'smoothstep',
    animated: true,
    style: { 
      stroke: '#3b82f6', 
      strokeWidth: 3,
      strokeDasharray: '5,5'
    }
  }))

  return { 
    nodes, 
    edges, 
    metadata: dagData.metadata || {
      description: '생성된 워크플로우',
      estimatedExecutionTime: '알 수 없음',
      complexity: 'medium',
      suggestedOrder: []
    }
  }
}

/**
 * 에러 메시지를 사용자 친화적으로 변환
 * @param {Error} error - 에러 객체
 * @returns {string} 사용자 친화적인 에러 메시지
 */
export function getErrorMessage(error) {
  if (error.message.includes('Failed to fetch')) {
    return '서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.'
  }
  
  if (error.message.includes('500')) {
    return '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
  }
  
  if (error.message.includes('400')) {
    return '잘못된 요청입니다. 프롬프트를 다시 확인해주세요.'
  }
  
  return error.message || '알 수 없는 오류가 발생했습니다.'
}

/**
 * 예시 프롬프트들
 */
export const PROMPT_EXAMPLES = [
  {
    title: '뉴스 요약 시스템',
    prompt: '뉴스 기사를 가져와서 요약해주는 시스템을 만들어줘'
  },
  {
    title: '데이터 분석 파이프라인',
    prompt: 'CSV 파일을 읽어서 데이터를 분석하고 차트로 시각화하는 시스템'
  },
  {
    title: 'API 테스트 자동화',
    prompt: 'REST API를 호출해서 응답을 검증하고 결과를 저장하는 테스트 시스템'
  },
  {
    title: '회의록 정리',
    prompt: '음성 파일을 텍스트로 변환하고 주요 내용을 정리하는 시스템'
  },
  {
    title: '감정 분석',
    prompt: '텍스트 데이터의 감정을 분석하고 결과를 분류하는 시스템'
  }
] 