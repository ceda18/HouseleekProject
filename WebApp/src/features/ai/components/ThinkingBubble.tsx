import { useEffect, useState } from 'react'
import logoSubmark from '../../../assets/logo-submark.png'

const THINKING = [
  'Let me check your setup…',
  'Analyzing your home…',
  'Running the numbers…',
  'Let me think about that…',
  'Searching through your devices…',
  'One moment…',
  'Checking the data…',
  'Crunching some stats…',
  'Almost there…',
  'Looking into it…',
]

function useThinkingMessage(active: boolean) {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    if (!active) return
    setIdx(Math.floor(Math.random() * THINKING.length))
    const id = setInterval(() => setIdx((i) => (i + 1) % THINKING.length), 2800)
    return () => clearInterval(id)
  }, [active])
  return THINKING[idx]
}

export function ThinkingBubble({ active }: { active: boolean }) {
  const message = useThinkingMessage(active)
  if (!active) return null
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-2xl bg-white/70 border border-border/50 flex items-center justify-center flex-shrink-0">
        <img src={logoSubmark} alt="AI" className="w-5 h-5 object-contain" />
      </div>
      <div className="glass rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
          <span className="text-xs text-text-muted italic">{message}</span>
        </div>
      </div>
    </div>
  )
}
