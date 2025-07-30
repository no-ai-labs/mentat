import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import ResultBlockComponent from '../components/ResultBlock.vue'

export const ResultBlock = Node.create({
    name: 'resultBlock',
    group: 'block',
    atom: true,

    addAttributes() {
        return {
            output: { default: '' },
            visualizationType: { default: 'text' },
            visualizationConfig: { 
                default: {
                    chart: {
                        title: '차트 제목',
                        xKey: 'x',
                        yKey: 'y'
                    },
                    code: {
                        language: 'text',
                        content: ''
                    }
                }
            },
            analysisStyle: { default: '핵심 요약' }
        }
    },

    parseHTML() {
        return [{ tag: 'result-block' }]
    },

    renderHTML({ HTMLAttributes }) {
        return ['result-block', mergeAttributes(HTMLAttributes)]
    },

    addNodeView() {
        return VueNodeViewRenderer(ResultBlockComponent)
    },
})
