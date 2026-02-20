import { supabase } from './supabase'

interface TurnCredentials {
  iceServers: RTCIceServer[]
}

export async function getTurnCredentials(): Promise<RTCIceServer[]> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const { data, error } = await supabase.functions.invoke('turn-credentials', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })

    if (error) throw error

    const credentials = data as TurnCredentials
    return credentials.iceServers
  } catch {
    // Fallback to public STUN servers only
    return [{ urls: 'stun:stun.l.google.com:19302' }]
  }
}
