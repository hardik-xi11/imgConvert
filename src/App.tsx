import { useState, useEffect } from 'react'
import { Terminal, Layers, AlertTriangle, RefreshCw, HelpCircle } from 'lucide-react'
import { useFFmpeg } from './hooks/useFFmpeg'
import { Dropzone } from './components/Dropzone'
import { Converter } from './components/Converter'
import { ShortcutsModal } from './components/ShortcutsModal'

function App() {
  const { loaded, error, load, ffmpeg } = useFFmpeg()
  const [files, setFiles] = useState<File[]>([])
  const [showShortcuts, setShowShortcuts] = useState(false)

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(newFiles)
  }

  const clearFiles = () => {
    setFiles([])
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle shortcuts with ? (Shift + /)
      if (e.key === '?' && e.shiftKey) {
        // Prevent default only if we're not in an input
        if (!(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
          setShowShortcuts(prev => !prev)
        }
      }
      // Close on Escape
      if (e.key === 'Escape') {
        setShowShortcuts(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="min-h-screen text-neutral-200 font-sans selection:bg-orange-500/30">
      <ShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="flex items-center justify-between mb-20 animate-in slide-in-from-top-8 duration-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-neutral-900 border border-neutral-800 rounded-sm flex items-center justify-center shadow-2xl shadow-orange-500/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <img src="/photo.png" alt="Logo" className="w-8 h-8 object-contain relative z-10" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-widest uppercase flex items-center gap-2">
                Img-Convrt <span className="text-[10px] px-1.5 py-0.5 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-sm tracking-widest font-mono">BETA</span>
              </h1>
              <p className="text-xs text-neutral-300 font-mono tracking-widest uppercase">Secure Fast Conversions</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowShortcuts(true)}
              className="w-10 h-10 flex items-center justify-center bg-neutral-900 border border-neutral-800 rounded-sm text-neutral-400 hover:text-orange-500 hover:border-orange-500/50 transition-all group"
              title="Keyboard Shortcuts (Shift + ?)"
            >
              <HelpCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            </button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-sm text-neutral-400 hover:text-orange-500 hover:border-orange-500/50 transition-all flex items-center gap-2 font-medium text-sm tracking-wide uppercase"
            >
              <img src="/github.svg" alt="GitHub" className="w-6 h-6" />
              <span>GitHub</span>
            </a>
          </div>
        </header>

        {/* Main Content */}
        <main>
          {error ? (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-300">
              <div className="w-24 h-24 rounded-full bg-red-500/5 border border-red-500/20 flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 border border-red-500/30 rounded-full animate-ping opacity-20"></div>
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-neutral-200 mb-2 uppercase tracking-wide">Initialization Failure</h3>
              <p className="text-neutral-500 text-center max-w-md mb-8 font-mono text-sm leading-relaxed">
                {error}. Please check your connection.
              </p>
              <button
                onClick={() => load()}
                className="px-8 py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-500 text-neutral-200 rounded-sm font-medium transition-all flex items-center gap-3 uppercase tracking-wider text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Retry System
              </button>
            </div>
          ) : !loaded ? (
            <div className="flex flex-col items-center justify-center py-32 animate-in fade-in duration-700">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-neutral-900 border border-neutral-800 flex items-center justify-center skew-x-[-6deg]">
                  <Terminal className="w-8 h-8 text-neutral-600" />
                </div>
                <div className="absolute -bottom-2 -right-2">
                  <div className="w-8 h-8 bg-orange-600 skew-x-[-6deg] flex items-center justify-center animate-spin-slow shadow-lg shadow-orange-900/50">
                    <Layers className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
              <p className="text-neutral-400 font-medium uppercase tracking-[0.2em] text-xs">System Initialization</p>
              <div className="mt-4 flex gap-1">
                <div className="w-1 h-1 bg-orange-500 animate-pulse"></div>
                <div className="w-1 h-1 bg-orange-500 animate-pulse delay-75"></div>
                <div className="w-1 h-1 bg-orange-500 animate-pulse delay-150"></div>
              </div>
            </div>
          ) : (
            <div className="animate-in slide-in-from-bottom-8 fade-in duration-500">
              {files.length === 0 ? (
                <Dropzone onFilesSelected={handleFilesSelected} />
              ) : (
                <Converter files={files} ffmpeg={ffmpeg} onClear={clearFiles} />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
