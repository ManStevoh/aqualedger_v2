import { describe, it, expect } from 'vitest'
import { loginSchema, registerSchema, boatCreateSchema } from './schemas'

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'secret',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'secret',
    })
    expect(result.success).toBe(false)
  })
})

describe('registerSchema', () => {
  it('accepts valid registration', () => {
    const result = registerSchema.safeParse({
      email: 'new@example.com',
      password: 'SecurePass1',
      firstName: 'Jane',
      lastName: 'Doe',
      role: 'fisherman',
    })
    expect(result.success).toBe(true)
  })

  it('rejects weak password', () => {
    const result = registerSchema.safeParse({
      email: 'new@example.com',
      password: 'weak',
      firstName: 'Jane',
      lastName: 'Doe',
    })
    expect(result.success).toBe(false)
  })
})

describe('boatCreateSchema', () => {
  it('requires registration number, name, and type', () => {
    const result = boatCreateSchema.safeParse({
      registrationNumber: 'KEN-001',
      name: 'Sea Breeze',
      type: 'trawler',
    })
    expect(result.success).toBe(true)
  })
})
