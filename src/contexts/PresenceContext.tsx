import { createContext, useContext, type ReactNode } from 'react'
import { usePresence } from '../hooks/usePresence'

interface PresenceContextType {
  onlineUsers: Set<string>
  isOnline: (userId: string) => boolean
}

const PresenceContext = createContext<PresenceContextType | undefined>(undefined)

export function PresenceProvider({ children }: { children: ReactNode }) {
  const presence = usePresence()

  return (
    <PresenceContext.Provider value={presence}>
      {children}
    </PresenceContext.Provider>
  )
}

export function usePresenceContext() {
  const context = useContext(PresenceContext)
  if (!context) throw new Error('usePresenceContext must be used within PresenceProvider')
  return context
}
