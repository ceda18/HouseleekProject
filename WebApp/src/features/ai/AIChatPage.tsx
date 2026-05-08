import { useEffect, useRef, useState, useCallback } from 'react'
import { Send, Bot, RefreshCw } from 'lucide-react'
import { GlassCard } from '../../components/ui/GlassCard'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/shared/PageHeader'
import { useAgentChat } from '../../hooks/useAgentChat'
import { MessageBubble } from './components/MessageBubble'
import { ThinkingBubble } from './components/ThinkingBubble'
import logoV from '../../assets/logo-vertical.png'

const EXAMPLE_PROMPTS = [
  'How often do I turn on the living room lights?',
  'Suggest a Good Morning automation',
  'Which device has the most activity this week?',
  'Create a Night Mode scene for the bedroom',
]

export function AIChatPage() {
  const { messages, started, sending, starting, start, send, clear } = useAgentChat()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(
    () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }),
    [],
  )
  useEffect(scrollToBottom, [messages, sending, scrollToBottom])

  const startChat = async (prefill?: string) => {
    await start()
    if (prefill) {
      setInput(prefill)
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text) return
    setInput('')
    await send(text)
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px'
  }

  return (
    // mobile: 100dvh minus pt-20 (5rem) and pb-28 (7rem) from AppLayout = 12rem
    // desktop: 100svh minus top padding only (sidebar handles the rest)
    <div className="flex flex-col h-[calc(100dvh_-_12rem)] md:h-[calc(100svh_-_10rem)]">
      <PageHeader
        title="AI Assistant"
        subtitle="Ask questions, get analytics, or request smart proposals"
        action={
          started
            ? <Button variant="ghost" size="sm" onClick={clear}><RefreshCw size={14} /> New session</Button>
            : undefined
        }
      />

      {!started ? (
        <div className="flex-1 flex items-center justify-center overflow-y-auto">
          <GlassCard variant="accent" shimmer className="p-8 max-w-sm w-full text-center">
            <img src={logoV} alt="Houseleek AI" className="h-20 w-auto mx-auto mb-5 opacity-90" />
            <h2 className="text-lg font-semibold text-text-primary mb-1">Houseleek AI</h2>
            <p className="text-sm text-text-secondary mb-5">
              Your smart home assistant — analytics, proposals, control.
            </p>
            <div className="flex flex-col gap-2 mb-6">
              {EXAMPLE_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  className="glass-subtle rounded-xl px-3 py-2 text-xs text-text-secondary text-left hover:bg-white/50 transition-colors"
                  onClick={() => startChat(prompt)}
                >
                  "{prompt}"
                </button>
              ))}
            </div>
            <Button size="lg" loading={starting} onClick={() => startChat()} className="w-full">
              <Bot size={16} /> Start Chat
            </Button>
          </GlassCard>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 gap-3">
          {/* Scrollable messages window */}
          <GlassCard className="flex-1 overflow-y-auto p-5 flex flex-col gap-5 min-h-0">
            {messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-text-muted">Say hello to Houseleek AI!</p>
              </div>
            ) : (
              messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)
            )}
            <ThinkingBubble active={sending} />
            <div ref={bottomRef} />
          </GlassCard>

          {/* Input — stays at bottom of the container, always visible and interactive */}
          <div className="relative z-10 glass-strong rounded-3xl p-3 flex items-end gap-3 flex-shrink-0">
            <textarea
              ref={textareaRef}
              className="input flex-1 resize-none min-h-[44px] py-2.5 leading-relaxed overflow-hidden"
              placeholder="Ask Houseleek AI…"
              value={input}
              rows={1}
              onChange={handleTextareaChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              loading={sending}
              size="md"
              className="flex-shrink-0"
            >
              <Send size={15} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
