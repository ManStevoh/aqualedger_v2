import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getGoogleOAuthAuthorizeUrl } from '@/lib/config/external-apis'
import { apiPath, getAppBaseUrlFromRequest } from '@/lib/config/urls'

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
  const base = getAppBaseUrlFromRequest(request)

  if (!clientId) {
    return NextResponse.json(
      { success: false, error: 'Google OAuth not configured. Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET.' },
      { status: 503 },
    )
  }

  const redirectUri = `${base}${apiPath('/auth/oauth/google/callback')}`
  const state = crypto.randomUUID()
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
    prompt: 'consent',
  })

  const res = NextResponse.redirect(getGoogleOAuthAuthorizeUrl(params))
  res.cookies.set('oauth_state', state, { httpOnly: true, maxAge: 600, path: '/' })
  return res
}
