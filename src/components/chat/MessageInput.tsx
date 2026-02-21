import { useState, useRef, useCallback, useEffect, type KeyboardEvent } from 'react'

interface MessageInputProps {
  onSend: (content: string) => void
  onTyping?: () => void
  onStopTyping?: () => void
  onFileSelect?: (file: File) => void
  uploading?: boolean
}

export default function MessageInput({ onSend, onTyping, onStopTyping, onFileSelect, uploading }: MessageInputProps) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file && onFileSelect) {
      onFileSelect(file)
    }
    e.target.value = ''
  }

  return (
    <div className="shrink-0 flex items-end gap-2 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] bg-white/90 border-t border-stroke-soft backdrop-blur-sm">
      {onFileSelect && (
        <>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center text-gray-500 hover:text-whatsapp-teal hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-40"
            aria-label="Dosya ekle"
          >
            {uploading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
              </svg>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,video/mp4,audio/mpeg"
          />
        </>
      )}
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
