import { Outlet, useLocation } from 'react-router'
import { useT } from '../../contexts/LanguageContext'
import ChatListPage from '../../pages/ChatListPage'
import EmptyState from '../common/EmptyState'

export default function AppLayout() {
  const location = useLocation()
  const { t } = useT()
  const isRootPath = location.pathname === '/'
  const showRightPanel = !isRootPath

  return (
    <div className="h-[100dvh] w-full overflow-hidden md:p-4">
      <div className="mx-auto flex h-full max-w-7xl flex-col overflow-hidden md:flex-row md:rounded-[24px] md:border md:border-stroke-soft md:bg-surface-elevated/96 md:shadow-[0_28px_90px_rgba(0,0,0,0.55)] md:backdrop-blur-xl">
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
                icon="🛡️"
                title={t('layout.emptyTitle')}
                description={t('layout.emptyDescription')}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
