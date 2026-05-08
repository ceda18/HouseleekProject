import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { UserCircle, Save, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { userApi } from '../../api/user'
import { useAuthStore } from '../../store/authStore'
import { authApi } from '../../api/auth'
import { GlassCard } from '../../components/ui/GlassCard'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Spinner } from '../../components/ui/Spinner'
import { PageHeader } from '../../components/shared/PageHeader'
import { toast } from '../../lib/toast'

export function ProfilePage() {
  const { user, login, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try { await authApi.logout() } catch { /* ignore */ }
    logout()
    navigate('/login')
  }
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { data: profile, isLoading } = useQuery({
    queryKey: ['me', user?.userId],
    queryFn: () => userApi.getMe(user!.userId),
    enabled: !!user?.userId,
  })

  useEffect(() => {
    if (profile) {
      const parts = (profile.name ?? '').trim().split(/\s+/)
      setFirstName(parts[0] ?? '')
      setLastName(parts.slice(1).join(' '))
      setEmail(profile.email ?? '')
    }
  }, [profile])

  const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ')

  const update = useMutation({
    mutationFn: () =>
      userApi.updateUser({
        userId: user!.userId,
        name: fullName,
        email,
        password: password || undefined,
        role: profile?.role,
      }),
    onSuccess: () => {
      if (user) login({ token: localStorage.getItem('token')!, ...user, name: fullName })
      setPassword('')
      toast.success('Profile saved')
    },
  })

  if (isLoading) return <Spinner center />

  return (
    <div>
      <PageHeader title="Profile" subtitle="Manage your account information" />

      <div className="max-w-lg">
        <GlassCard shimmer className="p-6">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border/40">
            <div className="w-16 h-16 rounded-3xl bg-accent-soft flex items-center justify-center">
              <UserCircle size={32} className="text-accent" />
            </div>
            <div>
              <p className="text-lg font-semibold text-text-primary">{profile?.name}</p>
              <p className="text-sm text-text-muted">{profile?.email}</p>
              <Badge variant="accent" className="mt-1 capitalize">{profile?.role ?? 'user'}</Badge>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jane"
              />
              <Input
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
              />
            </div>

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <Input
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current"
            />

            <Button
              onClick={() => update.mutate()}
              loading={update.isPending}
              disabled={!firstName.trim() || !email}
              className="mt-2"
            >
              <Save size={15} /> Save Changes
            </Button>

            <div className="border-t border-border/40 pt-4 mt-2">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full text-red-400 border-red-200 hover:bg-red-50/60 hover:border-red-300"
              >
                <LogOut size={15} /> Logout
              </Button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
