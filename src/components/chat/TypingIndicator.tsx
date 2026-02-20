interface TypingIndicatorProps {
  typingUsers: Map<string, string>
}

export default function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  if (typingUsers.size === 0) return null

  const names = Array.from(typingUsers.values())
  let text: string
  if (names.length === 1) {
    text = `${names[0]} is typing`
  } else if (names.length === 2) {
    text = `${names[0]} and ${names[1]} are typing`
  } else {
    text = `${names[0]} and ${names.length - 1} others are typing`
  }

  return (
    <div className="px-4 py-1">
      <div className="inline-flex items-center gap-1.5 bg-white rounded-lg px-3 py-1.5 shadow-sm">
        <div className="flex gap-0.5">
          <span className="w-1.5 h-1.5 bg-typing-dots rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 bg-typing-dots rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 bg-typing-dots rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
        <span className="text-xs text-whatsapp-teal italic">{text}</span>
      </div>
    </div>
  )
}
