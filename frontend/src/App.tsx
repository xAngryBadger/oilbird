import { useState } from 'react'
import { motion } from 'framer-motion'
import { Preloader } from './components/Preloader'
import { MarkdownEditor } from './components/MarkdownEditor'
import { generatePdf } from './lib/pdf'
import { BetaBanner } from './components/BetaBanner'
import { ApiConfig } from './components/ApiConfig'
import { useLenis } from './hooks/useLenis'

const COLAB_URL = 'https://colab.research.google.com/github/xAngryBadger/oilbird/blob/main/colab-backend.ipynb'

function App() {
  const [showPreloader, setShowPreloader] = useState(true)
  const [bannerVisible, setBannerVisible] = useState(() => !localStorage.getItem('badger-beta-banner-dismissed'))
  const [loading, setLoading] = useState(false)

  useLenis()

  const handleGenerate = async (markdown: string) => {
    setLoading(true)
    try {
      await generatePdf(markdown)
    } catch (error) {
      if (error instanceof Error && error.message === 'NO_API_URL') {
        alert('Configure a URL da API primeiro. Clique em "Sem API" no header e cole a URL do Cloudflare.')
      } else {
        console.error('Error generating PDF:', error)
        alert('Erro ao gerar PDF. Verifique se o backend está online.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {showPreloader && <Preloader title="Oilbird" onComplete={() => setShowPreloader(false)} />}

      <div className="noise-overlay noise-overlay--animated" aria-hidden="true" />

      <motion.div
        initial={{ clipPath: 'inset(0 0 100% 0)' }}
        animate={{ clipPath: 'inset(0 0 0 0)' }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]"
      >
        <BetaBanner colabUrl={COLAB_URL} onDismiss={() => setBannerVisible(false)} />

        <header
          className={`fixed left-0 right-0 z-40 fade-border-bottom h-16 flex items-center transition-top duration-300 ${bannerVisible ? 'top-[44px]' : 'top-0'}`}
          style={{ backdropFilter: 'blur(16px)', backgroundColor: 'rgba(15,23,42,0.8)' }}
        >
          <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 15 }}
                className="w-8 h-8 flex items-center justify-center"
              >
                <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </motion.div>
              <h1 className="text-lg font-serif font-normal tracking-tight text-[var(--color-cream)]">Oilbird</h1>
            </div>
            <div className="flex items-center gap-4">
              <ApiConfig colabUrl={COLAB_URL} />
              <span className="label-mono text-[var(--color-text-muted)]">Markdown</span>
              <span className="label-mono text-[var(--color-accent)]">PDF editorial</span>
            </div>
          </div>
        </header>

      <main className={`transition-[padding] duration-300 ${bannerVisible ? 'pt-[7rem]' : 'pt-20'}`}>
        <MarkdownEditor onGenerate={handleGenerate} loading={loading} />
      </main>
      </motion.div>
    </>
  )
}

export default App
