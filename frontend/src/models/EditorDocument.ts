import type { Block } from './Block'

export interface EditorDocument {
    id: string
    title: string
    blocks: Block[]
    createdAt: string
    updatedAt: string
}
