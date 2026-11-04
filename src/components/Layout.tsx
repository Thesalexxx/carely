import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { useIsMobile } from '../hooks/useIsMobile'
import { useState, useEffect } from 'react'

interface LayoutProps {
  userRole: 'older-adult' | 'caregiver'
}

export const Layout = ({ userRole }: LayoutProps) => {
  const isMobile = useIsMobile()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <Header
        userRole={userRole}
        onMenuToggle={() => setIsSidebarOpen((prev) => !prev)}
        isMenuOpen={isSidebarOpen && isMobile}
      />
      <div className="flex">
        {!isMobile && <Sidebar userRole={userRole} />}
        <main className={`flex-1 p-6 ${!isMobile ? 'ml-64' : ''}`}>
          <Outlet />
        </main>
      </div>

      {isMobile && isSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
          <Sidebar
            userRole={userRole}
            className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl z-50 border-r border-gray-200"
            onClose={() => setIsSidebarOpen(false)}
          />
        </>
      )}
    </div>
  )
}