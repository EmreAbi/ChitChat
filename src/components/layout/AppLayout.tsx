import { Outlet, useLocation } from 'react-router'
import ChatListPage from '../../pages/ChatListPage'
import EmptyState from '../common/EmptyState'

export default function AppLayout() {
  const location = useLocation()
  const isRootPath = location.pathname === '/'
  const showRightPanel = !isRootPath

  return (
    <div className="h-full flex flex-col md:flex-row md:max-w-6xl md:mx-auto md:my-0 md:shadow-xl md:h-screen">
      {/* Mobile: show either list or detail */}
      <div className={`h-full w-full md:w-[400px] md:block md:shrink-0 ${showRightPanel ? 'hidden' : ''}`}>
        <ChatListPage />
      </div>

      {/* Right panel: detail view */}
      <div className={`h-full flex-1 md:block ${showRightPanel ? '' : 'hidden'}`}>
        {showRightPanel ? (
          <Outlet />
        ) : (
          <div className="h-full bg-chat-bg flex items-center justify-center">
            <EmptyState
              icon="💬"
              title="ChitChat Web"
              description="Send and receive messages. Select a chat or start a new one."
            />
          </div>
        )}
      </div>
    </div>
  )
}
