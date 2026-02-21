import { useState, useRef, useCallback, useEffect, type KeyboardEvent } from 'react'

interface MessageInputProps {
  onSend: (content: string) => void
  onTyping?: () => void
  onStopTyping?: () => void
}

export default function MessageInput({ onSend, onTyping, onStopTyping }: MessageInputProps) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      onStopTyping?.()
    }
  }, [onStopTyping])

  const handleChange = useCallback((value: string) => {
    setText(value)

    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }

    // Typing indicator
    if (value.trim()) {
      onTyping?.()
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => onStopTyping?.(), 2000)
    } else {
      onStopTyping?.()
    }
  }, [onTyping, onStopTyping])

  function handleSend() {
    if (!text.trim()) return
    onSend(text.trim())
    setText('')
    onStopTyping?.()
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="shrink-0 flex items-end gap-2 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] bg-white/90 border-t border-stroke-soft backdrop-blur-sm">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={e => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Mesaj yaz"
        rows={1}
        className="flex-1 min-w-0 resize-none rounded-2xl border border-gray-300 bg-white px-3 py-2.5 text-base outline-none focus:border-whatsapp-teal focus:ring-2 focus:ring-whatsapp-teal/20 transition max-h-[120px]"
        aria-label="Mesaj"
      />
      <button
        onClick={handleSend}
        disabled={!text.trim()}
        className="shrink-0 w-10 h-10 rounded-2xl bg-whatsapp-teal flex items-center justify-center text-white active:bg-whatsapp-dark transition-colors disabled:opacity-40 shadow-sm"
        aria-label="Mesaji gonder"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      </button>
    </div>
  )
}
