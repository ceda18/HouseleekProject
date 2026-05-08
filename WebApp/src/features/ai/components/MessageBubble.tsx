import { User } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { format } from 'date-fns'
import logoSubmark from '../../../assets/logo-submark.png'
import { ProposalCard } from './ProposalCard'
import { mdComponents } from '../lib/markdownComponents'
import type { AgentMessageDto } from '../../../types/api'

export function MessageBubble({ msg }: { msg: AgentMessageDto }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-8 h-8 rounded-2xl flex-shrink-0 flex items-center justify-center ${
          isUser ? 'bg-accent/15' : 'bg-white/70 border border-border/50'
        }`}
      >
        {isUser
          ? <User size={15} className="text-accent" />
          : <img src={logoSubmark} alt="AI" className="w-5 h-5 object-contain" />}
      </div>
      <div className={`max-w-[80%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser ? 'bg-accent text-white rounded-tr-sm' : 'glass rounded-tl-sm'
          }`}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-white">{msg.content}</p>
          ) : (
            <div className="text-sm leading-relaxed text-text-primary prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                {msg.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        {msg.proposal && <ProposalCard proposal={msg.proposal} />}
        <span className="text-[10px] text-text-muted mt-1 px-1">
          {format(new Date(msg.timestamp), 'HH:mm')}
        </span>
      </div>
    </div>
  )
}
