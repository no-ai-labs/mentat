import { Extension } from '@tiptap/core'

function matchesCommand(input, ...commands) {
    return commands.some(cmd => input === cmd)
}

export const SlashCommand = Extension.create({
    name: 'slashCommand',

    addKeyboardShortcuts() {
        return {
            Enter: () => {
                const { state } = this.editor.view
                const { from, to } = state.selection
                const $from = state.selection.$from
                const $to = state.selection.$to

                // 텍스트 추출
                const text = state.doc.textBetween($from.before(), $to.end())

                if (text.startsWith('/')) {
                    const command = text.trim().slice(1).toLowerCase()

                    const insertWithParagraph = (type) => {
                        this.editor.commands.insertContent([
                            { type },
                            { type: 'paragraph' } // 👈 빈 줄 생성
                        ])
                        this.editor.commands.deleteRange({ from: $from.before(), to: $to.end() })
                    }

                    // 📥 /d, /data → DataBlock
                    if (matchesCommand(command, 'd', 'data')) {
                        insertWithParagraph('dataBlock')
                        return true
                    }

                    // 🔧 /p, /pr, /prompt → PromptBlock (단발성 프롬프트)
                    if (matchesCommand(command, 'p', 'pr', 'prompt')) {
                        insertWithParagraph('promptBlock')
                        return true
                    }

                    // 🤖 /a, /ag, /agent → AgentBlock (Goal 기반 반복형 Agent)
                    if (matchesCommand(command, 'a', 'ag', 'agent')) {
                        insertWithParagraph('agentBlock')
                        return true
                    }

                    // ✅ /r, /res, /result → ResultBlock
                    if (matchesCommand(command, 'r', 'res', 'result')) {
                        insertWithParagraph('resultBlock')
                        return true
                    }

                    // ⚡ /ac, /action → ActionBlock
                    if (matchesCommand(command, 'ac', 'action')) {
                        insertWithParagraph('actionBlock')
                        return true
                    }

                    // ✨ /g, /gen, /generate → DAG 자동 생성
                    if (matchesCommand(command, 'g', 'gen', 'generate')) {
                        // DAG 자동 생성 모달 열기
                        this.editor.commands.deleteRange({ from: $from.before(), to: $to.end() })
                        
                        // 글로벌 이벤트 발생 (MentatGraphEditor가 수신)
                        window.dispatchEvent(new CustomEvent('openDagGenerator'))
                        
                        return true
                    }

                }

                return false
            },
        }
    }
})
