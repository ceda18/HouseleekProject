import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { useAuthStore } from '../../store/authStore'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <>
      <div className="app-bg" />
      <div className="flex min-h-screen">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <main className="flex-1 md:ml-60 min-h-screen">
          <div className="max-w-6xl mx-auto p-4 pt-20 md:p-8 md:pt-20 pb-28 md:pb-8">
            {children}
          </div>
        </main>
      </div>
      <div className="md:hidden">
        <MobileNav />
      </div>
    </>
  )
}
