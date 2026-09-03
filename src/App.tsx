import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent, ReactNode } from 'react'
import {
  Archive,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Grid2X2,
  KeyRound,
  Lightbulb,
  LayoutTemplate,
  Link2,
  LogOut,
  Mail,
  Menu,
  MoreHorizontal,
  PanelLeft,
  Palette,
  Plus,
  QrCode,
  Save,
  Search,
  Share2,
  Settings2,
  Sparkles,
  Trash2,
  TrendingUp,
  Upload,
  UserRound,
  X,
  Zap,
} from 'lucide-react'
import QRCode from 'qrcode'
import { AuthScreen } from './components/AuthScreen'
import { BrandLockup } from './components/BrandLockup'
import { BrandingPage } from './components/BrandingPage'
import { useBranding } from './components/BrandingProvider'
import { DirectFieldEditor, InlineFieldEditor } from './components/FieldEditor'
import { EmailSignaturesPage } from './components/EmailSignaturesPage'
import { EventLeadCapturePage, PublicEventLeadForm } from './components/EventLeadCapturePage'
import type { EventPageView } from './components/EventLeadCapturePage'
import { IconBadge } from './components/IconBadge'
import { PhonePreview } from './components/PhonePreview'
import { categoryOrder, definitionFor, fieldDefinitions } from './lib/fieldDefinitions'
import { createSeedBundle, defaultDesign, defaultUser, makeId, readLocalBundles, readLocalUser, slugify, writeLocalBundles, writeLocalUser } from './lib/storage'
import { clearGuestSignature, readGuestSignature, readLocalSignatures, writeGuestSignature, writeLocalSignatures } from './lib/signatureStorage'
import { createDefaultSignature, createGuestSignature, duplicateSignature, normalizeSignature } from './lib/signatures'
import { deleteRemoteBundle, deleteRemoteSignature, isSupabaseConfigured, loadPublicBundle, loadRemoteBundles, loadRemoteSignatures, persistRemoteBundle, persistRemoteSignature, remoteCardUrl, supabase, uploadCardAsset } from './lib/supabase'
import { appPath, pathInsideApp } from './lib/routing'
import { cardTemplates } from './lib/templateCatalog'
import type { CardTemplate } from './lib/templateCatalog'
import type { AppUser, Card, CardBundle, CardField, DesignSettings, EmailSignature, FieldCategory, FieldDefinition, FieldType } from './lib/types'

type AppRoute = 'dashboard' | 'builder' | 'public' | 'reset' | 'overview' | 'templates' | 'insights' | 'email-signatures' | 'branding' | 'event-lead-capture' | 'event-public'
type SaveState = 'saved' | 'saving' | 'error'
type CardUpdate = Omit<Partial<Card>, 'design'> & { design?: Partial<DesignSettings> }

const themePresets: Array<{ name: string; description: string; design: Partial<DesignSettings>; swatches: string[] }> = [
  { name: 'Professional', description: 'Clear, capable, considered', design: { headerColor: '#cde7e0', cardBackground: '#ffffff', accentColor: '#165c51', textColor: '#14221f', mode: 'light' }, swatches: ['#cde7e0', '#165c51'] },
  { name: 'Minimal', description: 'Quiet confidence', design: { headerColor: '#e9e7df', cardBackground: '#ffffff', accentColor: '#353531', textColor: '#22221f', mode: 'light' }, swatches: ['#e9e7df', '#353531'] },
  { name: 'Modern', description: 'Fresh, bright, direct', design: { headerColor: '#d8d2ff', cardBackground: '#fbfaff', accentColor: '#5746c7', textColor: '#241f43', mode: 'light' }, swatches: ['#d8d2ff', '#5746c7'] },
  { name: 'Dark', description: 'A little more edge', design: { headerColor: '#233735', cardBackground: '#15211f', accentColor: '#b8f277', textColor: '#eff9f1', mode: 'dark' }, swatches: ['#233735', '#b8f277'] },
  { name: 'Executive', description: 'Crisp, warm, trusted', design: { headerColor: '#ded0bf', cardBackground: '#fffaf4', accentColor: '#835b3d', textColor: '#30251f', mode: 'light' }, swatches: ['#ded0bf', '#835b3d'] },
  { name: 'Creative', description: 'Bold enough to be yours', design: { headerColor: '#ffd4aa', cardBackground: '#fffdf8', accentColor: '#e25b35', textColor: '#321e18', mode: 'light' }, swatches: ['#ffd4aa', '#e25b35'] },
]

const routeFromLocation = (): { route: AppRoute; id?: string; eventView?: EventPageView } => {
  const path = pathInsideApp(window.location.pathname)
  if (path === '/cards' || path.startsWith('/dashboard')) return { route: 'dashboard' }
  if (path.startsWith('/builder/')) return { route: 'builder', id: decodeURIComponent(path.split('/')[2] ?? '') }
  if (path.startsWith('/card/')) return { route: 'public', id: decodeURIComponent(path.split('/')[2] ?? '') }
  if (path.startsWith('/reset-password')) return { route: 'reset' }
  if (path.startsWith('/overview')) return { route: 'overview' }
  if (path.startsWith('/templates')) return { route: 'templates' }
  if (path.startsWith('/insights')) return { route: 'insights' }
  if (path.startsWith('/email-signatures')) return { route: 'email-signatures' }
  if (path.startsWith('/branding')) return { route: 'branding' }
  if (path.startsWith('/events/') && path.endsWith('/connect')) return { route: 'event-public', id: decodeURIComponent(path.split('/')[2] ?? '') }
  if (path === '/event-lead-capture' || path === '/events') return { route: 'event-lead-capture', eventView: 'dashboard' }
  if (path === '/events/new') return { route: 'event-lead-capture', eventView: 'new' }
  if (path.startsWith('/events/')) {
    const segments = path.split('/').filter(Boolean)
    const view = segments[2] as EventPageView | undefined
    const allowedViews: EventPageView[] = ['edit', 'capture', 'leads', 'analytics', 'report', 'integrations']
    return { route: 'event-lead-capture', id: decodeURIComponent(segments[1] ?? ''), eventView: allowedViews.includes(view ?? 'edit') ? view : 'edit' }
  }
  return { route: 'overview' }
}

export default function App() {
  const { branding } = useBranding()
  const initialRoute = routeFromLocation()
  const [route, setRoute] = useState<AppRoute>(initialRoute.route)
  const [routeId, setRouteId] = useState(initialRoute.id)
  const [eventView, setEventView] = useState<EventPageView>(initialRoute.eventView ?? 'dashboard')
  const [user, setUser] = useState<AppUser | null>(null)
  const [bundles, setBundles] = useState<CardBundle[]>([])
  const [signatures, setSignatures] = useState<EmailSignature[]>([])
  const [guestSignature, setGuestSignature] = useState<EmailSignature | null>(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [signatureContinuationId, setSignatureContinuationId] = useState<string | null>(null)
  const [sessionReady, setSessionReady] = useState(false)
  const [remotePublicBundle, setRemotePublicBundle] = useState<CardBundle | undefined>()
  const [saveState, setSaveState] = useState<SaveState>('saved')
  const [saveError, setSaveError] = useState('')
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' } | null>(null)
  const saveTimer = useRef<number | undefined>(undefined)
  const signatureSaveTimer = useRef<number | undefined>(undefined)
  const guestClaimInFlight = useRef(false)
  const [signatureSaveState, setSignatureSaveState] = useState<SaveState>('saved')
  const [signatureSaveError, setSignatureSaveError] = useState('')
  const canPersistRemote = Boolean(isSupabaseConfigured && supabase && user && user.id !== defaultUser.id)

  const showToast = (message: string, tone: 'success' | 'error' = 'success') => {
    setToast({ message, tone })
    window.setTimeout(() => setToast(null), 3400)
  }

  const updateGuestSignature = (nextSignature: EmailSignature) => {
    const normalized = normalizeSignature({ ...nextSignature, userId: '' })
    setGuestSignature(normalized)
    writeGuestSignature(normalized)
  }

  const uploadGuestImage = async (value: string, userId: string, kind: 'profile' | 'logo') => {
    if (!isSupabaseConfigured || !supabase || !value.startsWith('data:image/')) return value
    const response = await fetch(value)
    const blob = await response.blob()
    const file = new File([blob], `signature-${kind}.${blob.type.split('/')[1] || 'png'}`, { type: blob.type || 'image/png' })
    return (await uploadCardAsset(file, userId, kind)) || value
  }

  const persistGuestAfterAuth = async (nextUser: AppUser, draftOverride?: EmailSignature | null) => {
    const pending = draftOverride ?? guestSignature ?? readGuestSignature()
    setUser(nextUser)
    writeLocalUser(nextUser)
    setAuthModalOpen(false)
    if (!pending) {
      void loadRemoteBundles(nextUser.id).then(setBundles).catch(() => setBundles([]))
      void loadRemoteSignatures(nextUser.id).then((nextSignatures) => setSignatures(nextSignatures.map((signature) => normalizeSignature(signature)))).catch(() => setSignatures([]))
      return
    }
    try {
      let saved = normalizeSignature({ ...pending, userId: nextUser.id, updatedAt: new Date().toISOString() })
      const [profileImageUrl, companyLogoUrl] = await Promise.all([uploadGuestImage(saved.profileImageUrl, nextUser.id, 'profile'), uploadGuestImage(saved.companyLogoUrl, nextUser.id, 'logo')])
      saved = normalizeSignature({ ...saved, profileImageUrl, companyLogoUrl })
      if (isSupabaseConfigured && supabase) await persistRemoteSignature(saved)
      setSignatures([saved])
      writeLocalSignatures([saved])
      clearGuestSignature()
      setGuestSignature(null)
      setSignatureContinuationId(saved.id)
      setSignatureSaveState('saved')
      showToast('Your signature is saved and ready to install')
      void loadRemoteBundles(nextUser.id).then(setBundles).catch(() => setBundles([]))
    } catch (error) {
      setSignatures([normalizeSignature({ ...pending, userId: nextUser.id })])
      setSignatureContinuationId(pending.id)
      setSignatureSaveState('error')
      setSignatureSaveError(error instanceof Error ? error.message : 'Could not save the signature yet.')
      showToast('Your signature is preserved. We could not finish saving it remotely.', 'error')
    }
  }

  const completeAuthenticatedUser = (nextUser: AppUser) => {
    if (guestClaimInFlight.current) return
    guestClaimInFlight.current = true
    void persistGuestAfterAuth(nextUser).finally(() => { guestClaimInFlight.current = false })
  }

  const uploadSignatureAsset = async (file: File, kind: 'profile' | 'logo') => {
    if (!user || !isSupabaseConfigured || !supabase || user.id === defaultUser.id) return null
    return uploadCardAsset(file, user.id, kind)
  }

  useEffect(() => {
    let active = true
    const boot = async () => {
      if (!isSupabaseConfigured || !supabase) {
        const localUser = readLocalUser()
        if (!active) return
        setUser(localUser)
        setBundles(readLocalBundles())
        setSignatures(readLocalSignatures().map((signature) => normalizeSignature(signature)))
        setSessionReady(true)
        return
      }
      if (initialRoute.route === 'public' && initialRoute.id) {
        try { setRemotePublicBundle(await loadPublicBundle(initialRoute.id)) } catch { /* the public page will show its not-found state */ }
      }
      const { data } = await supabase.auth.getSession()
      if (!active) return
      if (!data.session?.user) {
        if (initialRoute.route === 'email-signatures') {
          const draft = readGuestSignature() ?? createGuestSignature()
          setGuestSignature(normalizeSignature({ ...draft, userId: '' }))
          writeGuestSignature(normalizeSignature({ ...draft, userId: '' }))
        }
        setSessionReady(true)
        return
      }
      const remoteUser: AppUser = { id: data.session.user.id, email: data.session.user.email ?? '', name: (data.session.user.user_metadata?.full_name as string) || data.session.user.email?.split('@')[0] || `${branding.productName} member` }
      const pendingGuest = readGuestSignature()
      if (pendingGuest && initialRoute.route === 'email-signatures') {
        if (!guestClaimInFlight.current) {
          guestClaimInFlight.current = true
          void persistGuestAfterAuth(remoteUser, pendingGuest).finally(() => { guestClaimInFlight.current = false; if (active) setSessionReady(true) })
        }
      } else {
        setUser(remoteUser)
        writeLocalUser(remoteUser)
        try {
          const remoteBundles = await loadRemoteBundles(remoteUser.id)
          if (active) setBundles(remoteBundles)
          try {
            const remoteSignatures = await loadRemoteSignatures(remoteUser.id)
            if (active) setSignatures(remoteSignatures.map((signature) => normalizeSignature(signature)))
          } catch {
            if (active) setSignatures([])
          }
        } catch (error) {
          if (active) showToast(error instanceof Error ? error.message : 'Could not load your cards.', 'error')
        } finally {
          if (active) setSessionReady(true)
        }
      }
    }
    void boot()
    const authListener = supabase?.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const nextUser: AppUser = { id: session.user.id, email: session.user.email ?? '', name: (session.user.user_metadata?.full_name as string) || session.user.email?.split('@')[0] || `${branding.productName} member` }
        const pendingGuest = readGuestSignature()
        if (route === 'email-signatures' && pendingGuest && !guestClaimInFlight.current) {
          guestClaimInFlight.current = true
          void persistGuestAfterAuth(nextUser, pendingGuest).finally(() => { guestClaimInFlight.current = false })
        } else {
          setUser(nextUser)
          writeLocalUser(nextUser)
        }
      } else if (isSupabaseConfigured) setUser(null)
    })
    return () => {
      active = false
      authListener?.data.subscription.unsubscribe()
      if (saveTimer.current) window.clearTimeout(saveTimer.current)
      if (signatureSaveTimer.current) window.clearTimeout(signatureSaveTimer.current)
    }
  }, [])

  const navigate = (nextRoute: AppRoute, id?: string, nextEventView: EventPageView = 'dashboard') => {
    const path = nextRoute === 'dashboard' ? '/cards' : nextRoute === 'builder' ? `/builder/${id}` : nextRoute === 'public' ? `/card/${id}` : nextRoute === 'email-signatures' ? '/email-signatures' : nextRoute === 'event-public' ? `/events/${id}/connect` : nextRoute === 'event-lead-capture' ? nextEventView === 'dashboard' ? '/event-lead-capture' : nextEventView === 'new' ? '/events/new' : `/events/${id}/${nextEventView}` : `/${nextRoute}`
    window.history.pushState({}, '', appPath(path))
    setRoute(nextRoute)
    setRouteId(id)
    if (nextRoute === 'event-lead-capture') setEventView(nextEventView)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const updateBundle = (nextBundle: CardBundle, persist = true) => {
    const withTimestamp = { ...nextBundle, card: { ...nextBundle.card, updatedAt: new Date().toISOString() } }
    setBundles((current) => {
      const next = current.map((bundle) => bundle.card.id === withTimestamp.card.id ? withTimestamp : bundle)
      writeLocalBundles(next)
      return next
    })
    if (persist && canPersistRemote) {
      setSaveState('saving')
      setSaveError('')
      if (saveTimer.current) window.clearTimeout(saveTimer.current)
      saveTimer.current = window.setTimeout(() => {
        void persistRemoteBundle(withTimestamp).then(() => setSaveState('saved')).catch((error) => {
          const message = error instanceof Error ? error.message : 'Unable to save changes.'
          setSaveState('error')
          setSaveError(message)
          showToast('Could not save changes. Please try again.', 'error')
        })
      }, 700)
    } else setSaveState('saved')
  }

  const createCard = () => {
    if (!user) return
    const id = makeId()
    const now = new Date().toISOString()
    const card: Card = { id, userId: user.id, cardName: 'Untitled card', slug: `my-card-${id.slice(-4)}`, theme: 'Professional', design: { ...defaultDesign }, isPublished: false, createdAt: now, updatedAt: now }
    const bundle = { card, fields: [] }
    setBundles((current) => {
      const next = [...current, bundle]
      writeLocalBundles(next)
      return next
    })
    if (canPersistRemote) {
      setSaveState('saving')
      void persistRemoteBundle(bundle).then(() => setSaveState('saved')).catch((error) => {
        setSaveState('error')
        setSaveError(error instanceof Error ? error.message : 'Unable to save this card.')
        showToast('Could not save this card. Please try again.', 'error')
      })
    }
    navigate('builder', id)
  }

  const createCardFromTemplate = (template: CardTemplate) => {
    if (!user) return
    const id = makeId()
    const now = new Date().toISOString()
    const card: Card = { id, userId: user.id, cardName: `${template.name} card`, slug: `${slugify(user.name)}-${id.slice(-4)}`, theme: template.name, design: { ...defaultDesign, ...template.design }, isPublished: false, createdAt: now, updatedAt: now }
    const starterFields: Array<Pick<CardField, 'fieldType' | 'category' | 'label' | 'value' | 'iconKey'>> = [
      { fieldType: 'name', category: 'Personal', label: 'Name', value: user.name, iconKey: 'user' },
      { fieldType: 'job_title', category: 'Personal', label: 'Job title', value: template.role, iconKey: 'briefcase' },
      { fieldType: 'company', category: 'Personal', label: 'Company name', value: template.company, iconKey: 'building' },
      { fieldType: 'headline', category: 'Personal', label: 'Headline', value: template.headline, iconKey: 'sparkles' },
    ]
    const bundle: CardBundle = { card, fields: starterFields.map((field, sortOrder) => ({ ...field, id: makeId(), cardId: id, metadata: {}, sortOrder, isVisible: true })) }
    setBundles((current) => {
      const next = [...current, bundle]
      writeLocalBundles(next)
      return next
    })
    if (canPersistRemote) {
      setSaveState('saving')
      void persistRemoteBundle(bundle).then(() => setSaveState('saved')).catch((error) => {
        setSaveState('error')
        setSaveError(error instanceof Error ? error.message : 'Unable to save this card.')
        showToast('Could not save this card. Please try again.', 'error')
      })
    }
    navigate('builder', id)
  }

  const deleteCard = async (cardId: string) => {
    setBundles((current) => {
      const next = current.filter((bundle) => bundle.card.id !== cardId)
      writeLocalBundles(next)
      return next
    })
    if (canPersistRemote) {
      try { await deleteRemoteBundle(cardId) } catch { showToast('The card was removed locally, but could not be removed remotely.', 'error') }
    }
    showToast('Card deleted')
    if (route === 'builder') navigate('dashboard')
  }

  const persistSignatureImmediately = (signature: EmailSignature) => {
    setSignatureSaveState('saving')
    setSignatureSaveError('')
    void persistRemoteSignature(signature).then(() => setSignatureSaveState('saved')).catch((error) => {
      const message = error instanceof Error ? error.message : 'Unable to save this signature.'
      setSignatureSaveState('error')
      setSignatureSaveError(message)
      showToast('Could not save the email signature. Please try again.', 'error')
    })
  }

  const updateSignature = (nextSignature: EmailSignature) => {
    const withTimestamp = normalizeSignature({ ...nextSignature, updatedAt: new Date().toISOString() })
    setSignatures((current) => {
      const next = current.some((signature) => signature.id === withTimestamp.id) ? current.map((signature) => signature.id === withTimestamp.id ? withTimestamp : signature) : [...current, withTimestamp]
      writeLocalSignatures(next)
      return next
    })
    if (canPersistRemote) {
      setSignatureSaveState('saving')
      setSignatureSaveError('')
      if (signatureSaveTimer.current) window.clearTimeout(signatureSaveTimer.current)
      signatureSaveTimer.current = window.setTimeout(() => persistSignatureImmediately(withTimestamp), 700)
    } else setSignatureSaveState('saved')
  }

  const createSignature = () => {
    const nextSignature = createDefaultSignature(user ?? defaultUser)
    setSignatures((current) => {
      const next = [...current, nextSignature]
      writeLocalSignatures(next)
      return next
    })
    if (canPersistRemote) persistSignatureImmediately(nextSignature)
    return nextSignature
  }

  const duplicateExistingSignature = (source: EmailSignature) => {
    const nextSignature = duplicateSignature(source)
    setSignatures((current) => {
      const next = [...current, nextSignature]
      writeLocalSignatures(next)
      return next
    })
    if (canPersistRemote) persistSignatureImmediately(nextSignature)
    showToast('Signature duplicated')
    return nextSignature
  }

  const deleteSignature = async (signatureId: string) => {
    setSignatures((current) => {
      const next = current.filter((signature) => signature.id !== signatureId)
      writeLocalSignatures(next)
      return next
    })
    if (canPersistRemote) {
      try { await deleteRemoteSignature(signatureId) } catch { showToast('The signature was removed locally, but could not be removed remotely.', 'error') }
    }
    showToast('Signature deleted')
  }

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut()
    setUser(isSupabaseConfigured ? null : defaultUser)
    if (isSupabaseConfigured) setSignatures([])
    if (isSupabaseConfigured) navigate('dashboard')
  }

  const activeBundle = bundles.find((bundle) => bundle.card.id === routeId)
  const publicBundle = bundles.find((bundle) => bundle.card.slug === routeId) || remotePublicBundle

  if (!sessionReady) return <LoadingScreen />
  if (route === 'public') return <PublicCard bundle={publicBundle} onBack={() => navigate('dashboard')} onToast={showToast} />
  if (route === 'event-public') return <PublicEventLeadForm publicSlug={routeId ?? ''} />
  if (route === 'reset') return <ResetPasswordScreen onComplete={() => navigate('dashboard')} />
  if (route === 'overview') return <LandingPage bundle={bundles[0]} onCreate={() => user ? createCard() : navigate('dashboard')} onLogin={() => navigate('dashboard')} onOpenBuilder={() => activeBundle ? navigate('builder', activeBundle.card.id) : user ? createCard() : navigate('dashboard')} />
  if (!user && route === 'email-signatures') return <div className="app-shell guest-app-shell"><EmailSignaturesPage user={undefined} bundles={bundles} signatures={[]} guestSignature={guestSignature ?? createGuestSignature()} saveState={signatureSaveState} saveError={signatureSaveError} onCreate={() => guestSignature ?? createGuestSignature()} onUpdate={() => undefined} onGuestUpdate={updateGuestSignature} onDuplicate={() => guestSignature ?? createGuestSignature()} onDelete={async () => undefined} onCards={() => navigate('dashboard')} onTemplates={() => navigate('templates')} onInsights={() => navigate('insights')} onSignatures={() => undefined} onBranding={() => navigate('branding')} onSignOut={() => undefined} onRequestAuth={() => setAuthModalOpen(true)} onToast={showToast} />{toast && <Toast toast={toast} onClose={() => setToast(null)} />}{authModalOpen && <AuthScreen variant="modal" onClose={() => setAuthModalOpen(false)} title="Your signature is ready." description="Create a free Cardly account or sign in to save and install it." onDemo={() => { const draft = guestSignature ?? readGuestSignature(); const saved = draft ? normalizeSignature({ ...draft, userId: defaultUser.id }) : null; setUser(defaultUser); setBundles(readLocalBundles()); setSignatures(saved ? [saved] : readLocalSignatures().map((signature) => normalizeSignature(signature))); if (saved) writeLocalSignatures([saved]); clearGuestSignature(); setGuestSignature(null); setSignatureContinuationId(saved?.id ?? null); setAuthModalOpen(false); setSessionReady(true) }} onAuthenticated={completeAuthenticatedUser} />}</div>
  if (!user) return <AuthScreen onDemo={() => { setUser(defaultUser); setBundles(readLocalBundles()); setSignatures(readLocalSignatures().map((signature) => normalizeSignature(signature))); setSessionReady(true) }} onAuthenticated={completeAuthenticatedUser} />

  return <div className="app-shell">
    {route === 'dashboard' && <Dashboard user={user} bundles={bundles} onCreate={createCard} onCards={() => navigate('dashboard')} onEdit={(id) => navigate('builder', id)} onDelete={deleteCard} onOpenPublic={(slug) => navigate('public', slug)} onOverview={() => navigate('overview')} onTemplates={() => navigate('templates')} onInsights={() => navigate('insights')} onSignatures={() => navigate('email-signatures')} onBranding={() => navigate('branding')} onSignOut={signOut} />}
    {route === 'templates' && <TemplatesPage user={user} onCards={() => navigate('dashboard')} onOverview={() => navigate('overview')} onInsights={() => navigate('insights')} onSignatures={() => navigate('email-signatures')} onBranding={() => navigate('branding')} onCreate={createCard} onUseTemplate={createCardFromTemplate} onSignOut={signOut} />}
    {route === 'insights' && <InsightsPage user={user} bundles={bundles} onCards={() => navigate('dashboard')} onOverview={() => navigate('overview')} onTemplates={() => navigate('templates')} onSignatures={() => navigate('email-signatures')} onBranding={() => navigate('branding')} onCreate={createCard} onEdit={(id) => navigate('builder', id)} onSignOut={signOut} />}
    {route === 'email-signatures' && <EmailSignaturesPage user={user} bundles={bundles} signatures={signatures} initialSignatureId={signatureContinuationId} saveState={signatureSaveState} saveError={signatureSaveError} onCreate={createSignature} onUpdate={updateSignature} onDuplicate={duplicateExistingSignature} onDelete={deleteSignature} onCards={() => navigate('dashboard')} onTemplates={() => navigate('templates')} onInsights={() => navigate('insights')} onSignatures={() => undefined} onBranding={() => navigate('branding')} onSignOut={signOut} onUploadAsset={uploadSignatureAsset} onToast={showToast} />}
    {route === 'branding' && <div className="dashboard-layout"><WorkspaceSidebar active="branding" user={user} onCards={() => navigate('dashboard')} onOverview={() => navigate('overview')} onTemplates={() => navigate('templates')} onInsights={() => navigate('insights')} onSignatures={() => navigate('email-signatures')} onBranding={() => undefined} onSignOut={signOut} /><main className="dashboard-main workspace-page-main"><div className="mobile-workspace-bar"><BrandLockup /><button className="mobile-overview-link" onClick={() => navigate('dashboard')}><ArrowLeft size={14} /> Cards</button></div><BrandingPage /></main><MobileWorkspaceNav active="branding" onCards={() => navigate('dashboard')} onOverview={() => navigate('overview')} onTemplates={() => navigate('templates')} onInsights={() => navigate('insights')} onSignatures={() => navigate('email-signatures')} onBranding={() => undefined} onCreate={createCard} /></div>}
    {route === 'event-lead-capture' && <EventLeadCapturePage user={user} view={eventView} eventId={routeId} bundles={bundles} onNavigate={(view, id) => navigate('event-lead-capture', id, view)} onToast={showToast} />}
    {route === 'builder' && (activeBundle ? <Builder bundle={activeBundle} user={user} saveState={saveState} saveError={saveError} onBack={() => navigate('dashboard')} onUpdate={updateBundle} onToast={showToast} onOpenPublic={(slug) => navigate('public', slug)} /> : <EmptyRoute onCreate={createCard} onBack={() => navigate('dashboard')} />)}
    {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
  </div>
}

function LoadingScreen() {
  return <div className="loading-screen"><BrandLockup /><div className="loading-line" /></div>
}

interface DashboardProps {
  user: AppUser
  bundles: CardBundle[]
  onCreate: () => void
  onCards: () => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onOpenPublic: (slug: string) => void
  onOverview: () => void
  onTemplates: () => void
  onInsights: () => void
  onSignatures: () => void
  onBranding: () => void
  onSignOut: () => void
}

type WorkspaceSection = 'cards' | 'templates' | 'insights' | 'signatures' | 'branding' | 'events'

function WorkspaceSidebar({ active, user, onCards, onOverview, onTemplates, onInsights, onSignatures, onBranding, onSignOut, onEvents }: { active: WorkspaceSection; user: AppUser; onCards: () => void; onOverview: () => void; onTemplates: () => void; onInsights: () => void; onSignatures: () => void; onBranding: () => void; onSignOut: () => void; onEvents?: () => void }) {
  const goEvents = onEvents ?? (() => window.location.assign(appPath('/event-lead-capture')))
  return <aside className="sidebar"><BrandLockup /><div className="sidebar-label">Workspace</div><nav className="sidebar-nav" aria-label="Workspace navigation"><button className={`sidebar-link ${active === 'cards' ? 'sidebar-link-active' : ''}`} aria-current={active === 'cards' ? 'page' : undefined} onClick={onCards}><Grid2X2 size={17} /> My cards</button><button className={`sidebar-link ${active === 'templates' ? 'sidebar-link-active' : ''}`} aria-current={active === 'templates' ? 'page' : undefined} onClick={onTemplates}><LayoutTemplate size={17} /> Templates</button><button className={`sidebar-link ${active === 'signatures' ? 'sidebar-link-active' : ''}`} aria-current={active === 'signatures' ? 'page' : undefined} onClick={onSignatures}><Mail size={17} /> Email signatures</button><button className={`sidebar-link ${active === 'insights' ? 'sidebar-link-active' : ''}`} aria-current={active === 'insights' ? 'page' : undefined} onClick={onInsights}><Zap size={17} /> Insights</button><button className={`sidebar-link ${active === 'events' ? 'sidebar-link-active' : ''}`} aria-current={active === 'events' ? 'page' : undefined} onClick={goEvents}><QrCode size={17} /> Event lead capture</button><button className={`sidebar-link ${active === 'branding' ? 'sidebar-link-active' : ''}`} aria-current={active === 'branding' ? 'page' : undefined} onClick={onBranding}><Settings2 size={17} /> Branding</button></nav><div className="sidebar-bottom"><div className="sidebar-tip"><Sparkles size={16} /><p><strong>Make it yours.</strong><span>Set the identity people see across your workspace.</span></p></div><button className="user-menu" onClick={onSignOut}><span className="avatar-small">{initials(user.name)}</span><span className="user-menu-copy"><strong>{user.name}</strong><span>{isSupabaseConfigured ? user.email : 'Demo workspace'}</span></span><LogOut size={15} /></button></div></aside>
}

function MobileWorkspaceNav({ active, onCards, onOverview, onTemplates, onInsights, onSignatures, onBranding, onCreate, onEvents }: { active: WorkspaceSection; onCards: () => void; onOverview: () => void; onTemplates: () => void; onInsights: () => void; onSignatures: () => void; onBranding: () => void; onCreate: () => void; onEvents?: () => void }) {
  const goEvents = onEvents ?? (() => window.location.assign(appPath('/event-lead-capture')))
  return <nav className="mobile-bottom-nav" aria-label="Mobile workspace navigation"><button className={`mobile-bottom-link ${active === 'cards' ? 'mobile-bottom-link-active' : ''}`} aria-current={active === 'cards' ? 'page' : undefined} onClick={onCards}><Grid2X2 size={16} /><span>Cards</span></button><button className={`mobile-bottom-link ${active === 'templates' ? 'mobile-bottom-link-active' : ''}`} aria-current={active === 'templates' ? 'page' : undefined} onClick={onTemplates}><LayoutTemplate size={16} /><span>Templates</span></button><button className={`mobile-bottom-link ${active === 'signatures' ? 'mobile-bottom-link-active' : ''}`} aria-current={active === 'signatures' ? 'page' : undefined} onClick={onSignatures}><Mail size={16} /><span>Signatures</span></button><button className={`mobile-bottom-link ${active === 'insights' ? 'mobile-bottom-link-active' : ''}`} aria-current={active === 'insights' ? 'page' : undefined} onClick={onInsights}><Zap size={16} /><span>Insights</span></button><button className={`mobile-bottom-link ${active === 'events' ? 'mobile-bottom-link-active' : ''}`} aria-current={active === 'events' ? 'page' : undefined} onClick={goEvents}><QrCode size={16} /><span>Events</span></button><button className={`mobile-bottom-link ${active === 'branding' ? 'mobile-bottom-link-active' : ''}`} aria-current={active === 'branding' ? 'page' : undefined} onClick={onBranding}><Settings2 size={16} /><span>Branding</span></button><button className="mobile-bottom-create" onClick={onCreate}><span><Plus size={18} /></span><small>New</small></button></nav>
}

function Dashboard({ user, bundles, onCreate, onCards, onEdit, onDelete, onOpenPublic, onOverview, onTemplates, onInsights, onSignatures, onBranding, onSignOut }: DashboardProps) {
  const [search, setSearch] = useState('')
  const [menuId, setMenuId] = useState('')
  const [confirmId, setConfirmId] = useState('')
  const filtered = bundles.filter((bundle) => `${bundle.card.cardName} ${bundle.card.slug}`.toLowerCase().includes(search.toLowerCase()))
  const publishedCount = bundles.filter((bundle) => bundle.card.isPublished).length
  const dateLabel = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())
  return <div className="dashboard-layout">
    <WorkspaceSidebar active="cards" user={user} onCards={onCards} onOverview={onOverview} onTemplates={onTemplates} onInsights={onInsights} onSignatures={onSignatures} onBranding={onBranding} onSignOut={onSignOut} />
    <main className="dashboard-main">
      <div className="mobile-workspace-bar"><BrandLockup /><div className="mobile-workspace-actions"><button className="mobile-create-button" onClick={onCreate} aria-label="Create new card"><Plus size={16} /></button></div></div>
      <header className="dashboard-header"><div><p className="eyebrow">{dateLabel}</p><h1>Good morning, {user.name.split(' ')[0]}.</h1></div><button className="button button-primary" onClick={onCreate}><Plus size={17} /> Create new card</button></header>
      <div className="dashboard-stats"><StatCard label="Total cards" value={String(bundles.length).padStart(2, '0')} helper="Keep every introduction ready" icon={<FileText size={18} />} /><StatCard label="Published" value={String(publishedCount).padStart(2, '0')} helper="Visible to the people you share with" icon={<Eye size={18} />} /><StatCard label="Your workspace" value="Live" helper={isSupabaseConfigured ? 'Synced with Supabase' : 'Local demo mode'} icon={<Archive size={18} />} accent /></div>
      <div className="section-heading"><div><p className="eyebrow">Your collection</p><h2>My cards <span>{bundles.length}</span></h2></div><div className="search-wrap"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search cards" /></div></div>
      {bundles.length === 0 ? <EmptyState onCreate={onCreate} /> : <div className="dashboard-content-grid"><div className="card-grid">{filtered.map((bundle) => <CardTile key={bundle.card.id} bundle={bundle} menuOpen={menuId === bundle.card.id} onMenu={() => setMenuId(menuId === bundle.card.id ? '' : bundle.card.id)} onEdit={() => onEdit(bundle.card.id)} onDelete={() => setConfirmId(bundle.card.id)} onOpenPublic={() => onOpenPublic(bundle.card.slug)} />)}</div><WorkspaceSpotlight bundle={bundles[0]} onEdit={() => onEdit(bundles[0].card.id)} onOpenPublic={() => onOpenPublic(bundles[0].card.slug)} /></div>}
      {filtered.length === 0 && bundles.length > 0 && <div className="no-results">No cards match “{search}”.</div>}
      {confirmId && <ConfirmDialog title="Delete this card?" description="This removes the card and its fields. This action cannot be undone." confirmLabel="Delete card" onCancel={() => setConfirmId('')} onConfirm={() => { onDelete(confirmId); setConfirmId('') }} />}
    </main>
    <MobileWorkspaceNav active="cards" onCards={onCards} onOverview={onOverview} onTemplates={onTemplates} onInsights={onInsights} onSignatures={onSignatures} onBranding={onBranding} onCreate={onCreate} />
  </div>
}

function StatCard({ label, value, helper, icon, accent = false }: { label: string; value: string; helper: string; icon: ReactNode; accent?: boolean }) {
  return <div className={`stat-card ${accent ? 'stat-card-accent' : ''}`}><div className="stat-top"><span>{label}</span><span className="stat-icon">{icon}</span></div><strong>{value}</strong><p>{helper}</p></div>
}

const getCardReadiness = (bundle: CardBundle) => {
  const hasName = bundle.fields.some((field) => field.fieldType === 'name' && field.value.trim())
  const hasRole = bundle.fields.some((field) => ['job_title', 'company'].includes(field.fieldType) && field.value.trim())
  const hasConnection = bundle.fields.some((field) => ['phone', 'email', 'whatsapp'].includes(field.fieldType) && field.value.trim())
  return Math.round(([hasName && hasRole, hasConnection, bundle.card.isPublished].filter(Boolean).length / 3) * 100)
}

function WorkspaceSpotlight({ bundle, onEdit, onOpenPublic }: { bundle: CardBundle; onEdit: () => void; onOpenPublic: () => void }) {
  const hasName = bundle.fields.some((field) => field.fieldType === 'name' && field.value.trim())
  const hasRole = bundle.fields.some((field) => ['job_title', 'company'].includes(field.fieldType) && field.value.trim())
  const hasConnection = bundle.fields.some((field) => ['phone', 'email', 'whatsapp'].includes(field.fieldType) && field.value.trim())
  const checklist = [{ label: 'Name and role', done: hasName && hasRole }, { label: 'A way to connect', done: hasConnection }, { label: 'Published link', done: bundle.card.isPublished }]
  const completion = getCardReadiness(bundle)
  return <aside className="workspace-spotlight"><div className="spotlight-header"><div><p className="eyebrow">Card health</p><h3>{completion === 100 ? 'Ready to be remembered' : 'A few details to go'}</h3></div><span className="spotlight-status"><span className="spotlight-status-dot" />{completion === 100 ? 'All set' : 'On track'}</span></div><div className="spotlight-score"><div><strong>{completion}%</strong><span>share-ready</span></div><div className="spotlight-progress"><span style={{ width: `${completion}%` }} /></div></div><div className="spotlight-checklist">{checklist.map((item) => <div className={item.done ? 'spotlight-check spotlight-check-done' : 'spotlight-check'} key={item.label}><span>{item.done ? <Check size={12} /> : <span />}</span><p>{item.label}</p><small>{item.done ? 'Complete' : 'Next step'}</small></div>)}</div><div className="spotlight-actions"><button className="button button-primary" onClick={bundle.card.isPublished ? onOpenPublic : onEdit}>{bundle.card.isPublished ? 'View live card' : 'Finish card'} <ArrowUpRight size={14} /></button><button className="spotlight-secondary" onClick={onEdit}><Palette size={14} /> Customize</button></div></aside>
}

function TemplatesPage({ user, onCards, onOverview, onInsights, onSignatures, onBranding, onCreate, onUseTemplate, onSignOut }: { user: AppUser; onCards: () => void; onOverview: () => void; onInsights: () => void; onSignatures: () => void; onBranding: () => void; onCreate: () => void; onUseTemplate: (template: CardTemplate) => void; onSignOut: () => void }) {
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const categories = ['All', ...Array.from(new Set(cardTemplates.map((template) => template.category)))]
  const filtered = cardTemplates.filter((template) => (category === 'All' || template.category === category) && `${template.name} ${template.category} ${template.description} ${template.useCase}`.toLowerCase().includes(search.toLowerCase()))
  return <div className="dashboard-layout"><WorkspaceSidebar active="templates" user={user} onCards={onCards} onOverview={onOverview} onTemplates={() => undefined} onInsights={onInsights} onSignatures={onSignatures} onBranding={onBranding} onSignOut={onSignOut} /><main className="dashboard-main workspace-page-main"><div className="mobile-workspace-bar"><BrandLockup /><button className="mobile-overview-link" onClick={onCards}><ArrowLeft size={14} /> Cards</button></div><header className="workspace-page-header"><div className="workspace-page-heading"><div className="template-heading-kicker"><p className="eyebrow">Template library</p><span className="template-count-pill">{cardTemplates.length} curated designs</span></div><h1>Start with a point of view.</h1><p>Choose a visual starting point, then make it yours in the builder. Every template has its own generated artwork, palette, and starter content.</p></div><button className="button button-ghost" onClick={onCreate}><Plus size={16} /> Start blank</button></header><div className="workspace-toolbar"><div className="workspace-filter-chips" role="tablist" aria-label="Template categories">{categories.map((item) => <button className={category === item ? 'workspace-filter-chip workspace-filter-chip-active' : 'workspace-filter-chip'} key={item} onClick={() => setCategory(item)} role="tab" aria-selected={category === item}>{item}</button>)}</div><div className="search-wrap workspace-search"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${cardTemplates.length} templates`} aria-label="Search templates" /></div></div><div className="template-results-meta"><span>{filtered.length} {filtered.length === 1 ? 'template' : 'templates'}</span><span>Curated visual library · click any card to use it</span></div>{filtered.length ? <div className="template-grid">{filtered.map((template) => <TemplateCard key={template.id} template={template} onUse={() => onUseTemplate(template)} />)}</div> : <div className="workspace-empty"><div className="workspace-empty-icon"><Search size={20} /></div><h2>No templates found</h2><p>Try a different category or search term.</p><button className="button button-ghost" onClick={() => { setCategory('All'); setSearch('') }}>Clear filters</button></div>}</main><MobileWorkspaceNav active="templates" onCards={onCards} onOverview={onOverview} onTemplates={() => undefined} onInsights={onInsights} onSignatures={onSignatures} onBranding={onBranding} onCreate={onCreate} /></div>
}

function TemplateCard({ template, onUse }: { template: CardTemplate; onUse: () => void }) {
  const name = 'Your name'
  return <article className={`template-card ${template.featured ? 'template-card-featured' : ''}`}><div className="template-card-preview" style={{ backgroundColor: template.design.headerColor || '#cde7e0' }}><img className="template-card-art" src={template.imageUrl} alt={template.imageAlt} loading="lazy" /><div className="template-card-art-wash" /><div className="template-card-preview-top"><span>{template.featured ? 'Recommended' : template.category}</span><span className="template-card-dots">•••</span></div><div className="template-mini-card" style={{ background: template.design.cardBackground || '#fff', color: template.design.textColor || '#14221f' }}><div className="template-mini-avatar" style={{ background: template.design.accentColor || '#165c51' }}>{initials(name)}</div><div><strong>{name}</strong><span style={{ color: template.design.accentColor || '#165c51' }}>{template.role}</span><i style={{ background: template.design.accentColor || '#165c51' }} /></div></div></div><div className="template-card-content"><div><div className="template-card-meta"><p className="eyebrow">{template.name}</p><span>{template.category}</span></div><h2>{template.description}</h2><p>{template.useCase}</p></div><button className="template-use-button" onClick={onUse}>Use template <ArrowRight size={15} /></button></div></article>
}

function InsightsPage({ user, bundles, onCards, onOverview, onTemplates, onSignatures, onBranding, onCreate, onEdit, onSignOut }: { user: AppUser; bundles: CardBundle[]; onCards: () => void; onOverview: () => void; onTemplates: () => void; onSignatures: () => void; onBranding: () => void; onCreate: () => void; onEdit: (id: string) => void; onSignOut: () => void }) {
  const totalFields = bundles.reduce((total, bundle) => total + bundle.fields.filter((field) => field.value.trim()).length, 0)
  const averageReadiness = bundles.length ? Math.round(bundles.reduce((total, bundle) => total + getCardReadiness(bundle), 0) / bundles.length) : 0
  const connectedCards = bundles.filter((bundle) => bundle.fields.some((field) => ['phone', 'email', 'whatsapp'].includes(field.fieldType) && field.value.trim())).length
  return <div className="dashboard-layout"><WorkspaceSidebar active="insights" user={user} onCards={onCards} onOverview={onOverview} onTemplates={onTemplates} onInsights={() => undefined} onSignatures={onSignatures} onBranding={onBranding} onSignOut={onSignOut} /><main className="dashboard-main workspace-page-main"><div className="mobile-workspace-bar"><BrandLockup /><button className="mobile-overview-link" onClick={onCards}><ArrowLeft size={14} /> Cards</button></div><header className="workspace-page-header"><div className="workspace-page-heading"><p className="eyebrow">Profile insights</p><h1>Make every share count.</h1><p>A clear read on the details that make your digital introduction feel complete.</p></div><button className="button button-primary" onClick={onCreate}><Plus size={16} /> Add a card</button></header><div className="insight-metric-grid"><InsightMetric label="Share readiness" value={`${averageReadiness}%`} helper="Average across your cards" icon={<TrendingUp size={18} />} accent /><InsightMetric label="Published cards" value={String(bundles.filter((bundle) => bundle.card.isPublished).length).padStart(2, '0')} helper="Ready for real introductions" icon={<Eye size={18} />} /><InsightMetric label="Details added" value={String(totalFields).padStart(2, '0')} helper="Fields powering your cards" icon={<BarChart3 size={18} />} /><InsightMetric label="Connection coverage" value={`${bundles.length ? Math.round((connectedCards / bundles.length) * 100) : 0}%`} helper="Cards with a way to reach you" icon={<Share2 size={18} />} /></div><div className="insights-layout"><section className="insight-panel insight-readiness-panel"><div className="insight-panel-heading"><div><p className="eyebrow">Readiness by card</p><h2>Build confidence before you share.</h2></div><span className="insight-panel-badge"><TrendingUp size={13} /> Live snapshot</span></div>{bundles.length ? <div className="insight-card-list">{bundles.map((bundle) => { const name = bundle.fields.find((field) => field.fieldType === 'name')?.value || bundle.card.cardName; const readiness = getCardReadiness(bundle); return <button className="insight-card-row" key={bundle.card.id} onClick={() => onEdit(bundle.card.id)}><span className="insight-card-identity"><span className="insight-card-avatar" style={{ background: bundle.card.design.accentColor }}>{initials(name)}</span><span><strong>{bundle.card.cardName}</strong><small>{bundle.fields.filter((field) => field.value.trim()).length} details · {bundle.card.isPublished ? 'Published' : 'Draft'}</small></span></span><span className="insight-card-bar"><span style={{ width: `${readiness}%` }} /></span><strong className="insight-card-percent">{readiness}%</strong><ArrowRight size={14} className="insight-card-arrow" /></button> })}</div> : <div className="workspace-empty workspace-empty-inline"><div className="workspace-empty-icon"><BarChart3 size={20} /></div><h2>Your first insight is one card away.</h2><p>Create a card to see its share-readiness here.</p><button className="button button-primary" onClick={onCreate}><Plus size={15} /> Create card</button></div>}</section><aside className="insight-panel insight-recommendation"><div className="insight-recommendation-icon"><Lightbulb size={18} /></div><p className="eyebrow">Next best move</p><h2>{bundles.length && averageReadiness === 100 ? 'Your cards are ready for more conversations.' : 'Add one clear way for people to reach you.'}</h2><p>{bundles.length && averageReadiness === 100 ? 'Keep your strongest card visible, then make sharing part of your next introduction.' : 'A phone number, email, or WhatsApp link turns a good introduction into an easy next step.'}</p><button className="button button-ghost" onClick={bundles[0] ? () => onEdit(bundles[0].card.id) : onCreate}>{bundles[0] ? 'Improve my card' : 'Create my first card'} <ArrowUpRight size={14} /></button></aside></div></main><MobileWorkspaceNav active="insights" onCards={onCards} onOverview={onOverview} onTemplates={onTemplates} onInsights={() => undefined} onSignatures={onSignatures} onBranding={onBranding} onCreate={onCreate} /></div>
}

function InsightMetric({ label, value, helper, icon, accent = false }: { label: string; value: string; helper: string; icon: ReactNode; accent?: boolean }) {
  return <div className={`insight-metric ${accent ? 'insight-metric-accent' : ''}`}><div className="insight-metric-top"><span>{label}</span><span>{icon}</span></div><strong>{value}</strong><p>{helper}</p></div>
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return <div className="empty-state"><div className="empty-illustration"><span /><span /><span /></div><p className="eyebrow">Start with a blank canvas</p><h2>Your best introduction is one card away.</h2><p>Add the details people need, give it a point of view, and share it everywhere.</p><button className="button button-primary" onClick={onCreate}><Plus size={16} /> Create your first card</button></div>
}

function CardTile({ bundle, menuOpen, onMenu, onEdit, onDelete, onOpenPublic }: { bundle: CardBundle; menuOpen: boolean; onMenu: () => void; onEdit: () => void; onDelete: () => void; onOpenPublic: () => void }) {
  const { branding } = useBranding()
  const { card, fields } = bundle
  const name = fields.find((field) => field.fieldType === 'name')?.value || 'Untitled card'
  return <article className={`card-tile ${menuOpen ? 'card-tile-menu-open' : ''}`}><button className="card-tile-preview" onClick={onEdit}><div className="tile-cover" style={{ backgroundColor: card.design.headerColor, backgroundImage: card.design.coverImageUrl ? `url(${card.design.coverImageUrl})` : undefined }} /><div className="tile-card" style={{ background: card.design.cardBackground }}><div className="tile-avatar" style={{ background: card.design.accentColor }}>{card.design.profileImageUrl ? <img src={card.design.profileImageUrl} alt="" /> : initials(name)}</div><div className="tile-copy"><strong style={{ color: card.design.textColor }}>{name}</strong><span style={{ color: card.design.accentColor }}>{fields.find((field) => field.fieldType === 'job_title')?.value || 'Add a job title'}</span><i style={{ background: card.design.accentColor }} /></div></div><span className={`tile-status ${card.isPublished ? 'tile-status-live' : ''}`}>{card.isPublished ? 'Published' : 'Draft'}</span></button><div className="card-tile-footer"><div><h3>{card.cardName}</h3><button className="public-slug" onClick={onOpenPublic}>{branding.publicDomain}/{card.slug} <ExternalLink size={12} /></button></div><div className="tile-actions"><button className="icon-button" onClick={onEdit} aria-label="Edit card"><Edit3 size={15} /></button><div className="menu-wrap"><button className="icon-button" onClick={onMenu} aria-label="More actions"><MoreHorizontal size={16} /></button>{menuOpen && <div className="action-menu"><button onClick={onOpenPublic}><Eye size={14} /> View public card</button><button onClick={onEdit}><Edit3 size={14} /> Edit card</button><button className="danger-text" onClick={onDelete}><Trash2 size={14} /> Delete card</button></div>}</div></div></div></article>
}

interface BuilderProps {
  bundle: CardBundle
  user: AppUser
  saveState: SaveState
  saveError: string
  onBack: () => void
  onUpdate: (bundle: CardBundle) => void
  onToast: (message: string, tone?: 'success' | 'error') => void
  onOpenPublic: (slug: string) => void
}

function Builder({ bundle, user, saveState, saveError, onBack, onUpdate, onToast, onOpenPublic }: BuilderProps) {
  const { branding } = useBranding()
  const [panel, setPanel] = useState<'edit' | 'design'>('edit')
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit')
  const [editor, setEditor] = useState<{ definition: FieldDefinition; field?: CardField; location: 'active' | 'library' } | null>(null)
  const [confirmField, setConfirmField] = useState<CardField | null>(null)
  const [showQr, setShowQr] = useState(false)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [cardName, setCardName] = useState(bundle.card.cardName)
  const [slug, setSlug] = useState(bundle.card.slug)
  const [slugEditing, setSlugEditing] = useState(false)
  const [openCategories, setOpenCategories] = useState<Record<FieldCategory, boolean>>({ Personal: true, General: true, Social: false, Messaging: false, Business: false })
  const [search, setSearch] = useState('')
  const [assetBusy, setAssetBusy] = useState(false)

  useEffect(() => { setCardName(bundle.card.cardName); setSlug(bundle.card.slug) }, [bundle.card.id])

  const update = (next: CardUpdate) => {
    onUpdate({ ...bundle, card: { ...bundle.card, ...next, design: { ...bundle.card.design, ...(next.design ?? {}) } } })
  }
  const addField = (definition: FieldDefinition) => setEditor({ definition, location: 'library' })
  const editField = (field: CardField) => setEditor({ definition: definitionFor(field.fieldType), field, location: 'active' })
  const editLibraryField = (field: CardField) => setEditor({ definition: definitionFor(field.fieldType), field, location: 'library' })
  const saveField = (data: Omit<CardField, 'id' | 'cardId' | 'sortOrder' | 'isVisible'>) => {
    if (editor?.field) {
      onUpdate({ ...bundle, fields: bundle.fields.map((field) => field.id === editor.field?.id ? { ...field, ...data } : field) })
      onToast('Field updated')
    } else {
      const nextOrder = bundle.fields.length ? Math.max(...bundle.fields.map((field) => field.sortOrder)) + 1 : 0
      onUpdate({ ...bundle, fields: [...bundle.fields, { ...data, id: makeId(), cardId: bundle.card.id, sortOrder: nextOrder, isVisible: true }] })
      onToast(`${data.label} added to your card`)
    }
    setEditor(null)
  }
  const updateDirectField = (definition: FieldDefinition, value: string, metadata: Record<string, string> = {}) => {
    const existing = bundle.fields.find((field) => field.fieldType === definition.type)
    if (!existing && !value.trim()) return
    if (existing) {
      onUpdate({ ...bundle, fields: bundle.fields.map((field) => field.id === existing.id ? { ...field, value, metadata: { ...field.metadata, ...metadata } } : field) })
      return
    }
    const nextOrder = bundle.fields.length ? Math.max(...bundle.fields.map((field) => field.sortOrder)) + 1 : 0
    onUpdate({ ...bundle, fields: [...bundle.fields, { fieldType: definition.type, category: definition.category, label: definition.label, value, metadata, iconKey: definition.iconKey, id: makeId(), cardId: bundle.card.id, sortOrder: nextOrder, isVisible: true }] })
  }
  const deleteField = () => {
    if (!confirmField) return
    onUpdate({ ...bundle, fields: bundle.fields.filter((field) => field.id !== confirmField.id).map((field, index) => ({ ...field, sortOrder: index })) })
    setConfirmField(null)
    onToast('Field removed')
  }
  const toggleField = (field: CardField) => onUpdate({ ...bundle, fields: bundle.fields.map((item) => item.id === field.id ? { ...item, isVisible: !item.isVisible } : item) })
  const reorder = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return
    const ordered = [...bundle.fields].sort((a, b) => a.sortOrder - b.sortOrder)
    const sourceIndex = ordered.findIndex((field) => field.id === sourceId)
    const targetIndex = ordered.findIndex((field) => field.id === targetId)
    const [source] = ordered.splice(sourceIndex, 1)
    ordered.splice(targetIndex, 0, source)
    onUpdate({ ...bundle, fields: ordered.map((field, index) => ({ ...field, sortOrder: index })) })
  }
  const moveField = (fieldId: string, direction: -1 | 1) => {
    const ordered = [...bundle.fields].sort((a, b) => a.sortOrder - b.sortOrder)
    const index = ordered.findIndex((field) => field.id === fieldId)
    const nextIndex = index + direction
    if (index < 0 || nextIndex < 0 || nextIndex >= ordered.length) return
    const [item] = ordered.splice(index, 1)
    ordered.splice(nextIndex, 0, item)
    onUpdate({ ...bundle, fields: ordered.map((field, sortOrder) => ({ ...field, sortOrder })) })
  }
  const handleAsset = async (event: ChangeEvent<HTMLInputElement>, kind: 'profile' | 'cover' | 'logo') => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { onToast('Use a JPG, PNG, or WEBP image.', 'error'); return }
    if (file.size > 6 * 1024 * 1024) { onToast('Please choose an image smaller than 6 MB.', 'error'); return }
    setAssetBusy(true)
    try {
      const remoteUrl = await uploadCardAsset(file, user.id, kind)
      const url = remoteUrl || await readFile(file)
      const designKey = kind === 'profile' ? 'profileImageUrl' : kind === 'cover' ? 'coverImageUrl' : 'companyLogoUrl'
      update({ design: { [designKey]: url } })
      onToast(`${kind === 'logo' ? 'Company logo' : kind === 'cover' ? 'Cover image' : 'Profile photo'} updated`)
    } catch (error) { onToast(error instanceof Error ? error.message : 'Image upload failed.', 'error') } finally { setAssetBusy(false); event.target.value = '' }
  }
  const copyLink = async () => {
    await navigator.clipboard?.writeText(remoteCardUrl(bundle.card.slug))
    onToast('Public link copied')
  }
  const cardUrl = remoteCardUrl(bundle.card.slug)
  const activeByType = useMemo(() => new Map(fieldDefinitions.map((definition) => [definition.type, bundle.fields.filter((field) => field.fieldType === definition.type)])), [bundle.fields])
  const visibleDefinitions = fieldDefinitions.filter((definition) => `${definition.label} ${definition.description}`.toLowerCase().includes(search.toLowerCase()))
  return <div className="builder-shell">
    <header className="builder-header"><div className="builder-header-left"><button className="icon-button" onClick={onBack} aria-label="Back to cards"><ArrowLeft size={18} /></button><BrandLockup className="builder-brand" /><span className="header-divider" /><div className="builder-title-wrap"><input className="builder-title-input" value={cardName} onChange={(event) => { setCardName(event.target.value); update({ cardName: event.target.value }) }} aria-label="Card name" /><span className="builder-url">{branding.publicDomain}/{bundle.card.slug}</span></div></div><div className="builder-header-actions"><SaveStatus state={saveState} error={saveError} /><button className="button button-ghost button-preview-link" onClick={() => onOpenPublic(bundle.card.slug)}><Eye size={15} /> View card</button><button className="button button-primary" onClick={() => update({ isPublished: !bundle.card.isPublished })}>{bundle.card.isPublished ? 'Published' : 'Publish card'} <ChevronDown size={15} /></button></div></header>
    <div className="builder-mobile-tabs"><button className={mobileView === 'edit' ? 'active' : ''} onClick={() => setMobileView('edit')}><PanelLeft size={15} /> Edit</button><button className={mobileView === 'preview' ? 'active' : ''} onClick={() => setMobileView('preview')}><Eye size={15} /> Preview</button></div>
    <main className="builder-main">
      <section className={`preview-column ${mobileView === 'edit' ? 'mobile-hidden' : ''} `}><div className="preview-kicker"><div><p className="eyebrow">Live preview</p><h2>How it looks to others</h2></div><button className="preview-share" onClick={copyLink}><Share2 size={14} /> Share</button></div><div className="preview-stage"><PhonePreview bundle={bundle} onShare={copyLink} /><div className="preview-stage-note"><span className="live-dot" /> Updates as you edit</div></div><div className="preview-bottom-card"><div><p className="eyebrow">Public link</p><strong>{branding.publicDomain}/{bundle.card.slug}</strong></div><button className="icon-button" onClick={copyLink} aria-label="Copy public link"><Copy size={15} /></button></div></section>
      <section className={`editor-column ${mobileView === 'preview' ? 'mobile-hidden' : ''}`}><div className="builder-tabs"><button className={panel === 'edit' ? 'active' : ''} onClick={() => setPanel('edit')}><PanelLeft size={15} /> Edit fields</button><button className={panel === 'design' ? 'active' : ''} onClick={() => setPanel('design')}><Palette size={15} /> Design</button></div>{panel === 'edit' ? <div className="field-editor-panel"><div className="panel-heading"><div><p className="eyebrow">Build your card</p><h2>Add the details that matter.</h2><p>Fill in the fields directly. Empty fields stay out of your public card.</p></div><div className="field-search"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a field" /></div></div><div className="active-fields-section"><div className="subsection-heading"><div><p className="eyebrow">On your card</p><h3>{bundle.fields.length} fields <span>· Drag to reorder</span></h3></div><span className="active-count"><Check size={13} /> Live</span></div>{bundle.fields.length === 0 ? <div className="active-empty"><PanelLeft size={18} /><p>Your card is waiting for its first detail.</p><span>Start with your name below.</span></div> : <div className="active-fields-list">{[...bundle.fields].sort((a, b) => a.sortOrder - b.sortOrder).map((field, index) => <ActiveField key={field.id} field={field} index={index} total={bundle.fields.length} dragging={draggingId === field.id} editing={editor?.location === 'active' && editor.field?.id === field.id} onDragStart={() => setDraggingId(field.id)} onDragEnd={() => setDraggingId(null)} onDrop={() => { if (draggingId) reorder(draggingId, field.id); setDraggingId(null) }} onEdit={() => editField(field)} onDelete={() => setConfirmField(field)} onToggle={() => toggleField(field)} onMove={moveField} onCancel={() => setEditor(null)} onSave={saveField} />)}</div>}</div><div className="field-library">{categoryOrder.map((category) => { const definitions = visibleDefinitions.filter((definition) => definition.category === category); if (!definitions.length) return null; const expanded = openCategories[category]; return <div className="field-category" key={category}><button className="category-heading" onClick={() => setOpenCategories((current) => ({ ...current, [category]: !current[category] }))}><span>{category}</span><span className="category-meta">{definitions.reduce((total, definition) => total + (activeByType.get(definition.type)?.length ?? 0), 0) || ''}<ChevronDown size={16} className={expanded ? 'rotate' : ''} /></span></button>{expanded && <div className="field-options">{definitions.map((definition) => { const libraryEditor = editor?.location === 'library' && editor.definition.type === definition.type; const libraryField = libraryEditor ? editor.field : undefined; return <FieldOption key={definition.type} definition={definition} count={activeByType.get(definition.type)?.length ?? 0} field={activeByType.get(definition.type)?.[0]} direct={definition.category === 'Personal' || definition.category === 'General'} onDirectChange={updateDirectField} editing={libraryEditor} editingField={libraryField} onAdd={() => addField(definition)} onEdit={() => { const first = activeByType.get(definition.type)?.[0]; if (first) editLibraryField(first) }} onCancel={() => setEditor(null)} onSave={saveField} /> })}</div>}</div>})}</div></div> : <DesignPanel bundle={bundle} onUpdate={update} onAsset={handleAsset} assetBusy={assetBusy} slug={slug} slugEditing={slugEditing} onSlugChange={(next) => { setSlug(next); update({ slug: slugify(next) }) }} onSlugEditing={setSlugEditing} onToast={onToast} setShowQr={setShowQr} />}</section>
    </main>
    {confirmField && <ConfirmDialog title={`Remove ${confirmField.label || definitionFor(confirmField.fieldType).label}?`} description="This field will disappear from the card immediately. You can add it again any time." confirmLabel="Remove field" onCancel={() => setConfirmField(null)} onConfirm={deleteField} />}
    {showQr && <QrModal bundle={bundle} onClose={() => setShowQr(false)} onToast={onToast} />}
  </div>
}

function FieldOption({ definition, count, field, direct = false, onDirectChange, editing, editingField, onAdd, onEdit, onCancel, onSave }: { definition: FieldDefinition; count: number; field?: CardField; direct?: boolean; onDirectChange?: (definition: FieldDefinition, value: string, metadata?: Record<string, string>) => void; editing: boolean; editingField?: CardField; onAdd: () => void; onEdit: () => void; onCancel: () => void; onSave: (data: Omit<CardField, 'id' | 'cardId' | 'sortOrder' | 'isVisible'>) => void }) {
  if (direct) return <DirectFieldEditor definition={definition} field={field} onChange={(value, metadata) => onDirectChange?.(definition, value, metadata)} onBlur={(value, metadata) => onDirectChange?.(definition, value, metadata)} />
  return <div className={`field-option-wrap ${editing ? 'field-option-wrap-expanded' : ''}`}><div className={`field-option ${count ? 'field-option-active' : ''}`}><IconBadge iconKey={definition.iconKey} size="sm" /><div className="field-option-copy"><strong>{definition.label}</strong><span>{count ? `${count} added${definition.multiple ? ' · Add another' : ' · Edit below'}` : definition.description}</span></div>{editing ? <button className="add-field-button" onClick={onCancel} aria-label={`Cancel ${definition.label} editor`}><X size={16} /></button> : count && !definition.multiple ? <button className="field-option-state" onClick={onEdit}>Edit <Edit3 size={13} /></button> : <button className="add-field-button" onClick={onAdd} aria-label={`Add ${definition.label}`}><Plus size={17} /></button>}</div>{editing && <InlineFieldEditor definition={definition} field={editingField} onCancel={onCancel} onSave={onSave} />}</div>
}

function ActiveField({ field, index, total, dragging, editing, onDragStart, onDragEnd, onDrop, onEdit, onDelete, onToggle, onMove, onCancel, onSave }: { field: CardField; index: number; total: number; dragging: boolean; editing: boolean; onDragStart: () => void; onDragEnd: () => void; onDrop: () => void; onEdit: () => void; onDelete: () => void; onToggle: () => void; onMove: (id: string, direction: -1 | 1) => void; onCancel: () => void; onSave: (data: Omit<CardField, 'id' | 'cardId' | 'sortOrder' | 'isVisible'>) => void }) {
  const definition = definitionFor(field.fieldType)
  return <div className={`active-field ${dragging ? 'active-field-dragging' : ''} ${!field.isVisible ? 'active-field-hidden' : ''} ${editing ? 'active-field-editing' : ''}`} draggable={!editing} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragOver={(event) => event.preventDefault()} onDrop={onDrop}>{editing ? <InlineFieldEditor definition={definition} field={field} onCancel={onCancel} onSave={onSave} /> : <><button className="drag-handle" aria-label={`Drag ${field.label}`}><span /><span /><span /></button><IconBadge iconKey={field.metadata.iconKey || field.iconKey} size="sm" tone="neutral" /><div className="active-field-copy"><strong>{field.label || definition.label}</strong><span>{field.value || 'No value yet'}</span></div><div className="active-field-actions"><button className="mini-action" onClick={onToggle} aria-label={field.isVisible ? 'Hide field' : 'Show field'}>{field.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}</button><button className="mini-action" onClick={onEdit} aria-label="Edit field"><Edit3 size={14} /></button><div className="reorder-actions"><button disabled={index === 0} onClick={() => onMove(field.id, -1)} aria-label="Move field up">↑</button><button disabled={index === total - 1} onClick={() => onMove(field.id, 1)} aria-label="Move field down">↓</button></div><button className="mini-action mini-action-danger" onClick={onDelete} aria-label="Delete field"><Trash2 size={14} /></button></div></>}</div>
}

interface DesignPanelProps {
  bundle: CardBundle
  onUpdate: (next: CardUpdate) => void
  onAsset: (event: ChangeEvent<HTMLInputElement>, kind: 'profile' | 'cover' | 'logo') => void
  assetBusy: boolean
  slug: string
  slugEditing: boolean
  onSlugChange: (value: string) => void
  onSlugEditing: (editing: boolean) => void
  onToast: (message: string, tone?: 'success' | 'error') => void
  setShowQr: (show: boolean) => void
}

function DesignPanel({ bundle, onUpdate, onAsset, assetBusy, slug, slugEditing, onSlugChange, onSlugEditing, onToast, setShowQr }: DesignPanelProps) {
  const { branding } = useBranding()
  const { design } = bundle.card
  const clearAsset = (kind: 'profile' | 'cover' | 'logo') => { const key = kind === 'profile' ? 'profileImageUrl' : kind === 'cover' ? 'coverImageUrl' : 'companyLogoUrl'; onUpdate({ design: { [key]: '' } }); onToast(`${kind === 'logo' ? 'Logo' : kind === 'cover' ? 'Cover image' : 'Profile photo'} removed`) }
  return <div className="design-panel"><div className="panel-heading"><p className="eyebrow">Make it yours</p><h2>A visual identity in a few clicks.</h2><p>Start with a preset, then tune the details until it feels like you.</p></div><div className="design-block"><div className="subsection-heading"><div><p className="eyebrow">Presets</p><h3>Find your starting point</h3></div></div><div className="theme-grid">{themePresets.map((preset) => <button className={`theme-preset ${bundle.card.theme === preset.name ? 'theme-preset-selected' : ''}`} key={preset.name} onClick={() => onUpdate({ theme: preset.name, design: preset.design })}><span className="theme-preview" style={{ background: preset.design.headerColor }}><i style={{ background: preset.design.accentColor }} /><b style={{ background: preset.design.textColor }} /></span><span className="theme-preset-copy"><strong>{preset.name}</strong><span>{preset.description}</span></span>{bundle.card.theme === preset.name && <Check size={15} className="theme-check" />}</button>)}</div></div><div className="design-block"><div className="subsection-heading"><div><p className="eyebrow">Images</p><h3>Give your card a face</h3></div><span className="upload-note">JPG, PNG, WEBP · 6 MB max</span></div><div className="upload-grid"><AssetUploader label="Profile photo" url={design.profileImageUrl} kind="profile" onAsset={onAsset} onRemove={() => clearAsset('profile')} assetBusy={assetBusy} /><AssetUploader label="Company logo" url={design.companyLogoUrl} kind="logo" onAsset={onAsset} onRemove={() => clearAsset('logo')} assetBusy={assetBusy} /><AssetUploader label="Cover image" url={design.coverImageUrl} kind="cover" wide onAsset={onAsset} onRemove={() => clearAsset('cover')} assetBusy={assetBusy} /></div></div><div className="design-block"><div className="subsection-heading"><div><p className="eyebrow">Colors & type</p><h3>Dial in the details</h3></div></div><div className="color-grid"><ColorInput label="Header" value={design.headerColor} onChange={(value) => onUpdate({ design: { headerColor: value } })} /><ColorInput label="Card background" value={design.cardBackground} onChange={(value) => onUpdate({ design: { cardBackground: value } })} /><ColorInput label="Accent" value={design.accentColor} onChange={(value) => onUpdate({ design: { accentColor: value } })} /><ColorInput label="Text" value={design.textColor} onChange={(value) => onUpdate({ design: { textColor: value } })} /></div><div className="design-row"><label className="field-label">Font family<select value={design.fontFamily} onChange={(event) => onUpdate({ design: { fontFamily: event.target.value } })}><option>Manrope</option><option>DM Sans</option><option>Space Grotesk</option></select></label><label className="field-label">Button style<select value={design.buttonStyle} onChange={(event) => onUpdate({ design: { buttonStyle: event.target.value as DesignSettings['buttonStyle'] } })}><option value="solid">Solid</option><option value="soft">Soft</option><option value="outline">Outline</option></select></label></div><div className="design-row"><label className="field-label">Card mode<select value={design.mode} onChange={(event) => onUpdate({ design: { mode: event.target.value as DesignSettings['mode'] } })}><option value="light">Light</option><option value="dark">Dark</option></select></label><label className="field-label range-label">Corner radius <span>{design.borderRadius}px</span><input type="range" min="12" max="38" value={design.borderRadius} onChange={(event) => onUpdate({ design: { borderRadius: Number(event.target.value) } })} /></label></div></div><div className="design-block public-settings"><div className="subsection-heading"><div><p className="eyebrow">Publishing</p><h3>Your public URL</h3></div><span className={`published-pill ${bundle.card.isPublished ? 'published-pill-live' : ''}`}>{bundle.card.isPublished ? 'Live' : 'Draft'}</span></div><div className="slug-editor"><span>{branding.publicDomain}/</span>{slugEditing ? <input value={slug} onChange={(event) => onSlugChange(event.target.value)} onBlur={() => onSlugEditing(false)} onKeyDown={(event) => event.key === 'Enter' && onSlugEditing(false)} autoFocus /> : <button onClick={() => onSlugEditing(true)}>{bundle.card.slug}</button>}<button className="mini-action" onClick={() => onSlugEditing(true)} aria-label="Edit public URL"><Edit3 size={14} /></button></div><div className="design-action-row"><button className="button button-ghost" onClick={() => setShowQr(true)}><QrCode size={15} /> View QR</button><button className="button button-ghost" onClick={async () => { await navigator.clipboard?.writeText(remoteCardUrl(bundle.card.slug)); onToast('Public link copied') }}><Link2 size={15} /> Copy link</button></div></div></div>
}

function AssetUploader({ label, url, kind, wide = false, onAsset, onRemove, assetBusy }: { label: string; url: string; kind: 'profile' | 'cover' | 'logo'; wide?: boolean; onAsset: (event: ChangeEvent<HTMLInputElement>, kind: 'profile' | 'cover' | 'logo') => void; onRemove: () => void; assetBusy: boolean }) {
  return <div className={`asset-uploader ${wide ? 'asset-uploader-wide' : ''}`}><div className="asset-uploader-label"><span>{label}</span>{url && <button onClick={onRemove}>Remove</button>}</div><label className={`asset-dropzone ${url ? 'asset-dropzone-filled' : ''} ${assetBusy ? 'asset-dropzone-busy' : ''}`} style={url && kind === 'cover' ? { backgroundImage: `linear-gradient(180deg, rgba(8,20,18,.1), rgba(8,20,18,.2)), url(${url})` } : undefined}>{url && kind !== 'cover' ? <img src={url} alt={`${label} preview`} /> : !url && <><Upload size={18} /><span>{assetBusy ? 'Uploading…' : 'Upload image'}</span></>}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => onAsset(event, kind)} disabled={assetBusy} /></label></div>
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="color-input"><span>{label}</span><span className="color-control"><input type="color" value={value} onChange={(event) => onChange(event.target.value)} /><input value={value} onChange={(event) => onChange(event.target.value)} /></span></label>
}

function SaveStatus({ state, error }: { state: SaveState; error: string }) {
  return <span className={`save-status save-status-${state}`} title={error || undefined}>{state === 'saving' ? <><span className="save-spinner" /> Saving…</> : state === 'error' ? <><X size={13} /> Error saving</> : <><Check size={13} /> Saved</>}</span>
}

function QrModal({ bundle, onClose, onToast }: { bundle: CardBundle; onClose: () => void; onToast: (message: string, tone?: 'success' | 'error') => void }) {
  const [dataUrl, setDataUrl] = useState('')
  const url = remoteCardUrl(bundle.card.slug)
  useEffect(() => { void QRCode.toDataURL(url, { width: 640, margin: 2, color: { dark: '#173b34', light: '#ffffff' } }).then(setDataUrl) }, [url])
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className="qr-modal" role="dialog" aria-modal="true" aria-labelledby="qr-title"><div className="modal-heading"><div><p className="eyebrow">Share anywhere</p><h2 id="qr-title">Your card, one scan away.</h2></div><button className="icon-button" onClick={onClose} aria-label="Close QR code"><X size={18} /></button></div><div className="qr-body">{dataUrl ? <img src={dataUrl} alt={`QR code for ${url}`} /> : <div className="qr-loading">Generating your QR…</div>}<p>Anyone who scans this code will land on your public card.</p><code>{url}</code></div><div className="modal-footer"><button className="button button-ghost" onClick={async () => { await navigator.clipboard?.writeText(url); onToast('Public link copied') }}><Copy size={15} /> Copy link</button>{dataUrl && <a className="button button-primary" href={dataUrl} download={`${bundle.card.slug}-qr.png`}><Download size={15} /> Download QR</a>}</div></div></div>
}

function ConfirmDialog({ title, description, confirmLabel, onCancel, onConfirm }: { title: string; description: string; confirmLabel: string; onCancel: () => void; onConfirm: () => void }) {
  return <div className="modal-backdrop" role="presentation"><div className="confirm-dialog" role="dialog" aria-modal="true"><div className="confirm-icon"><Trash2 size={18} /></div><h2>{title}</h2><p>{description}</p><div className="modal-footer"><button className="button button-ghost" onClick={onCancel}>Cancel</button><button className="button button-danger" onClick={onConfirm}>{confirmLabel}</button></div></div></div>
}

function Toast({ toast, onClose }: { toast: { message: string; tone: 'success' | 'error' }; onClose: () => void }) {
  return <div className={`toast toast-${toast.tone}`} role="status"><span>{toast.tone === 'success' ? <Check size={15} /> : <X size={15} />}</span>{toast.message}<button onClick={onClose} aria-label="Dismiss notification"><X size={14} /></button></div>
}

function EmptyRoute({ onCreate, onBack }: { onCreate: () => void; onBack: () => void }) {
  return <div className="empty-route"><button className="button button-ghost" onClick={onBack}><ArrowLeft size={16} /> Back to cards</button><EmptyState onCreate={onCreate} /></div>
}

function LandingPage({ bundle, onCreate, onLogin, onOpenBuilder }: { bundle?: CardBundle; onCreate: () => void; onLogin: () => void; onOpenBuilder: () => void }) {
  const { branding } = useBranding()
  const demoBundle = useMemo(() => bundle ?? createSeedBundle(), [bundle])
  return <div className="landing-page">
    <header className="landing-header"><button className="public-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><BrandLockup /></button><nav className="landing-nav"><a href="#features">Why {branding.productName}</a><a href="#how-it-works">How it works</a><a href="#share">Share anywhere</a></nav><div className="landing-header-actions"><button className="landing-login" onClick={onLogin}>Log in</button><button className="button button-primary" onClick={onCreate}>Create your card <ArrowRight size={15} /></button></div></header>
    <main>
      <section className="landing-hero"><div className="landing-hero-copy"><div className="hero-pill"><span className="live-dot" /> Digital identity, simplified</div><h1>Make every introduction <em>stick.</em></h1><p>One living business card for the way you work now. Add your details once, then share a sharper first impression everywhere.</p><div className="landing-hero-actions"><button className="button button-primary button-large" onClick={onCreate}>Build your card <ArrowRight size={16} /></button><a className="button button-ghost button-large" href="#how-it-works">See how it works</a></div><div className="hero-proof"><div className="avatar-stack"><span>AM</span><span>JL</span><span>RK</span><b>+</b></div><span>Made for people who make connections.</span></div></div><div className="landing-hero-art"><div className="hero-art-glow" /><div className="hero-float hero-float-top"><span className="mini-qr"><QrCode size={18} /></span><span><strong>Scan to connect</strong><small>No app required</small></span></div><PhonePreview bundle={demoBundle} onShare={onOpenBuilder} /><div className="hero-float hero-float-bottom"><span className="mini-spark"><Sparkles size={16} /></span><span><strong>Always up to date</strong><small>Make one edit. Share everywhere.</small></span></div></div></section>
      <section className="landing-trust"><p>Built for the moments after “nice to meet you”</p><div className="trust-wordmarks"><span>northstar</span><span>field notes</span><span>studio 43</span><span>openform</span><span>kindred</span></div></section>
      <section className="landing-section landing-feature-section" id="features"><div className="landing-section-intro"><p className="eyebrow">A card with range</p><h2>Everything people need to keep in touch.</h2><p>Bring your contact details, work, and personality together in a profile that feels unmistakably yours.</p><button className="text-link" onClick={onCreate}>Start building <ArrowRight size={14} /></button></div><div className="feature-mosaic"><div className="feature-card feature-card-large"><span className="feature-icon feature-icon-coral"><Palette size={20} /></span><div><h3>Make it look like you.</h3><p>Choose a point of view with thoughtful themes, colors, imagery, and typography.</p></div><div className="mosaic-palette"><i /><i /><i /><i /></div></div><div className="feature-card"><span className="feature-icon"><Link2 size={19} /></span><h3>One link. Many doors.</h3><p>Email, socials, booking links, portfolios, and everything in between.</p><span className="feature-arrow"><ArrowUpRight size={16} /></span></div><div className="feature-card feature-card-dark"><span className="feature-icon feature-icon-light"><QrCode size={19} /></span><h3>Share in a second.</h3><p>Send a link, show a QR, or let someone save your contact directly.</p><div className="scan-lines"><i /><i /><i /></div></div></div></section>
      <section className="landing-section landing-share-section" id="share"><div className="share-art"><div className="share-orbit share-orbit-one" /><div className="share-orbit share-orbit-two" /><div className="share-center"><QrCode size={46} strokeWidth={1.3} /><span>Scan to<br />connect</span></div><div className="share-node share-node-one"><Link2 size={17} /></div><div className="share-node share-node-two"><MailIcon /></div><div className="share-node share-node-three"><UserRound size={17} /></div></div><div className="landing-section-intro"><p className="eyebrow">Share on your terms</p><h2>Ready wherever the conversation happens.</h2><p>From a conference hallway to a video call, {branding.productName} gives people an easy next step without asking them to download anything.</p><div className="share-check-list"><span><Check size={14} /> Personal link and QR code</span><span><Check size={14} /> Clickable contact details</span><span><Check size={14} /> Save-to-phone vCard</span></div></div></section>
      <section className="landing-process" id="how-it-works"><div className="landing-process-heading"><p className="eyebrow">Three small steps</p><h2>Go from blank page to memorable.</h2></div><div className="process-grid"><ProcessStep index="01" title="Add your details" copy="Name, role, links, socials, and whatever helps people find you again." icon={<UserRound size={19} />} /><ProcessStep index="02" title="Shape the feeling" copy="Choose your colors, add a photo, and make the card feel like a natural extension of you." icon={<Palette size={19} />} /><ProcessStep index="03" title="Share it forward" copy="Publish your page, show the QR, and let every new connection save you in one tap." icon={<Share2 size={19} />} /></div></section>
      <section className="landing-cta"><div><p className="eyebrow">Your next introduction</p><h2>Make it easy to remember you.</h2><p>Build a card that is useful, beautiful, and ready before the next hello.</p></div><button className="button button-light button-large" onClick={onCreate}>Create my {branding.productName} <ArrowRight size={16} /></button></section>
    </main>
    <footer className="landing-footer"><span>© 2026 {branding.productName}</span><span>{branding.tagline}.</span><button onClick={onCreate}>Get started <ArrowRight size={14} /></button></footer>
  </div>
}

function ProcessStep({ index, title, copy, icon }: { index: string; title: string; copy: string; icon: ReactNode }) {
  return <article className="process-step"><div className="process-step-top"><span>{index}</span><span className="process-icon">{icon}</span></div><h3>{title}</h3><p>{copy}</p></article>
}

function MailIcon() {
  return <span className="mail-icon"><span /></span>
}

function ResetPasswordScreen({ onComplete }: { onComplete: () => void }) {
  const { branding } = useBranding()
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!supabase) { setError('Password reset is available after Supabase is configured.'); return }
    if (password !== confirmation) { setError('Passwords do not match.'); return }
    setBusy(true); setError('')
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (updateError) setError(updateError.message)
    else setMessage('Password updated. You can now return to your workspace.')
  }
  return <main className="reset-page"><div className="reset-card"><BrandLockup /><div className="reset-heading"><span className="reset-icon"><KeyRound size={18} /></span><p className="eyebrow">Account security</p><h1>Choose a new password.</h1><p>Make it something unique to your {branding.productName} workspace.</p></div><form onSubmit={submit}><label className="field-label">New password<input type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} required /></label><label className="field-label">Confirm password<input type="password" minLength={6} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required /></label>{error && <p className="form-error">{error}</p>}{message && <p className="form-success"><Check size={15} /> {message}</p>}<button className="button button-primary button-wide" disabled={busy || Boolean(message)}>{busy ? 'Updating…' : message ? 'Password updated' : 'Update password'} <ArrowRight size={16} /></button></form>{message && <button className="auth-link reset-back" onClick={onComplete}>Back to workspace</button>}</div></main>
}

function PublicCard({ bundle, onBack, onToast }: { bundle?: CardBundle; onBack: () => void; onToast: (message: string, tone?: 'success' | 'error') => void }) {
  const { branding } = useBranding()
  const [showQr, setShowQr] = useState(false)
  if (!bundle) return <div className="public-not-found"><BrandLockup /><h1>That card has moved.</h1><p>Check the link and try again.</p><button className="button button-primary" onClick={onBack}>Go to {branding.productName}</button></div>
  const name = bundle.fields.find((field) => field.fieldType === 'name')?.value || `${branding.productName} contact`
  const share = async () => {
    const url = remoteCardUrl(bundle.card.slug)
    if (navigator.share) await navigator.share({ title: `${name} · ${branding.productName}`, url })
    else { await navigator.clipboard?.writeText(url); onToast('Public link copied') }
  }
  return <div className="public-page"><header className="public-header"><button className="public-brand" onClick={onBack}><BrandLockup /></button><div className="public-header-actions"><button className="button button-ghost" onClick={share}><Share2 size={15} /> Share</button><button className="button button-primary" onClick={() => downloadVCard(bundle, branding.productName)}><UserRound size={15} /> Save contact</button></div></header><main className="public-main"><div className="public-intro"><p className="eyebrow">Digital business card</p><h1>A better way to stay in touch.</h1><p>Save this contact, share the link, or scan the QR whenever you need it.</p><div className="public-intro-actions"><button className="button button-primary" onClick={() => downloadVCard(bundle, branding.productName)}><Download size={15} /> Save contact</button><button className="button button-ghost" onClick={() => setShowQr(true)}><QrCode size={15} /> Show QR</button></div><div className="public-meta"><span><span className="live-dot" /> Published card</span><span>Updated {formatDate(bundle.card.updatedAt)}</span></div></div><div className="public-preview"><PhonePreview bundle={bundle} publicView onShare={share} /></div></main><footer className="public-footer">{branding.showPoweredBy && <span>Powered by {branding.productName}</span>}<button onClick={onBack}>Create your own card <ArrowRight size={14} /></button></footer>{showQr && <QrModal bundle={bundle} onClose={() => setShowQr(false)} onToast={onToast} />}</div>
}

function downloadVCard(bundle: CardBundle, productName = 'Contact') {
  const field = (type: FieldType) => bundle.fields.find((item) => item.fieldType === type)?.value || ''
  const name = field('name') || `${productName} contact`
  const address = bundle.fields.find((item) => item.fieldType === 'address')
  const lines = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${escapeVCard(name)}`, `ORG:${escapeVCard(field('company'))}`, `TITLE:${escapeVCard(field('job_title'))}`]
  bundle.fields.filter((item) => item.fieldType === 'phone').forEach((item) => lines.push(`TEL;TYPE=${escapeVCard(item.label || 'CELL')}:${escapeVCard(item.value)}`))
  bundle.fields.filter((item) => item.fieldType === 'email').forEach((item) => lines.push(`EMAIL;TYPE=${escapeVCard(item.label || 'INTERNET')}:${escapeVCard(item.value)}`))
  const website = field('website') || field('company_url')
  if (website) lines.push(`URL:${escapeVCard(website)}`)
  if (address) lines.push(`ADR:;;${escapeVCard(address.metadata.street || address.value)};${escapeVCard(address.metadata.city)};${escapeVCard(address.metadata.state)};${escapeVCard(address.metadata.postalCode)};${escapeVCard(address.metadata.country)}`)
  lines.push('END:VCARD')
  const blob = new Blob([lines.join('\r\n')], { type: 'text/vcard;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${slugify(name)}.vcf`
  link.click()
  URL.revokeObjectURL(link.href)
}

const escapeVCard = (value: string) => value.replace(/[\\,;]/g, (character) => `\\${character}`).replace(/\n/g, '\\n')
const initials = (value: string) => value.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'AM'
const formatDate = (value: string) => new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
const readFile = (file: File) => new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file) })
