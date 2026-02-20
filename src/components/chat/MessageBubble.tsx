import type { MessageWithSender } from '../../hooks/useMessages'
import ReadReceipt from './ReadReceipt'

interface MessageBubbleProps {
  message: MessageWithSender
  isOwn: boolean
  showSender?: boolean
  readStatus?: 'sent' | 'delivered' | 'read'
}

const senderColors = [
  'text-emerald-600', 'text-blue-600', 'text-purple-600',
  'text-pink-600', 'text-amber-600', 'text-cyan-600',
]

function getSenderColor(name: string): string {
  const index = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % senderColors.length
  return senderColors[index]
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function MessageBubble({ message, isOwn, showSender, readStatus }: MessageBubbleProps) {
  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-2">
        <span className="bg-white/80 text-gray-500 text-xs px-3 py-1 rounded-lg shadow-sm">
          {message.content}
        </span>
      </div>
    )
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1 px-2`}>
      <div
        className={`relative max-w-[75%] px-3 py-1.5 rounded-lg shadow-sm ${
          isOwn
            ? 'bg-bubble-out bubble-tail-out mr-2'
            : 'bg-bubble-in bubble-tail-in ml-2'
        }`}
      >
        {showSender && message.sender && (
          <p className={`text-xs font-semibold mb-0.5 ${getSenderColor(message.sender.display_name)}`}>
            {message.sender.display_name}
          </p>
        )}
        <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
          {message.content}
          <span className="inline-flex items-center float-right ml-2 mt-1 gap-1">
            <span className="text-[11px] text-gray-500">{formatTime(message.created_at)}</span>
            {isOwn && readStatus && <ReadReceipt status={readStatus} />}
          </span>
        </p>
      </div>
    </div>
  )
}
