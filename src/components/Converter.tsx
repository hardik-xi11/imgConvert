import { useState, useEffect, useCallback } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'
import { FileDown, X, Loader2, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'
import { clsx } from 'clsx'

interface ConverterProps {
    files: File[]
    ffmpeg: FFmpeg
    onClear: () => void
}

type FileStatus = 'idle' | 'converting' | 'done' | 'error'
type TargetFormat = 'png' | 'jpeg' | 'webp'

interface FileState {
    file: File
    status: FileStatus
    outputUrl?: string
    error?: string
}

export function Converter({ files, ffmpeg, onClear }: ConverterProps) {
    const [targetFormat, setTargetFormat] = useState<TargetFormat>('png')
    const [fileStates, setFileStates] = useState<FileState[]>(
        files.map(file => ({ file, status: 'idle' }))
    )
    const [isConverting, setIsConverting] = useState(false)

    const convertFile = useCallback(async (fileState: FileState, index: number) => {
        const inputName = `input_${index}_${fileState.file.name.replace(/\s/g, '_')}`
        const outputName = `output_${index}.${targetFormat}`

        try {
            // Update status to converting
            setFileStates(prev => {
                const next = [...prev]
                next[index] = { ...next[index], status: 'converting', error: undefined }
                return next
            })

            const { file } = fileState

            await ffmpeg.writeFile(inputName, await fetchFile(file))

            const cmd = ['-i', inputName]
            cmd.push(outputName)

            await ffmpeg.exec(cmd)

            const data = await ffmpeg.readFile(outputName)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const blob = new Blob([data as any], { type: `image/${targetFormat}` })
            const url = URL.createObjectURL(blob)

            setFileStates(prev => {
                const next = [...prev]
                next[index] = { ...next[index], status: 'done', outputUrl: url }
                return next
            })

            // Clean up output file after reading
            await ffmpeg.deleteFile(outputName)

        } catch (err) {
            console.error(err)
            setFileStates(prev => {
                const next = [...prev]
                next[index] = { ...next[index], status: 'error', error: 'Conversion failed' }
                return next
            })
        } finally {
            // Always clean up input file
            try {
                await ffmpeg.deleteFile(inputName)
            } catch {
                // Ignore cleanup errors for input file (it might not have been written)
            }
        }
    }, [ffmpeg, targetFormat])

    const handleConvertAll = useCallback(async () => {
        setIsConverting(true)
        for (let i = 0; i < fileStates.length; i++) {
            if (fileStates[i].status !== 'done') {
                await convertFile(fileStates[i], i)
            }
        }
        setIsConverting(false)
    }, [fileStates, isConverting, convertFile])

    const downloadAll = useCallback(() => {
        fileStates.forEach(s => {
            if (s.outputUrl && s.status === 'done') {
                const link = document.createElement('a')
                link.href = s.outputUrl
                link.download = `${s.file.name.split('.')[0]}.${targetFormat}`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
            }
        })
    }, [fileStates, targetFormat])

    // Helper to format bytes
    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if user is typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

            if (e.shiftKey) {
                switch (e.key.toLowerCase()) {
                    case 'j': setTargetFormat('jpeg'); break
                    case 'p': setTargetFormat('png'); break
                    case 'w': setTargetFormat('webp'); break
                    case 'c': handleConvertAll(); break
                    case 'd': downloadAll(); break
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [handleConvertAll, downloadAll])

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            {/* Controls */}
            <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <button
                        onClick={onClear}
                        className="p-2 hover:bg-neutral-800 rounded-sm text-neutral-400 hover:text-neutral-200 transition-colors border border-transparent hover:border-neutral-700"
                        title="Clear all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="w-px h-6 bg-neutral-800 hidden sm:block"></div>
                    <div className="flex items-center gap-3">
                        <span className="text-neutral-500 font-mono text-xs uppercase tracking-wider">Target Format:</span>
                        <div className="relative">
                            <select
                                value={targetFormat}
                                onChange={(e) => setTargetFormat(e.target.value as TargetFormat)}
                                disabled={isConverting}
                                className="appearance-none bg-neutral-950 border border-neutral-800 text-orange-500 rounded-sm pl-3 pr-8 py-1.5 focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500/50 font-mono font-bold tracking-wide cursor-pointer text-sm hover:border-neutral-700 uppercase"
                            >
                                <option value="png">PNG</option>
                                <option value="jpeg">JPG</option>
                                <option value="webp">WEBP</option>
                            </select>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                <ArrowRight className="w-3 h-3 text-neutral-600 rotate-90" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {fileStates.some(s => s.status === 'done') && (
                        <button
                            onClick={downloadAll}
                            className="flex-1 sm:flex-none px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-sm font-medium transition-colors flex items-center justify-center gap-2 border border-neutral-700 hover:border-neutral-600 uppercase text-xs tracking-wider"
                        >
                            <FileDown className="w-4 h-4" />
                            Download All
                        </button>
                    )}
                    <button
                        onClick={handleConvertAll}
                        disabled={isConverting || fileStates.every(s => s.status === 'done')}
                        className={clsx(
                            "flex-1 sm:flex-none px-6 py-2 rounded-sm font-bold text-white transition-all transform active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wide text-sm",
                            isConverting
                                ? "bg-orange-600/50 cursor-wait border border-orange-600/20"
                                : "bg-orange-600 hover:bg-orange-500 shadow-lg shadow-orange-900/20 border border-orange-500 hover:border-orange-400"
                        )}
                    >
                        {isConverting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                Initiate Conversion <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* File List */}
            <div className="grid grid-cols-1 gap-2">
                {fileStates.map((state, index) => (
                    <div
                        key={index}
                        className="bg-neutral-900/50 border border-neutral-800/50 rounded-sm p-3 flex items-center justify-between group hover:border-neutral-700 transition-colors backdrop-blur-sm"
                    >
                        <div className="flex items-center gap-4 overflow-hidden">
                            <div className="w-12 h-12 bg-neutral-950 border border-neutral-800 rounded-sm flex items-center justify-center flex-shrink-0 p-1">
                                {/* Preview (optional) */}
                                <img
                                    src={URL.createObjectURL(state.file)}
                                    alt="preview"
                                    className="w-full h-full object-cover rounded-sm opacity-80"
                                    onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                                />
                            </div>
                            <div className="min-w-0">
                                <p className="text-neutral-200 font-medium truncate font-mono text-sm" title={state.file.name}>{state.file.name}</p>
                                <p className="text-neutral-500 text-xs font-mono">{formatSize(state.file.size)}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {state.status === 'done' && (
                                <a
                                    href={state.outputUrl}
                                    download={`${state.file.name.split('.')[0]}.${targetFormat}`}
                                    className="p-2 bg-green-500/5 text-green-500 border border-green-500/20 rounded-sm hover:bg-green-500/10 transition-colors"
                                    title="Download"
                                >
                                    <FileDown className="w-5 h-5" />
                                </a>
                            )}
                            {state.status === 'converting' && <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />}
                            {state.status === 'error' && (
                                <div title={state.error} className="flex items-center">
                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                </div>
                            )}
                            {state.status === 'done' && !state.outputUrl && <CheckCircle className="w-5 h-5 text-green-500" />} {/* Fallback check */}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
