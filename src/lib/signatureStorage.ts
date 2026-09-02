import type { EmailSignature } from './types'

const signaturesKey = 'cardly.email-signatures.v1'
const hasStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage)

export const readLocalSignatures = (): EmailSignature[] => {
  if (!hasStorage()) return []
  try {
    const raw = window.localStorage.getItem(signaturesKey)
    return raw ? JSON.parse(raw) as EmailSignature[] : []
  } catch {
    return []
  }
}

export const writeLocalSignatures = (signatures: EmailSignature[]) => {
  if (hasStorage()) window.localStorage.setItem(signaturesKey, JSON.stringify(signatures))
}
