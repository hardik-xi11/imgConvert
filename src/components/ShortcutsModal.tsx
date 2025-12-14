import { X, Keyboard } from 'lucide-react'

interface ShortcutsModalProps {
    isOpen: boolean
    onClose: () => void
}

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
    if (!isOpen) return null

    const shortcuts = [
        { keys: ['Ctrl', 'Shift', 'C'], description: 'Convert Images' },
        { keys: ['Ctrl', 'D'], description: 'Download All' },
        { keys: ['Shift', 'J'], description: 'Select JPG Format' },
        { keys: ['Shift', 'P'], description: 'Select PNG Format' },
        { keys: ['Shift', 'W'], description: 'Select WebP Format' },
        { keys: ['Shift', 'A'], description: 'Select AVIF Format' },
        { keys: ['?'], description: 'Toggle Shortcuts Help' },
    ]

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-neutral-900 border border-neutral-800 rounded-sm w-full max-w-md overflow-hidden shadow-2xl shadow-orange-900/10 animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-neutral-800 border border-neutral-700 rounded-sm">
                            <Keyboard className="w-5 h-5 text-orange-500" />
                        </div>
                        <h2 className="text-xl font-bold text-neutral-200 uppercase tracking-wide">Command List</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-neutral-800 rounded-sm text-neutral-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {shortcuts.map((shortcut, index) => (
                        <div key={index} className="flex items-center justify-between group">
                            <span className="text-neutral-400 font-mono text-sm group-hover:text-orange-400 transition-colors uppercase">
                                {shortcut.description}
                            </span>
                            <div className="flex gap-1.5">
                                {shortcut.keys.map((key) => (
                                    <kbd
                                        key={key}
                                        className="px-2 py-1 bg-neutral-950 border border-neutral-800 rounded-sm text-xs font-bold text-neutral-300 font-mono shadow-sm"
                                    >
                                        {key}
                                    </kbd>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 bg-neutral-950/80 border-t border-neutral-800 text-center">
                    <p className="text-[10px] text-neutral-600 font-mono uppercase tracking-widest">
                        Press <kbd className="font-bold text-neutral-400">Esc</kbd> to close terminal
                    </p>
                </div>
            </div>
        </div>
    )
}
