import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { deleteSession, clearAuthCookies, getAuthFromCookies } from '@/lib/auth'
import { logAudit } from '@/lib/audit'
import { handleApiError } from '@/lib/api-handler'

export async function POST() {
  try {
    const auth = await getAuthFromCookies()
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get('refresh_token')?.value

    if (refreshToken) {
      await deleteSession(refreshToken)
    }

    await clearAuthCookies()

    if (auth) {
      await logAudit({
        userId: auth.userId,
        action: 'auth.logout',
        resourceType: 'user',
        resourceId: auth.userId,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    })
  } catch (error) {
    await clearAuthCookies()
    return handleApiError(error, 'auth/logout')
  }
}
