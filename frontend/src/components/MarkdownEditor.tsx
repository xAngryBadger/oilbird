import { useState, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { revealVariants, staggerContainer } from '../hooks/useScrollReveal'

const SAMPLE_MD = `# Relatório Técnico

## Resumo

Este documento demonstra a conversão de Markdown para PDF com qualidade editorial usando **WeasyPrint** no backend.

## Metodologia

1. O usuário escreve Markdown no editor
2. O frontend envia o texto para o backend via API
3. WeasyPrint renderiza HTML+CSS para PDF tipográfico
4. O PDF é devolvido como download automático

### Código de Exemplo

\`\`\`python
def hello():
    print("Hello, Oilbird!")
\`\`\`

## Conclusão

> A qualidade tipográfica do WeasyPrint supera alternativas baseadas em browser.

O Oilbird converte Markdown em PDFs com **tipografia profissional** — sem Word, sem LaTeX.
`

interface MarkdownEditorProps {
  onGenerate: (markdown: string) => Promise<void>
  loading: boolean
}

export function MarkdownEditor({ onGenerate, loading }: MarkdownEditorProps) {
  const [markdown, setMarkdown] = useState(SAMPLE_MD)
  const previewRef = useRef<HTMLDivElement>(null)

  const wordCount = useMemo(
    () => markdown.trim().split(/\s+/).filter(Boolean).length,
    [markdown],
  )

  const preview = useMemo(
    () => simpleMarkdownToHtml(markdown),
    [markdown],
  )

  const handleGenerate = () => {
    onGenerate(markdown)
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[calc(100dvh-8rem)]"
    >
      <motion.div variants={revealVariants} custom={0} className="relative border-r border-[var(--color-border-subtle)]">
        <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-border-subtle)]">
          <p className="label-mono text-[var(--color-text-muted)]">Markdown</p>
          <div className="flex items-center gap-3">
            <span className="label-mono text-[0.5625rem] text-[var(--color-text-muted)]">{wordCount} palavras</span>
            <span className="label-mono text-[0.5625rem] text-[var(--color-primary)]">UTF-8</span>
          </div>
        </div>
        <textarea
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          className="md-editor w-full h-[calc(100dvh-12rem)] bg-transparent text-[var(--color-text)] p-6 placeholder:text-[var(--color-text-muted)]"
          placeholder="Escreva seu Markdown aqui..."
          spellCheck={false}
        />
      </motion.div>

      <motion.div variants={revealVariants} custom={0.1} className="relative">
        <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-border-subtle)]">
          <p className="label-mono text-[var(--color-text-muted)]">Preview</p>
          <p className="label-mono text-[0.5625rem] text-[var(--color-accent)]">WeasyPrint</p>
        </div>
        <div
          ref={previewRef}
          className="h-[calc(100dvh-12rem)] overflow-y-auto p-6 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[var(--color-border)] [&::-webkit-scrollbar-thumb]:rounded-sm [&::-webkit-scrollbar-track]:transparent"
        >
          <div
            className="prose-editor text-[var(--color-text)] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: preview }}
          />
        </div>
      </motion.div>

      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[var(--color-bg)]/80 backdrop-blur-md fade-border-top">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="label-mono text-[var(--color-text-muted)]">Oilbird</span>
            <span className="label-mono text-[var(--color-accent)]">PDF editorial</span>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading || !markdown.trim()}
            className="btn-clipped"
          >
            <span className="btn-text-back flex items-center gap-2 font-semibold text-sm tracking-wide">
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Gerando PDF...
                </>
              ) : (
                'Gerar PDF'
              )}
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function simpleMarkdownToHtml(md: string): string {
  let html = md

  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  html = html.replace(/^### (.+)$/gm, '<h3 class="font-serif text-xl text-[var(--color-cream)] mt-6 mb-3">$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2 class="font-serif text-2xl text-[var(--color-cream)] mt-8 mb-4">$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1 class="font-serif text-3xl text-[var(--color-cream)] mt-0 mb-6 tracking-tight">$1</h1>')

  html = html.replace(/```[\s\S]*?```/g, (match) => {
    const code = match.replace(/```\w*\n?/g, '').trim()
    return `<pre class="bg-[var(--color-bg-alt)] border border-[var(--color-border-subtle)] p-4 overflow-x-auto text-sm font-mono text-[var(--color-text-muted)] my-4"><code>${code}</code></pre>`
  })

  html = html.replace(/`([^`]+)`/g, '<code class="bg-[var(--color-bg-alt)] px-1.5 py-0.5 text-sm font-mono text-[var(--color-accent)]">$1</code>')

  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="text-[var(--color-cream)] font-semibold">$1</strong>')

  html = html.replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-[var(--color-accent)] pl-4 italic text-[var(--color-text-muted)] my-4">$1</blockquote>')

  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 text-[var(--color-text)] mb-1">$1</li>')

  html = html.replace(/^- (.+)$/gm, '<li class="ml-4 text-[var(--color-text)] mb-1 list-disc">$1</li>')

  html = html.replace(/\n{2,}/g, '</p><p class="text-[var(--color-text)] mb-4 leading-relaxed">')

  return `<div class="prose-editor">${html}</div>`
}
