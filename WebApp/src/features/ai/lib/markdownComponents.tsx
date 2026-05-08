/**
 * Custom react-markdown component overrides for AI assistant message bubbles.
 * Tweaks default rendering to match our glass theme (compact spacing, accent code, etc.)
 */
import type { ReactNode } from 'react'

export const mdComponents = {
  p: ({ children }: { children?: ReactNode }) => <p className="mb-2 last:mb-0">{children}</p>,
  strong: ({ children }: { children?: ReactNode }) => <strong className="font-semibold text-text-primary">{children}</strong>,
  em: ({ children }: { children?: ReactNode }) => <em className="italic text-text-secondary">{children}</em>,
  ul: ({ children }: { children?: ReactNode }) => <ul className="list-disc list-inside mb-2 space-y-0.5">{children}</ul>,
  ol: ({ children }: { children?: ReactNode }) => <ol className="list-decimal list-inside mb-2 space-y-0.5">{children}</ol>,
  li: ({ children }: { children?: ReactNode }) => <li className="text-sm">{children}</li>,
  h1: ({ children }: { children?: ReactNode }) => <h1 className="text-base font-semibold text-text-primary mb-1">{children}</h1>,
  h2: ({ children }: { children?: ReactNode }) => <h2 className="text-sm font-semibold text-text-primary mb-1">{children}</h2>,
  h3: ({ children }: { children?: ReactNode }) => <h3 className="text-sm font-medium text-text-primary mb-1">{children}</h3>,
  code: ({ children, className }: { children?: ReactNode; className?: string }) => {
    const isBlock = className?.includes('language-')
    return isBlock ? (
      <pre className="bg-white/60 rounded-lg p-2.5 overflow-x-auto my-2 text-xs font-mono"><code>{children}</code></pre>
    ) : (
      <code className="bg-white/60 rounded px-1 py-0.5 text-xs font-mono text-accent">{children}</code>
    )
  },
  table: ({ children }: { children?: ReactNode }) => (
    <div className="overflow-x-auto my-2"><table className="w-full text-xs border-collapse">{children}</table></div>
  ),
  thead: ({ children }: { children?: ReactNode }) => <thead className="border-b border-border/60">{children}</thead>,
  th: ({ children }: { children?: ReactNode }) => <th className="px-2 py-1.5 text-left font-semibold text-text-muted uppercase tracking-wide">{children}</th>,
  td: ({ children }: { children?: ReactNode }) => <td className="px-2 py-1.5 text-text-secondary border-b border-border/20">{children}</td>,
  blockquote: ({ children }: { children?: ReactNode }) => (
    <blockquote className="border-l-2 border-accent/40 pl-3 italic text-text-muted my-2">{children}</blockquote>
  ),
  hr: () => <hr className="border-border/40 my-3" />,
}
