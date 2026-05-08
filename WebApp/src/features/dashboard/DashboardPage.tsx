import { useNavigate } from 'react-router-dom'
import { Bot, Cpu, LayoutGrid, Zap, Timer } from 'lucide-react'
import logoH from '../../assets/logo-horizontal.png'
import { GlassCard } from '../../components/ui/GlassCard'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { useAuthStore } from '../../store/authStore'
import { useUnits } from '../../hooks/useUnits'
import { useScenes } from '../../hooks/useScenes'
import { useAutomations } from '../../hooks/useAutomations'
import { useActivity } from '../../hooks/useActivity'
import { StatCard } from './components/StatCard'
import { QuickActionsWidget } from './components/QuickActionsWidget'
import { LiveDevicesWidget } from './components/LiveDevicesWidget'
import { RecentActivityWidget } from './components/RecentActivityWidget'
import { ActivityChart } from './components/ActivityChart'

export function DashboardPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { units, isLoading: loadingUnits } = useUnits()
  const { scenes } = useScenes()
  const { automations } = useAutomations()
  const { logs, isLoading: loadingLogs } = useActivity()

  const totalRooms = units.reduce((acc, u) => acc + u.rooms.length, 0)
  const totalItems = units.reduce((acc, u) => acc + u.rooms.reduce((a, r) => a + r.items.length, 0), 0)
  const todayCount = logs.filter((l) => new Date(l.timestamp).toDateString() === new Date().toDateString()).length

  return (
    <div>
      <img src={logoH} alt="Houseleek" className="md:hidden h-16 w-auto mb-8" />

      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-text-primary">
          Hello, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-text-muted text-sm mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {loadingUnits ? <Spinner center /> : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={Cpu} label="Devices" value={totalItems} color="accent" />
          <StatCard icon={LayoutGrid} label="Rooms" value={totalRooms} color="green" />
          <StatCard icon={Zap} label="Scenes" value={scenes.length} color="amber" />
          <StatCard icon={Timer} label="Automations" value={automations.length} color="neutral" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <QuickActionsWidget scenes={scenes} automations={automations} />
        <LiveDevicesWidget units={units} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {loadingLogs ? (
          <GlassCard className="p-5 flex items-center justify-center"><Spinner /></GlassCard>
        ) : (
          <RecentActivityWidget logs={logs} units={units} />
        )}
        <ActivityChart logs={logs} />
      </div>

      <GlassCard variant="accent" className="p-5 flex items-center justify-between glass-shimmer">
        <div className="flex items-center gap-3">
          <Bot size={22} className="text-accent" />
          <div>
            <p className="font-semibold text-text-primary text-sm">Houseleek AI</p>
            <p className="text-xs text-text-muted">Ask anything about your home or get smart suggestions</p>
          </div>
        </div>
        <Button onClick={() => navigate('/ai')} size="sm">Open Chat</Button>
      </GlassCard>
    </div>
  )
}
