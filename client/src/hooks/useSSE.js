/**
 * useSSE — Hook for consuming Server-Sent Events streams.
 * Handles buffering, parsing, abort control, and memory guards.
 */
import { useState, useRef, useCallback, useEffect } from 'react'
import { MAX_SSE_BUFFER_BYTES } from '../utils/constants'

export function useSSE() {
    const [events, setEvents] = useState([])
    const [isStreaming, setIsStreaming] = useState(false)
    const [error, setError] = useState(null)
    const abortRef = useRef(null)
    const bufferRef = useRef('')
    const bufferBytesRef = useRef(0)

    const startStream = useCallback(async (url, options = {}) => {
        // Abort any previous stream
        if (abortRef.current) abortRef.current.abort()
        const controller = new AbortController()
        abortRef.current = controller

        setIsStreaming(true)
        setError(null)
        setEvents([])
        bufferRef.current = ''
        bufferBytesRef.current = 0

        const { onComplete, onError, body, method = 'POST' } = options

        try {
            const response = await fetch(url, {
                method,
                body,
                signal: controller.signal,
                ...(body instanceof FormData ? {} : { headers: { 'Content-Type': 'application/json' } }),
            })

            if (!response.ok) {
                let msg = `Server returned ${response.status}`
                try { const d = await response.json(); if (d.message) msg = d.message } catch (_) { }
                throw new Error(msg)
            }

            const reader = response.body.getReader()
            const decoder = new TextDecoder()

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value, { stream: true })
                bufferRef.current += chunk
                bufferBytesRef.current += chunk.length

                // Memory guard: force-flush if buffer exceeds limit
                if (bufferBytesRef.current > MAX_SSE_BUFFER_BYTES) {
                    processBuffer(true)
                }

                // Parse SSE frames
                processBuffer(false)
            }

            // Process remaining buffer
            processBuffer(false)
            setIsStreaming(false)
            if (onComplete) onComplete()
        } catch (err) {
            if (err.name === 'AbortError') {
                setIsStreaming(false)
                return
            }
            setError(err.message)
            setIsStreaming(false)
            if (onError) onError(err)
        } finally {
            if (abortRef.current === controller) abortRef.current = null
        }
    }, [])

    const processBuffer = useCallback((forceFlush) => {
        const frames = bufferRef.current.split('\n\n')

        if (forceFlush) {
            // Process all complete frames, discard oldest half
            bufferRef.current = frames.pop() || ''
            bufferBytesRef.current = bufferRef.current.length
        } else {
            // Keep incomplete last frame
            bufferRef.current = frames.pop() || ''
            bufferBytesRef.current = bufferRef.current.length
        }

        const newEvents = []

        for (const frame of frames) {
            const eventLine = frame.match(/^event: (.+)$/m)
            const dataLine = frame.match(/^data: (.+)$/m)
            if (!eventLine || !dataLine) continue

            const eventType = eventLine[1].trim()
            let payload
            try { payload = JSON.parse(dataLine[1]) } catch (_) { continue }

            newEvents.push({ type: eventType, ...payload })
        }

        if (newEvents.length > 0) {
            setEvents(prev => [...prev, ...newEvents])
        }
    }, [])

    const abort = useCallback(() => {
        if (abortRef.current) {
            abortRef.current.abort()
            abortRef.current = null
        }
        setIsStreaming(false)
    }, [])

    const reset = useCallback(() => {
        abort()
        setEvents([])
        setError(null)
        bufferRef.current = ''
        bufferBytesRef.current = 0
    }, [abort])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortRef.current) abortRef.current.abort()
        }
    }, [])

    return { events, isStreaming, error, startStream, abort, reset }
}
