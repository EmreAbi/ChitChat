interface TypingIndicatorProps {
  typingUsers: Map<string, string>
}

export default function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  if (typingUsers.size === 0) return null

  const names = Array.from(typingUsers.values())
  let text: string
  if (names.length === 1) {
    text = `${names[0]} yaziyor`
  } else if (names.length === 2) {
    text = `${names[0]} ve ${names[1]} yaziyor`
  } else {
    text = `${names[0]} ve ${names.length - 1} kisi yaziyor`
  }

  return (
    <div className="px-4 py-1.5">
      <div className="inline-flex items-center gap-1.5 bg-[#0f2319] border border-stroke-soft rounded-full px-3 py-1.5 shadow-sm">
        <div className="flex gap-0.5">
          <span className="w-1.5 h-1.5 bg-typing-dots rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 bg-typing-dots rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 bg-typing-dots rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
        <span className="text-xs text-whatsapp-green italic">{text}</span>
      </div>
    </div>
  )
}
