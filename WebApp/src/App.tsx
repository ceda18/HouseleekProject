import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { Toaster } from './components/ui/Toaster'
import { LoginPage } from './features/auth/LoginPage'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { HomePage } from './features/home/HomePage'
import { WorkflowsPage } from './features/workflows/WorkflowsPage'
import { CatalogPage } from './features/catalog/CatalogPage'
import { ActivityPage } from './features/activity/ActivityPage'
import { AIChatPage } from './features/ai/AIChatPage'
import { ProfilePage } from './features/profile/ProfilePage'

export default function App() {
  return (
    <>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected — wrapped in AppLayout (auth guard inside) */}
        <Route path="/dashboard" element={<AppLayout><DashboardPage /></AppLayout>} />
        <Route path="/home" element={<AppLayout><HomePage /></AppLayout>} />
        <Route path="/workflows" element={<AppLayout><WorkflowsPage /></AppLayout>} />
        <Route path="/catalog" element={<AppLayout><CatalogPage /></AppLayout>} />
        <Route path="/activity" element={<AppLayout><ActivityPage /></AppLayout>} />
        <Route path="/ai" element={<AppLayout><AIChatPage /></AppLayout>} />
        <Route path="/profile" element={<AppLayout><ProfilePage /></AppLayout>} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      {/* Global toast renderer (subscribes to lib/toast bus) */}
      <Toaster />
    </>
  )
}
