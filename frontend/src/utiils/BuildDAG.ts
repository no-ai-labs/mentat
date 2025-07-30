import type { Block } from '@/models/Block'

export function buildDAG(blocks: Block[]) {
    const map = new Map<string, Block>()

    blocks.forEach(block => map.set(block.id, block))

    // usedBy 자동 생성
    blocks.forEach(block => {
        (block.inputRefs || []).forEach(targetId => {
            const target = map.get(targetId)
            if (!target) return
            if (!target.usedBy) target.usedBy = []
            if (!target.usedBy.includes(block.id)) {
                target.usedBy.push(block.id)
            }
        })
    })

    return Array.from(map.values())
}
