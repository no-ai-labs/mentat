import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import ActionNodeComponent from '../components/nodes/ActionNode.vue'

export const ActionBlock = Node.create({
    name: 'actionBlock',
    group: 'block',
    atom: true,

    addAttributes() {
        return {
            goal: { default: '' },
            actionType: { default: 'apiCall' },
            settings: { 
                default: {
                    apiCall: {
                        endpoint: '',
                        method: 'GET',
                        headers: '{"Content-Type": "application/json"}'
                    },
                    dagExecution: {
                        dagId: '',
                        waitForCompletion: true
                    },
                    fileWrite: {
                        filename: '',
                        content: ''
                    },
                    visualization: {
                        type: 'text',
                        data: '{}',
                        config: '{}'
                    }
                }
            }
        }
    },

    parseHTML() {
        return [{ tag: 'action-block' }]
    },

    renderHTML({ HTMLAttributes }) {
        return ['action-block', mergeAttributes(HTMLAttributes)]
    },

    addNodeView() {
        return VueNodeViewRenderer(ActionNodeComponent)
    },
}) 