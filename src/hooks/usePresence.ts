import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function usePresence() {
  const { session } = useAuth()
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!session) return

    const channel = supabase.channel('online-users', {
      config: { presence: { key: session.user.id } },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const userIds = new Set(Object.keys(state))
        setOnlineUsers(userIds)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: session.user.id })
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session])

  const isOnline = useCallback((userId: string) => onlineUsers.has(userId), [onlineUsers])

  return { onlineUsers, isOnline }
}
