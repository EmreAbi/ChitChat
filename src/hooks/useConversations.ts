import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { ConversationWithDetails, MemberInfo } from '../lib/types'

export function useConversations() {
  const { session } = useAuth()
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  const fetchConversations = useCallback(async () => {
    if (!session) return
    const { data, error } = await supabase.rpc('get_user_conversations')
    if (!error && data) {
      setConversations(
        data.map(c => ({
          ...c,
          members: (c.members as unknown as MemberInfo[]) || [],
        }))
      )
    }
    setLoading(false)
  }, [session])

  useEffect(() => {
    fetchConversations()

    // Listen for new messages to refresh list
    const channel = supabase
      .channel('conversation-updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => {
          fetchConversations()
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'conversation_members' },
        () => {
          fetchConversations()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchConversations])

  return { conversations, loading, refetch: fetchConversations }
}
