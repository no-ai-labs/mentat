import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import AgentBlockComponent from '../components/AgentBlock.vue'

export const AgentBlock = Node.create({
    name: 'agentBlock',
    group: 'block',
    atom: true,

    addAttributes() {
        return {
            goal: { default: '' },
            agentType: { default: 'planner' },
            model: { default: 'gpt-4' },
            maxIterations: { default: 3 },
            finalOutput: { default: '' },
            status: { default: 'IDLE' }
        }
    },

    parseHTML() {
        return [{ tag: 'agent-block' }]
    },

    renderHTML({ HTMLAttributes }) {
        return ['agent-block', mergeAttributes(HTMLAttributes)]
    },

    addNodeView() {
        return VueNodeViewRenderer(AgentBlockComponent)
    },
})
