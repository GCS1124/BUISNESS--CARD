import { FormEvent, useState } from 'react'
import { ArrowRight, Check, Eye, EyeOff, KeyRound, ShieldCheck, Sparkles, X } from 'lucide-react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { appPath } from '../lib/routing'
import { BrandLockup } from './BrandLockup'
import { useBranding } from './BrandingProvider'
import type { AppUser } from '../lib/types'

interface AuthScreenProps {
  onDemo: () => void
  onAuthenticated: (user: AppUser) => void
  variant?: 'page' | 'modal'
  onClose?: () => void
  title?: string
  description?: string
}

export function AuthScreen({ onDemo, onAuthenticated, variant = 'page', onClose, title: titleOverride, description: descriptionOverride }: AuthScreenProps) {
  const { branding } = useBranding()
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')
    try {
      if (!supabase) {
        onDemo()
        return
      }
      if (mode === 'forgot') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}${appPath('/reset-password')}` })
        if (resetError) throw resetError
        setMessage('If an account exists for that email, a reset link is on its way.')
        return
      }
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })
        if (signUpError) throw signUpError
        if (data.user && data.session) onAuthenticated({ id: data.user.id, email: data.user.email ?? email, name: name || email.split('@')[0] })
        else setMessage('Check your inbox to confirm your email. Your signature draft is safe in this browser.')
        return
      }
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) throw signInError
      if (data.user) onAuthenticated({ id: data.user.id, email: data.user.email ?? email, name: (data.user.user_metadata?.full_name as string) || email.split('@')[0] })
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Something went wrong. Try again.')
    } finally {
      setBusy(false)
    }
  }

  const title = titleOverride ?? (mode === 'signup' ? 'Create your identity' : mode === 'forgot' ? 'Reset your password' : 'Welcome back')
  const description = descriptionOverride ?? (mode === 'forgot' ? 'We will send a secure link to your inbox.' : 'Build a card that feels like you.')
  const formCard = <div className="auth-form-card">{variant === 'modal' && onClose && <button className="auth-modal-close" onClick={onClose} aria-label="Close authentication"><X size={17} /></button>}<div className="auth-heading"><p className="eyebrow">{isSupabaseConfigured ? 'Secure workspace' : 'Interactive demo'}</p><h2 id={variant === 'modal' ? 'auth-modal-title' : undefined}>{title}</h2><p>{description}</p></div><form onSubmit={submit}>{mode === 'signup' && <label className="field-label">Your name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex Morgan" autoComplete="name" required /></label>}<label className="field-label">Email address<input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" type="email" autoComplete="email" required /></label>{mode !== 'forgot' && <label className="field-label">Password<span className="password-wrap"><input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required minLength={6} /><button type="button" className="password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></span></label>}{error && <p className="form-error">{error}</p>}{message && <p className="form-success"><Check size={15} /> {message}</p>}<button className="button button-primary button-wide" disabled={busy}>{busy ? 'Working…' : mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Send reset link' : 'Sign in'} <ArrowRight size={16} /></button></form>{mode === 'login' && <button className="auth-link auth-forgot" onClick={() => { setMode('forgot'); setMessage(''); setError('') }}><KeyRound size={14} /> Forgot password?</button>}{mode !== 'forgot' && <p className="auth-switch">{mode === 'signup' ? 'Already have an account?' : `New to ${branding.productName}?`} <button onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(''); setMessage('') }}>{mode === 'signup' ? 'Sign in' : 'Create an account'}</button></p>}{mode === 'forgot' && <button className="auth-link" onClick={() => setMode('login')}>Back to sign in</button>}{!isSupabaseConfigured && <button className="demo-button" onClick={onDemo}><ShieldCheck size={15} /> Continue in demo mode <span>Local-only, no account needed</span></button>}</div>

  if (variant === 'modal') return <div className="auth-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title"><div className="auth-modal-card"><BrandLockup />{formCard}</div></div>
  return <main className="auth-page"><div className="auth-visual"><div className="auth-brand"><BrandLockup light /></div><div className="auth-visual-copy"><p className="eyebrow">Your digital first impression</p><h1>Be easy to remember.</h1><p>One beautiful card for every conversation, introduction, and opportunity.</p></div><div className="auth-quote"><Sparkles size={15} /> Designed for the moments that matter.</div></div><div className="auth-form-wrap">{formCard}<p className="auth-footer">By continuing, you agree to keep your links useful and your introductions human.</p></div></main>
}
