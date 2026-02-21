import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useT } from '../contexts/LanguageContext'
import { usePresenceContext } from '../contexts/PresenceContext'
import { useCall } from '../contexts/CallContext'
import { useMessages } from '../hooks/useMessages'
import { useTypingIndicator } from '../hooks/useTypingIndicator'
import { useFileUpload } from '../hooks/useFileUpload'
import { VOICE_EFFECTS, getStoredVoiceEffect, setStoredVoiceEffect, type VoiceEffect } from '../lib/voiceEffects'
import ChatHeader from '../components/chat/ChatHeader'
import MessageBubble from '../components/chat/MessageBubble'
import MessageInput from '../components/chat/MessageInput'
import TypingIndicator from '../components/chat/TypingIndicator'
import LoadingSpinner from '../components/common/LoadingSpinner'
import type { ConversationWithDetails, MemberInfo } from '../lib/types'

function toDayKeyFromDate(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function toDayKey(dateStr: string): string {
  return toDayKeyFromDate(new Date(dateStr))
}

export default function ChatViewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { session, profile } = useAuth()
  const { lang, t } = useT()
  const { isOnline } = usePresenceContext()
  const { startCall } = useCall()
  const { messages, loading, sendMessage } = useMessages(id)
  const { typingUsers, sendTyping, sendStopTyping } = useTypingIndicator(id)
  const { uploading, uploadFile } = useFileUpload(id)
  const [conversation, setConversation] = useState<ConversationWithDetails | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hasInitialScroll = useRef(false)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [readReceipts, setReadReceipts] = useState<Set<string>>(new Set())
  const [showCallModal, setShowCallModal] = useState(false)
  const [selectedEffect, setSelectedEffect] = useState<VoiceEffect>(getStoredVoiceEffect)

  function formatDayLabel(dateStr: string): string {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(today.getDate() - 1)

    if (toDayKeyFromDate(date) === toDayKeyFromDate(today)) {
      return t('chat.today')
    }
    if (toDayKeyFromDate(date) === toDayKeyFromDate(yesterday)) {
      return t('chat.yesterday')
    }

    const locale = lang === 'tr' ? 'tr-TR' : 'en-US'
    return date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      weekday: 'short',
    })
  }

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
        } else if (!profile?.is_system_admin) {
          // User is not a member (removed/left) - redirect to home
          navigate('/', { replace: true })
        }
      }
    }
    fetchConversation()
  }, [id, navigate])

  // Mark messages as read
  useEffect(() => {
    if (!id || !session) return
    supabase.rpc('mark_messages_read', { p_conversation_id: id }).then(({ error }) => {
      if (error) console.error('[mark_messages_read] failed:', error)
    })
  }, [id, session, messages.length])

  // Fetch read receipts
  useEffect(() => {
    if (!id || !session || messages.length === 0) return

    const myMessageIds = messages.filter(m => m.sender_id === session.user.id).map(m => m.id)
    const myMessageIdSet = new Set(myMessageIds)
    if (myMessageIds.length === 0) return

    async function fetchReceipts() {
      const { data } = await supabase
        .from('message_read_receipts')
        .select('message_id')
        .in('message_id', myMessageIds)
      if (data) {
        setReadReceipts(new Set(data.map(r => r.message_id)))
      }
    }
    fetchReceipts()

    // Listen for new read receipts (no filter for reliability)
    const channel = supabase
      .channel(`receipts:${id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'message_read_receipts' },
        (payload) => {
          const receipt = payload.new as { message_id: string; user_id: string }
          if (myMessageIdSet.has(receipt.message_id)) {
            setReadReceipts(prev => new Set([...prev, receipt.message_id]))
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [id, messages, session])

  // Auto-scroll
  useEffect(() => {
    if (!hasInitialScroll.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
      hasInitialScroll.current = true
      return
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingUsers.size])

  // Scroll button visibility
  function handleScroll() {
    if (!containerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 200)
  }

  const otherMembers = conversation?.members.filter(m => m.user_id !== session?.user.id) ?? []
  const isGroup = conversation?.type === 'group'

  function handleCallClick() {
    setSelectedEffect(getStoredVoiceEffect())
    setShowCallModal(true)
  }

  function handleCallStart() {
    if (!id || !otherMembers[0]) return
    setStoredVoiceEffect(selectedEffect)
    setShowCallModal(false)

    if (isGroup) {
      // Group call: pass all other members
      const groupMembers = otherMembers.map(m => ({
        id: m.user_id,
        displayName: m.display_name,
        avatarUrl: m.avatar_url,
      }))
      startCall(id, null, selectedEffect, groupMembers)
    } else {
      // 1:1 call
      const member = otherMembers[0]
      startCall(id, {
        id: member.user_id,
        displayName: member.display_name,
        avatarUrl: member.avatar_url,
      }, selectedEffect)
    }
  }

  if (!id) return null

  const displayName = isGroup
    ? conversation?.name || t('chat.group')
    : otherMembers[0]?.display_name || t('chat.secureChat')

  let subtitle: string | undefined
  if (isGroup) {
    subtitle = conversation?.members.map(m => m.display_name).join(', ')
  } else if (otherMembers[0] && isOnline(otherMembers[0].user_id)) {
    subtitle = t('chat.online')
  }

  const otherMemberCount = otherMembers.length

  function getReadStatus(messageId: string): 'sent' | 'delivered' | 'read' {
    if (readReceipts.has(messageId)) return 'read'
    if (otherMemberCount > 0) return 'delivered'
    return 'sent'
  }

  return (
    <div className="flex flex-col h-[100dvh] md:h-full flex-1 bg-surface relative">
      <ChatHeader
        name={displayName}
        avatarUrl={isGroup ? conversation?.avatar_url : otherMembers[0]?.avatar_url}
        subtitle={subtitle}
        online={!isGroup && otherMembers[0] ? isOnline(otherMembers[0].user_id) : undefined}
        isGroup={isGroup}
        showCallButton={true}
        onCall={handleCallClick}
        onSettingsClick={isGroup ? () => navigate(`/room/${id}/settings`) : undefined}
      />

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto chat-bg py-2 min-h-0"
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
              const showDaySeparator = i === 0 || toDayKey(messages[i - 1].created_at) !== toDayKey(msg.created_at)
              return (
                <div key={msg.id}>
                  {showDaySeparator && (
                    <div className="sticky top-2 z-[1] flex justify-center my-3">
                      <span className="bg-[#0f2319]/95 border border-stroke-soft rounded-full px-3 py-1 text-[11px] font-medium text-text-muted shadow-sm backdrop-blur-sm mono-ui">
                        {formatDayLabel(msg.created_at)}
                      </span>
                    </div>
                  )}
                  <MessageBubble
                    message={msg}
                    isOwn={isOwn}
                    showSender={showSender}
                    readStatus={isOwn ? getReadStatus(msg.id) : undefined}
                  />
                </div>
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
          className="absolute bottom-20 right-4 w-10 h-10 bg-[#13261d] border border-stroke-soft rounded-xl shadow-lg flex items-center justify-center text-text-primary hover:bg-[#183329] z-10"
          aria-label={t('chat.scrollDown')}
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
        onFileSelect={uploadFile}
        uploading={uploading}
      />

      {/* Voice effect picker modal */}
      {showCallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowCallModal(false)}>
          <div className="bg-[#0f1f18] rounded-3xl border border-stroke-soft shadow-2xl p-6 mx-4 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-text-primary mb-4 text-center mono-ui">{t('voiceEffect.selectTitle')}</h3>
            {/* Normal - large primary option */}
            <button
              type="button"
              onClick={() => setSelectedEffect('normal')}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors border mb-3 ${
                selectedEffect === 'normal'
                  ? 'bg-whatsapp-teal/20 border-whatsapp-green text-whatsapp-green'
                  : 'bg-[#13261d] border-stroke-soft text-text-primary hover:bg-[#183329]'
              }`}
            >
              {t('voiceEffect.normal')}
            </button>
            {/* Other effects - smaller buttons */}
            <div className="grid grid-cols-4 gap-1.5 mb-5">
              {VOICE_EFFECTS.filter(ve => ve.id !== 'normal').map(ve => (
                <button
                  key={ve.id}
                  type="button"
                  onClick={() => setSelectedEffect(ve.id)}
                  className={`px-2 py-2 rounded-xl text-xs font-medium transition-colors border ${
                    selectedEffect === ve.id
                      ? 'bg-whatsapp-teal/20 border-whatsapp-green text-whatsapp-green'
                      : 'bg-[#13261d] border-stroke-soft text-text-muted hover:bg-[#183329]'
                  }`}
                >
                  {t(ve.labelKey)}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleCallStart}
              className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {t('voiceEffect.call')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
