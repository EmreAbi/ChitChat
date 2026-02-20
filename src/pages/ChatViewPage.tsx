import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { usePresenceContext } from '../contexts/PresenceContext'
import { useMessages } from '../hooks/useMessages'
import { useTypingIndicator } from '../hooks/useTypingIndicator'
import ChatHeader from '../components/chat/ChatHeader'
import MessageBubble from '../components/chat/MessageBubble'
import MessageInput from '../components/chat/MessageInput'
import TypingIndicator from '../components/chat/TypingIndicator'
import LoadingSpinner from '../components/common/LoadingSpinner'
import type { ConversationWithDetails, MemberInfo } from '../lib/types'

export default function ChatViewPage() {
  const { id } = useParams<{ id: string }>()
  const { session } = useAuth()
  const { isOnline } = usePresenceContext()
  const { messages, loading, sendMessage } = useMessages(id)
  const { typingUsers, sendTyping, sendStopTyping } = useTypingIndicator(id)
  const [conversation, setConversation] = useState<ConversationWithDetails | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [readReceipts, setReadReceipts] = useState<Set<string>>(new Set())

  // Fetch conversation details
  useEffect(() => {
    if (!id) return
    async function fetchConversation() {
      const { data } = await supabase.rpc('get_user_conversations')
      if (data) {
        const conv = data.find(c => c.id === id)
        if (conv) {
          setConversation({
            ...conv,
            members: (conv.members as unknown as MemberInfo[]) || [],
          })
        }
      }
    }
    fetchConversation()
  }, [id])

  // Mark messages as read
  useEffect(() => {
    if (!id || !session) return
    supabase.rpc('mark_messages_read', { p_conversation_id: id })
  }, [id, session, messages.length])

  // Fetch read receipts
  useEffect(() => {
    if (!id || !session) return
    async function fetchReceipts() {
      const { data } = await supabase
        .from('message_read_receipts')
        .select('message_id')
        .in(
          'message_id',
          messages.filter(m => m.sender_id === session!.user.id).map(m => m.id)
        )
      if (data) {
        setReadReceipts(new Set(data.map(r => r.message_id)))
      }
    }
    if (messages.length > 0) fetchReceipts()

    // Listen for new read receipts
    const channel = supabase
      .channel(`receipts:${id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'message_read_receipts' },
        (payload) => {
          setReadReceipts(prev => new Set([...prev, payload.new.message_id]))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [id, session, messages.length])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingUsers.size])

  // Scroll button visibility
  function handleScroll() {
    if (!containerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 200)
  }

  if (!id) return null

  const otherMembers = conversation?.members.filter(m => m.user_id !== session?.user.id) ?? []
  const isGroup = conversation?.type === 'group'
  const displayName = isGroup
    ? conversation?.name || 'Group'
    : otherMembers[0]?.display_name || 'Chat'

  let subtitle: string | undefined
  if (isGroup) {
    subtitle = conversation?.members.map(m => m.display_name).join(', ')
  } else if (otherMembers[0] && isOnline(otherMembers[0].user_id)) {
    subtitle = 'online'
  }

  const otherMemberCount = otherMembers.length

  function getReadStatus(messageId: string): 'sent' | 'delivered' | 'read' {
    if (readReceipts.has(messageId)) return 'read'
    if (otherMemberCount > 0) return 'delivered'
    return 'sent'
  }

  return (
    <div className="flex flex-col h-full flex-1 bg-white">
      <ChatHeader
        name={displayName}
        avatarUrl={isGroup ? conversation?.avatar_url : otherMembers[0]?.avatar_url}
        subtitle={subtitle}
        online={!isGroup && otherMembers[0] ? isOnline(otherMembers[0].user_id) : undefined}
      />

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto chat-bg py-2"
      >
        {loading ? (
          <LoadingSpinner className="mt-12" />
        ) : (
          <>
            {messages.map((msg, i) => {
              const isOwn = msg.sender_id === session?.user.id
              const showSender = isGroup && !isOwn && (
                i === 0 || messages[i - 1].sender_id !== msg.sender_id
              )
              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isOwn={isOwn}
                  showSender={showSender}
                  readStatus={isOwn ? getReadStatus(msg.id) : undefined}
                />
              )
            })}
            <TypingIndicator typingUsers={typingUsers} />
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {showScrollBtn && (
        <button
          onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="absolute bottom-20 right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 z-10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}

      <MessageInput
        onSend={sendMessage}
        onTyping={sendTyping}
        onStopTyping={sendStopTyping}
      />
    </div>
  )
}
