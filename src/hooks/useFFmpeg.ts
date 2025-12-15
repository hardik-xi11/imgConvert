import { useState, useRef, useEffect, useCallback } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'

export function useFFmpeg() {
    const [loaded, setLoaded] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const ffmpegRef = useRef(new FFmpeg())

    const load = useCallback(async () => {
        if (loaded) return
        setIsLoading(true)
        setError(null)
        const ffmpeg = ffmpegRef.current

        ffmpeg.on('log', ({ message }) => {
            console.log('[FFmpeg]', message)
        })

        try {
            await ffmpeg.load({
                coreURL: await toBlobURL(`${window.location.origin}/ffmpeg/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${window.location.origin}/ffmpeg/ffmpeg-core.wasm`, 'application/wasm'),
            })
            setLoaded(true)
        } catch (error) {
            console.error("Failed to load ffmpeg factory", error)
            setError(error instanceof Error ? error.message : 'Failed to load FFmpeg engine')
        } finally {
            setIsLoading(false)
        }
    }, [loaded])

    useEffect(() => {
        load()
    }, [load])

    return { ffmpeg: ffmpegRef.current, loaded, isLoading, error, load }
}
