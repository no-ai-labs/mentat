import {Node, mergeAttributes} from '@tiptap/core'
import {VueNodeViewRenderer} from '@tiptap/vue-3'
import DataBlockComponent from '../components/DataBlock.vue'

export const DataBlock = Node.create({
    name: 'dataBlock',
    group: 'block',
    atom: true,

    addAttributes() {
        return {
            rawContent: {default: ''},
            parsedContent: {default: null},
        }
    },

    parseHTML() {
        return [{tag: 'data-block'}]
    },

    renderHTML({HTMLAttributes}) {
        return ['data-block', mergeAttributes(HTMLAttributes)]
    },

    addNodeView() {
        return VueNodeViewRenderer(DataBlockComponent)
    },
})
