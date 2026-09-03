import { isSupabaseConfigured, supabase } from './supabase'

export type CrmProviderId = 'hubspot' | 'salesforce' | 'pipedrive' | 'zoho' | 'gohighlevel'

export interface CrmIntegrationSettings {
  accountLabel: string
  locationId: string
  automaticSync: boolean
}

export interface CrmIntegration {
  provider: CrmProviderId
  status: 'not_connected' | 'configured'
  settings: CrmIntegrationSettings
  fieldMapping: Record<string, string>
}

export const defaultCrmFieldMapping: Record<string, string> = {
  firstName: 'firstname',
  lastName: 'lastname',
  company: 'company',
  email: 'email',
  leadTemperature: 'lead_status',
  eventName: 'campaign',
}

const localKey = 'cardly.crm-integrations.v1'

const blankSettings = (): CrmIntegrationSettings => ({ accountLabel: '', locationId: '', automaticSync: false })

const normalizeIntegration = (value: Partial<CrmIntegration> & { provider: CrmProviderId }): CrmIntegration => ({
  provider: value.provider,
  status: value.status === 'configured' ? 'configured' : 'not_connected',
  settings: { ...blankSettings(), ...(value.settings ?? {}) },
  fieldMapping: { ...defaultCrmFieldMapping, ...(value.fieldMapping ?? {}) },
})

const readLocal = (): Record<string, Record<CrmProviderId, CrmIntegration>> => {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(window.localStorage.getItem(localKey) ?? '{}') as Record<string, Record<CrmProviderId, CrmIntegration>>
  } catch {
    return {}
  }
}

const writeLocal = (userId: string, integrations: Record<CrmProviderId, CrmIntegration>) => {
  if (typeof window === 'undefined') return
  const map = readLocal()
  map[userId] = integrations
  window.localStorage.setItem(localKey, JSON.stringify(map))
}

const remoteEnabled = (userId: string) => Boolean(isSupabaseConfigured && supabase && userId !== 'local-demo-user')

export async function loadCrmIntegrations(userId: string): Promise<Record<CrmProviderId, CrmIntegration>> {
  if (remoteEnabled(userId)) {
    const { data, error } = await supabase!.from('crm_integrations').select('provider,status,settings,field_mapping').eq('organization_id', userId)
    if (error) throw error
    const integrations = (data ?? []).reduce<Record<CrmProviderId, CrmIntegration>>((result, row) => {
      const provider = String(row.provider) as CrmProviderId
      if (['hubspot', 'salesforce', 'pipedrive', 'zoho', 'gohighlevel'].includes(provider)) {
        result[provider] = normalizeIntegration({ provider, status: String(row.status) as CrmIntegration['status'], settings: row.settings as CrmIntegrationSettings, fieldMapping: row.field_mapping as Record<string, string> })
      }
      return result
    }, {} as Record<CrmProviderId, CrmIntegration>)
    writeLocal(userId, integrations)
    return integrations
  }
  return readLocal()[userId] ?? {}
}

export async function saveCrmIntegration(userId: string, value: CrmIntegration): Promise<void> {
  const integration = normalizeIntegration(value)
  const current = (await loadCrmIntegrations(userId)) as Record<CrmProviderId, CrmIntegration>
  current[integration.provider] = integration
  if (remoteEnabled(userId)) {
    const { error } = await supabase!.from('crm_integrations').upsert({
      organization_id: userId,
      provider: integration.provider,
      status: integration.status,
      settings: integration.settings,
      field_mapping: integration.fieldMapping,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'organization_id,provider' })
    if (error) throw error
  }
  writeLocal(userId, current)
}

export async function removeCrmIntegration(userId: string, provider: CrmProviderId): Promise<void> {
  const current = (await loadCrmIntegrations(userId)) as Record<CrmProviderId, CrmIntegration>
  delete current[provider]
  if (remoteEnabled(userId)) {
    const { error } = await supabase!.from('crm_integrations').delete().eq('organization_id', userId).eq('provider', provider)
    if (error) throw error
  }
  writeLocal(userId, current)
}
