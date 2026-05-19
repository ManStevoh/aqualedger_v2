import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { refreshSession, setAuthCookies, clearAuthCookies } from '@/lib/auth'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get('refresh_token')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: 'No refresh token provided' },
        { status: 401 }
      )
    }

    // Refresh session
    const session = await refreshSession(refreshToken)
    
    if (!session) {
      await clearAuthCookies()
      return NextResponse.json(
        { success: false, error: 'Invalid or expired refresh token' },
        { status: 401 }
      )
    }

    // Set new cookies
    await setAuthCookies(session.accessToken, session.refreshToken, session.expiresAt)

    return NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: session.accessToken,
      },
    })
  } catch (error) {
    console.error('Token refresh error:', error)
    await clearAuthCookies()
    return NextResponse.json(
      { success: false, error: 'Token refresh failed' },
      { status: 500 }
    )
  }
}
