import { describe, it, expect } from 'vitest'
import { usernameToEmail, SYNTHETIC_EMAIL_DOMAIN } from './firebase'

describe('usernameToEmail', () => {
  it('should convert simple username to synthetic email', () => {
    expect(usernameToEmail('admin')).toBe(`admin@${SYNTHETIC_EMAIL_DOMAIN}`)
  })

  it('should convert username with underscores', () => {
    expect(usernameToEmail('sarah_jones')).toBe(`sarah_jones@${SYNTHETIC_EMAIL_DOMAIN}`)
  })

  it('should convert spaces to underscores', () => {
    expect(usernameToEmail('sarah jones')).toBe(`sarah_jones@${SYNTHETIC_EMAIL_DOMAIN}`)
  })

  it('should convert to lowercase', () => {
    expect(usernameToEmail('Sarah_Jones')).toBe(`sarah_jones@${SYNTHETIC_EMAIL_DOMAIN}`)
    expect(usernameToEmail('ADMIN')).toBe(`admin@${SYNTHETIC_EMAIL_DOMAIN}`)
  })

  it('should handle multiple spaces', () => {
    // Multiple spaces are collapsed to single underscore (current behavior)
    expect(usernameToEmail('sarah  jones')).toBe(`sarah_jones@${SYNTHETIC_EMAIL_DOMAIN}`)
  })

  it('should use correct email domain', () => {
    expect(SYNTHETIC_EMAIL_DOMAIN).toBe('group-trip.internal')
  })
})

describe('Demo Mode Detection', () => {
  it('should export isDemoMode', async () => {
    const { isDemoMode } = await import('./firebase')
    // In test environment with mocked/empty env vars, should be demo mode
    expect(typeof isDemoMode).toBe('boolean')
  })
})
