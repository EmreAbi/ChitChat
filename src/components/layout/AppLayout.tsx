import { Outlet, useLocation } from 'react-router'
import ChatListPage from '../../pages/ChatListPage'
import EmptyState from '../common/EmptyState'

export default function AppLayout() {
  const location = useLocation()
  const isRootPath = location.pathname === '/'
  const showRightPanel = !isRootPath

  return (
    <div className="h-[100dvh] w-full overflow-hidden md:p-5">
      <div className="mx-auto flex h-full max-w-7xl flex-col overflow-hidden md:flex-row md:rounded-[28px] md:border md:border-stroke-soft md:bg-surface-elevated/85 md:shadow-[0_24px_80px_rgba(7,94,84,0.22)] md:backdrop-blur-xl">
        {/* Mobile: show either list or detail */}
        <div className={`h-full w-full md:block md:w-[390px] md:shrink-0 md:border-r md:border-stroke-soft ${showRightPanel ? 'hidden' : ''}`}>
          <ChatListPage />
        </div>

        {/* Right panel: detail view */}
        <div className={`h-full flex-1 md:block ${showRightPanel ? '' : 'hidden'}`}>
          {showRightPanel ? (
            <Outlet />
          ) : (
            <div className="h-full bg-surface flex items-center justify-center">
              <EmptyState
                icon="💬"
                title="ESA Web"
                description="Görüşmeleri soldan seçebilir, yeni bir sohbet başlatabilir ve gerçek zamanlı iletişim kurabilirsin."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
