import { supabase } from './supabase'

export async function getTurnCredentials(): Promise<RTCIceServer[]> {
  try {
    // Force token refresh by validating with the server
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) throw new Error('Not authenticated')

    // supabase.functions.invoke automatically attaches the refreshed JWT
    const { data, error } = await supabase.functions.invoke('turn-credentials')

    console.log('[TURN] Edge function response:', JSON.stringify(data), 'error:', error)

    if (error) throw error
    if (!data) throw new Error('No data returned')

    // Cloudflare returns { iceServers: [...] }
    const iceServers: RTCIceServer[] = data.iceServers
    if (!iceServers || iceServers.length === 0) {
      throw new Error('Empty ICE servers: ' + JSON.stringify(data))
    }

    // Always include STUN alongside TURN
    console.log('[TURN] Got ICE servers:', iceServers.length, 'servers')
    return [
      { urls: 'stun:stun.l.google.com:19302' },
      ...iceServers,
    ]
  } catch (err) {
    console.error('[TURN] Failed to get credentials:', err)
    // Fallback: STUN only — will NOT work across strict NATs
    return [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ]
  }
}
