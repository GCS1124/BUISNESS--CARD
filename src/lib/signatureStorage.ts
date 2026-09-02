import type { EmailSignature } from './types'

const signaturesKey = 'cardly.email-signatures.v1'
const guestSignatureKey = 'cardly.email-signature-guest.v1'
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

export const readGuestSignature = (): EmailSignature | null => {
  if (!hasStorage()) return null
  try {
    const raw = window.localStorage.getItem(guestSignatureKey)
    return raw ? JSON.parse(raw) as EmailSignature : null
  } catch {
    return null
  }
}

export const writeGuestSignature = (signature: EmailSignature) => {
  if (hasStorage()) window.localStorage.setItem(guestSignatureKey, JSON.stringify(signature))
}

export const clearGuestSignature = () => {
  if (hasStorage()) window.localStorage.removeItem(guestSignatureKey)
}
