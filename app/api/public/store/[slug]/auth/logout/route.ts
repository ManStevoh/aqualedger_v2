import { NextRequest } from 'next/server'
import { clearAuthCookies } from '@/lib/auth'
import { apiHandler, jsonOk } from '@/lib/api-handler'

export const POST = apiHandler(async (request: NextRequest) => {
  await clearAuthCookies()
  return jsonOk({ message: 'Logged out successfully' })
}, 'public/store/auth/logout')
