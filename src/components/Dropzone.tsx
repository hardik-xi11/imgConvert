import { useState, useRef, useEffect, ClipboardEvent } from 'react'
import { UploadCloud, Link as LinkIcon, X, Loader2, ArrowRight } from 'lucide-react'
import { clsx } from 'clsx'

interface DropzoneProps {
    onFilesSelected: (files: File[]) => void
    disabled?: boolean
}

export function Dropzone({ onFilesSelected, disabled }: DropzoneProps) {
    const [isDragActive, setIsDragActive] = useState(false)
    const [urlInput, setUrlInput] = useState('')
    const [isUrlLoading, setIsUrlLoading] = useState(false)
    const [showUrlInput, setShowUrlInput] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        if (disabled) return
        setIsDragActive(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragActive(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragActive(false)
        if (disabled) return

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFilesSelected(Array.from(e.dataTransfer.files))
        }
    }

    const handlePaste = (e: ClipboardEvent | Event) => {
        if (disabled) return
        const clipboardEvent = e as ClipboardEvent
        if (clipboardEvent.clipboardData && clipboardEvent.clipboardData.files.length > 0) {
            onFilesSelected(Array.from(clipboardEvent.clipboardData.files))
        }
    }

    // Global paste listener
    useEffect(() => {
        window.addEventListener('paste', handlePaste)
        return () => window.removeEventListener('paste', handlePaste)
    }, [disabled, onFilesSelected])

    const handleUrlSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!urlInput || disabled) return

        try {
            setIsUrlLoading(true)
            const response = await fetch(urlInput)
            if (!response.ok) throw new Error('Failed to fetch image')
            const blob = await response.blob()
            const filename = urlInput.split('/').pop()?.split('?')[0] || 'image.jpg'
            const file = new File([blob], filename, { type: blob.type })
            onFilesSelected([file])
            setUrlInput('')
            setShowUrlInput(false)
        } catch (error) {
            console.error('Error fetching URL:', error)
            alert('Failed to fetch image from URL. It might have CORS protection.')
        } finally {
            setIsUrlLoading(false)
        }
    }

    const open = () => {
        fileInputRef.current?.click()
    }

    return (
        <div className="w-full max-w-2xl mx-auto space-y-4">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={open}
                className={clsx(
                    "relative group cursor-pointer overflow-hidden transition-all duration-300 ease-out",
                    "min-h-[400px] flex flex-col items-center justify-center p-12 text-center",
                    "border-2 border-dashed rounded-sm",
                    isDragActive
                        ? "border-orange-500 bg-orange-500/5"
                        : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 hover:bg-neutral-900/80",
                    disabled && "opacity-50 cursor-not-allowed pointer-events-none"
                )}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => e.target.files && onFilesSelected(Array.from(e.target.files))}
                    className="hidden"
                    multiple
                    accept="image/*"
                />

                <div className={clsx(
                    "w-20 h-20 mb-8 rounded-sm flex items-center justify-center transition-transform duration-300",
                    isDragActive ? "scale-110 rotate-3" : "group-hover:scale-105",
                    "bg-neutral-900 border border-neutral-800 shadow-xl"
                )}>
                    <UploadCloud className={clsx(
                        "w-10 h-10 transition-colors duration-300",
                        isDragActive ? "text-orange-500" : "text-neutral-500 group-hover:text-orange-400"
                    )} />
                </div>

                <div className="space-y-2 relative z-10">
                    <p className="text-2xl font-bold text-neutral-200 tracking-tight">
                        Initiate File Sequence
                    </p>
                    <p className="text-neutral-500 font-medium">
                        Drag files here, paste from clipboard, or import via URL
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-4 mt-8 relative z-10">
                    <button
                        type="button" // Prevent dropzone open
                        onClick={(e) => {
                            e.stopPropagation()
                            open()
                        }}
                        className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-sm font-medium transition-colors border border-neutral-700 hover:border-neutral-600 uppercase text-sm tracking-wide"
                        disabled={disabled}
                    >
                        Select Files
                    </button>

                    <div className="w-px h-8 bg-neutral-800 mx-2 hidden sm:block" />

                    {showUrlInput ? (
                        <form
                            onSubmit={handleUrlSubmit}
                            onClick={e => e.stopPropagation()}
                            className="flex items-center gap-2 animate-in slide-in-from-right-4 duration-300"
                        >
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                                <input
                                    type="url"
                                    value={urlInput}
                                    onChange={e => setUrlInput(e.target.value)}
                                    placeholder="https://..."
                                    className="pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-sm text-sm text-neutral-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 w-64 placeholder:text-neutral-700"
                                    autoFocus
                                    disabled={disabled || isUrlLoading}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!urlInput || disabled || isUrlLoading}
                                className="p-2 bg-orange-600 hover:bg-orange-500 text-white rounded-sm disabled:opacity-50"
                            >
                                {isUrlLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowUrlInput(false)}
                                className="p-2 hover:bg-neutral-800 text-neutral-500 rounded-sm"
                                disabled={disabled}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </form>
                    ) : (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation()
                                setShowUrlInput(true)
                            }}
                            className="px-6 py-2 bg-transparent hover:bg-neutral-800/50 text-neutral-400 hover:text-orange-400 rounded-sm font-medium transition-colors border border-dashed border-neutral-700 hover:border-orange-500/50 flex items-center gap-2 uppercase text-sm tracking-wide"
                            disabled={disabled}
                        >
                            <LinkIcon className="w-4 h-4" />
                            Import URL
                        </button>
                    )}
                </div>

                {/* Decorations */}
                <div className="absolute top-4 left-4 text-neutral-800 font-mono text-xs tracking-widest pointer-events-none select-none">
                    SYS.READY
                </div>
                <div className="absolute bottom-4 right-4 text-neutral-800 font-mono text-xs tracking-widest pointer-events-none select-none">
                    V.2.0.4
                </div>
            </div>
        </div>
    )
}
