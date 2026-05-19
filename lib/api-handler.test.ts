import { describe, it, expect } from 'vitest'
import { ApiError, handleApiError } from './api-handler'

describe('handleApiError', () => {
  it('maps ApiError to correct status', async () => {
    const res = handleApiError(new ApiError('Not allowed', 403, 'FORBIDDEN'))
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.code).toBe('FORBIDDEN')
  })

  it('maps Unauthorized message', async () => {
    const res = handleApiError(new Error('Unauthorized'))
    expect(res.status).toBe(401)
  })

  it('maps Forbidden message', async () => {
    const res = handleApiError(new Error('Forbidden'))
    expect(res.status).toBe(403)
  })
})
