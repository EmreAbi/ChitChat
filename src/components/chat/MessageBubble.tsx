import type { MessageWithSender } from '../../hooks/useMessages'
import ReadReceipt from './ReadReceipt'
import { parseFileContent, formatFileSize, isImageMimeType } from '../../lib/types'

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
  return new Date(dateStr).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
}

function ImageContent({ url, name }: { url: string; name: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block">
      <img
        src={url}
        alt={name}
        className="rounded-lg max-w-full max-h-64 object-cover"
        loading="lazy"
      />
    </a>
  )
}

function FileContent({ url, name, size }: { url: string; name: string; size: number }) {
  const ext = name.split('.').pop()?.toUpperCase() || ''
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-2 rounded-lg bg-[#0f2019] hover:bg-[#173226] border border-stroke-soft transition-colors"
    >
      <div className="shrink-0 w-10 h-10 rounded-lg bg-whatsapp-teal/20 flex items-center justify-center">
        <svg className="w-5 h-5 text-whatsapp-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text-primary truncate">{name}</p>
        <p className="text-xs text-text-muted">{ext} &middot; {formatFileSize(size)}</p>
      </div>
    </a>
  )
}

export default function MessageBubble({ message, isOwn, showSender, readStatus }: MessageBubbleProps) {
  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-2 px-4">
        <span className="bg-[#0f2119] border border-stroke-soft text-text-muted text-xs px-3 py-1.5 rounded-full shadow-sm mono-ui">
          {message.content}
        </span>
      </div>
    )
  }

  const isFileMessage = message.type === 'image' || message.type === 'file'
  const fileContent = isFileMessage ? parseFileContent(message.content) : null

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1 px-3`}>
      <div
        className={`relative max-w-[78%] px-3 py-2 rounded-2xl border shadow-sm ${
          isOwn
            ? 'bg-bubble-out border-[#27563f] mr-1'
            : 'bg-bubble-in border-[#1f3b2f] ml-1'
        }`}
      >
        {showSender && message.sender && (
          <p className={`text-xs font-semibold mb-1 ${getSenderColor(message.sender.display_name)}`}>
            {message.sender.display_name}
          </p>
        )}
        {fileContent && isImageMimeType(fileContent.mimeType) ? (
          <ImageContent url={fileContent.url} name={fileContent.name} />
        ) : fileContent ? (
          <FileContent url={fileContent.url} name={fileContent.name} size={fileContent.size} />
        ) : (
          <p className="text-sm leading-relaxed text-text-primary whitespace-pre-wrap break-words">
            {message.content}
          </p>
        )}
        <div className="mt-1.5 flex items-center justify-end gap-1">
          <span className="text-[11px] text-text-muted mono-ui">{formatTime(message.created_at)}</span>
          {isOwn && readStatus && <ReadReceipt status={readStatus} />}
        </div>
      </div>
    </div>
  )
}
