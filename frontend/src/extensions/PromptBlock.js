import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import PromptBlockComponent from '../components/PromptBlock.vue'

export const PromptBlock = Node.create({
    name: 'promptBlock',
    group: 'block',
    atom: true,

    addAttributes() {
        return {
            model: { default: 'gpt-4' },
            prompt: { default: '' }
        }
    },

    parseHTML() {
        return [{ tag: 'prompt-block' }]
    },

    renderHTML({ HTMLAttributes }) {
        return ['prompt-block', mergeAttributes(HTMLAttributes)]
    },

    addNodeView() {
        return VueNodeViewRenderer(PromptBlockComponent)
    },
}) 