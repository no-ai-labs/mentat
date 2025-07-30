export type BlockType = 'promptBlock' | 'dataBlock' | 'resultBlock' | 'agentBlock'

export interface Block {
    id: string  // "block-1"
    type: BlockType
    attrs: Record<string, any>
    inputRefs?: string[]      // 내가 참조하는 블록
    usedBy?: string[]         // 나를 참조하는 블록 (DAG 용)
}