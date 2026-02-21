import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useT } from '../contexts/LanguageContext'
import Avatar from '../components/common/Avatar'
import ConfirmDialog from '../components/common/ConfirmDialog'
import AddMemberModal from '../components/room/AddMemberModal'
import LoadingSpinner from '../components/common/LoadingSpinner'
import type { ConversationWithDetails, MemberInfo } from '../lib/types'

export default function RoomSettingsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { session } = useAuth()
  const { t } = useT()
  const [conversation, setConversation] = useState<ConversationWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [roomName, setRoomName] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState<MemberInfo | null>(null)
  const [confirmLeave, setConfirmLeave] = useState(false)

  async function fetchConversation() {
    if (!id) return
    const { data } = await supabase.rpc('get_user_conversations')
    if (data) {
      const conv = data.find(c => c.id === id)
      if (conv) {
        const parsed: ConversationWithDetails = {
          ...conv,
          members: (conv.members as unknown as MemberInfo[]) || [],
        }
        setConversation(parsed)
        setRoomName(parsed.name || '')
      } else {
        navigate('/', { replace: true })
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchConversation()
  }, [id])

  if (loading) {
    return (
      <div className="flex flex-col h-full w-full bg-surface-elevated">
        <LoadingSpinner className="mt-12" />
      </div>
    )
  }

  if (!conversation || !session) return null

  const currentMember = conversation.members.find(m => m.user_id === session.user.id)
  const isAdmin = currentMember?.role === 'admin'
  const adminCount = conversation.members.filter(m => m.role === 'admin').length
  const isLastAdmin = isAdmin && adminCount <= 1

  async function handleSaveName() {
    if (!id || !roomName.trim()) return
    setSavingName(true)
    await supabase
      .from('conversations')
      .update({ name: roomName.trim() })
      .eq('id', id)
    setConversation(prev => prev ? { ...prev, name: roomName.trim() } : prev)
    setSavingName(false)
  }

  async function handleRemoveMember(member: MemberInfo) {
    if (!id) return
    await supabase.rpc('remove_room_member', {
      p_conversation_id: id,
      p_user_id: member.user_id,
    })
    setConfirmRemove(null)
    fetchConversation()
  }

  async function handleLeaveRoom() {
    if (!id || !session) return
    await supabase.rpc('remove_room_member', {
      p_conversation_id: id,
      p_user_id: session.user.id,
    })
    navigate('/', { replace: true })
  }

  return (
    <div className="flex flex-col h-full w-full bg-surface-elevated">
      {/* Header */}
      <header className="bg-header-bg text-header-text flex items-center gap-3 px-2 py-3 border-b border-stroke-soft shadow-md z-10">
        <button onClick={() => navigate(`/chat/${id}`)} className="p-1 hover:bg-whatsapp-green/10 rounded-xl transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className="font-semibold">{t('roomSettings.title')}</h2>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Room name */}
        <div className="p-4 border-b border-stroke-soft">
          <label className="text-[11px] font-semibold text-text-muted tracking-wider mono-ui mb-2 block">
            {t('roomSettings.roomName')}
          </label>
          {isAdmin ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={roomName}
                onChange={e => setRoomName(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-stroke-soft bg-[#13261d] text-text-primary focus:border-whatsapp-teal focus:ring-2 focus:ring-whatsapp-teal/20 outline-none text-sm"
              />
              <button
                onClick={handleSaveName}
                disabled={savingName || roomName.trim() === conversation.name}
                className="px-4 py-2.5 rounded-xl bg-whatsapp-green text-[#06110d] text-sm font-semibold hover:bg-[#72ffb4] transition-colors disabled:opacity-50"
              >
                {savingName ? t('roomSettings.saving') : t('roomSettings.saveName')}
              </button>
            </div>
          ) : (
            <p className="text-text-primary text-sm">{conversation.name}</p>
          )}
        </div>

        {/* Members section */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-[11px] font-semibold text-text-muted tracking-wider mono-ui">
              {t('roomSettings.members')} ({conversation.members.length})
            </label>
            {isAdmin && (
              <button
                onClick={() => setShowAddMember(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-whatsapp-green text-[#06110d] hover:bg-[#72ffb4] transition-colors mono-ui"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                {t('roomSettings.addMember')}
              </button>
            )}
          </div>

          <div className="space-y-1">
            {conversation.members.map(member => (
              <div key={member.user_id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#13271e] transition-colors">
                <Avatar name={member.display_name} avatarUrl={member.avatar_url} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-primary text-sm truncate">
                    {member.display_name}
                    {member.user_id === session.user.id && (
                      <span className="text-text-muted font-normal ml-1">(you)</span>
                    )}
                  </p>
                </div>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full mono-ui ${
                  member.role === 'admin'
                    ? 'bg-whatsapp-green/15 text-whatsapp-green border border-whatsapp-green/30'
                    : 'bg-[#13261d] text-text-muted border border-stroke-soft'
                }`}>
                  {member.role === 'admin' ? t('roomSettings.admin') : t('roomSettings.member')}
                </span>
                {isAdmin && member.user_id !== session.user.id && (
                  <button
                    onClick={() => setConfirmRemove(member)}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
                  >
                    {t('roomSettings.removeMember')}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leave room button */}
      <div className="p-4 border-t border-stroke-soft">
        {isLastAdmin ? (
          <p className="text-xs text-text-muted text-center">{t('roomSettings.lastAdminWarning')}</p>
        ) : (
          <button
            onClick={() => setConfirmLeave(true)}
            className="w-full py-3 rounded-xl text-sm font-semibold bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 transition-colors"
          >
            {t('roomSettings.leaveRoom')}
          </button>
        )}
      </div>

      {/* Modals */}
      {showAddMember && (
        <AddMemberModal
          conversationId={id!}
          currentMembers={conversation.members}
          onClose={() => setShowAddMember(false)}
          onMemberAdded={() => {
            setShowAddMember(false)
            fetchConversation()
          }}
        />
      )}

      {confirmRemove && (
        <ConfirmDialog
          title={t('confirm.removeMember')}
          message={t('confirm.removeMemberMessage').replace('{name}', confirmRemove.display_name)}
          confirmLabel={t('confirm.confirm')}
          cancelLabel={t('confirm.cancel')}
          destructive
          onConfirm={() => handleRemoveMember(confirmRemove)}
          onCancel={() => setConfirmRemove(null)}
        />
      )}

      {confirmLeave && (
        <ConfirmDialog
          title={t('confirm.leaveRoom')}
          message={t('confirm.leaveRoomMessage')}
          confirmLabel={t('confirm.confirm')}
          cancelLabel={t('confirm.cancel')}
          destructive
          onConfirm={handleLeaveRoom}
          onCancel={() => setConfirmLeave(false)}
        />
      )}
    </div>
  )
}
