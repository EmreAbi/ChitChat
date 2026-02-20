import { useState, useRef, useCallback, type KeyboardEvent } from 'react'

interface MessageInputProps {
  onSend: (content: string) => void
  onTyping?: () => void
  onStopTyping?: () => void
}

export default function MessageInput({ onSend, onTyping, onStopTyping }: MessageInputProps) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    <div className="shrink-0 flex items-end gap-2 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] bg-gray-100 border-t border-gray-200">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={e => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message"
        rows={1}
        className="flex-1 min-w-0 resize-none rounded-2xl border border-gray-300 bg-white px-3 py-2 text-base outline-none focus:border-whatsapp-teal max-h-[120px]"
      />
      <button
        onClick={handleSend}
        disabled={!text.trim()}
        className="shrink-0 w-10 h-10 rounded-full bg-whatsapp-teal flex items-center justify-center text-white active:bg-whatsapp-dark transition-colors disabled:opacity-40"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      </button>
    </div>
  )
}
