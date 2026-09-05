import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { authApi } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import logoV from '../../assets/logo-vertical.png'

export function LoginPage() {
  const { isAuthenticated, login } = useAuthStore()
  const navigate = useNavigate()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const switchMode = (next: 'login' | 'register') => {
    setMode(next)
    setError('')
    setPassword('')
    setConfirmPassword('')
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        return
      }
      setLoading(true)
      try {
        await authApi.register({ name, surname, email, password })
        const res = await authApi.login({ email, password })
        login(res)
        navigate('/dashboard')
      } catch {
        setError('Registration failed. Email may already be in use.')
      } finally {
        setLoading(false)
      }
      return
    }

    setLoading(true)
    try {
      const res = await authApi.login({ email, password })
      login(res)
      navigate('/dashboard')
    } catch {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="app-bg" />
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-strong glass-shimmer rounded-3xl p-8 w-full max-w-sm">
         <div className="flex flex-col items-center mb-8">
           
            <img src={logoV} alt="Houseleek" className="h-24 w-auto mb-3" />
            <p className="text-sm text-text-muted">
              {mode === 'login' ? 'Sign in to your smart home' : 'Create your account'}
            </p>
            <p className="text-xs text-text-muted mt-2 px-3 py-1 bg-gray-100 rounded-full text-center">
              {mode === 'login' ? (
              <>Demo account: <strong>pera.peric@gmail.com / lozinka123</strong> — feel free to explore</>
              ) : 'Use login to use demo account.'}
            </p>
           
          </div>

          {/* Toggle */}
          <div className="flex glass-subtle rounded-2xl p-1 mb-6">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                mode === 'login'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                mode === 'register'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'register' && (
              <>
                <Input
                  label="First Name"
                  type="text"
                  placeholder="John"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
                <Input
                  label="Last Name"
                  type="text"
                  placeholder="Doe"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  required
                />
              </>
            )}

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus={mode === 'login'}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {mode === 'register' && (
              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            )}

            {error && (
              <div className="glass-subtle rounded-xl px-3 py-2 border border-red-200">
                <p className="text-xs text-red-500">{error}</p>
              </div>
            )}

            <Button type="submit" loading={loading} size="lg" className="mt-1 w-full">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}
