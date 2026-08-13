/**
 * Kryptografie- und WebAuthn-Helfer für die App-Sperre. Rein lokal, kein Server:
 * - PIN wird nie im Klartext gespeichert, nur als gesalzener PBKDF2-Hash.
 * - Face-/Touch-ID läuft über WebAuthn mit einem "platform authenticator". Eine
 *   Signaturprüfung durch einen Server gibt es bewusst nicht – der Zweck ist
 *   nur, den App-Zugriff an eine erfolgreiche Geräte-Biometrie zu koppeln, und
 *   ein erfolgreicher navigator.credentials.get() beweist das bereits.
 */

const PBKDF2_ITERATIONS = 150_000

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  return bytes
}

export function generateSalt(): string {
  return toHex(crypto.getRandomValues(new Uint8Array(16)).buffer)
}

async function derivePinHash(pin: string, saltHex: string): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, [
    'deriveBits',
  ])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: hexToBytes(saltHex) as BufferSource, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    256,
  )
  return toHex(bits)
}

export async function hashPin(pin: string, salt: string): Promise<string> {
  return derivePinHash(pin, salt)
}

/** Konstante Laufzeit unabhängig vom Ort der ersten Abweichung, um Timing-Angriffe zu erschweren. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export async function verifyPin(pin: string, salt: string, expectedHash: string): Promise<boolean> {
  const hash = await derivePinHash(pin, salt)
  return timingSafeEqual(hash, expectedHash)
}

// --- Face ID / Touch ID / Windows Hello über WebAuthn ---

export async function isBiometricAvailable(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) return false
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  } catch {
    return false
  }
}

function bufferToBase64Url(buffer: ArrayBuffer): string {
  let binary = ''
  for (const b of new Uint8Array(buffer)) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlToBuffer(value: string): ArrayBuffer {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=')
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

/** Legt einen lokalen Platform-Authenticator (Face ID/Touch ID/Windows Hello) an. */
export async function registerBiometric(): Promise<string | null> {
  try {
    const credential = (await navigator.credentials.create({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rp: { name: 'Dankbarkeitstagebuch' },
        user: {
          id: crypto.getRandomValues(new Uint8Array(16)),
          name: 'lokales-geraet',
          displayName: 'Lokales Gerät',
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },
          { type: 'public-key', alg: -257 },
        ],
        authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
        timeout: 60_000,
      },
    })) as PublicKeyCredential | null
    if (!credential) return null
    return bufferToBase64Url(credential.rawId)
  } catch {
    return null
  }
}

export async function verifyBiometric(credentialId: string): Promise<boolean> {
  try {
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        allowCredentials: [{ id: base64UrlToBuffer(credentialId), type: 'public-key' }],
        userVerification: 'required',
        timeout: 60_000,
      },
    })
    return !!assertion
  } catch {
    return false
  }
}
