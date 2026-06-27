import { NextRequest, NextResponse } from 'next/server'
import {
  getGoogleOAuthTokenUrl,
  getGoogleUserInfoUrl,
} from '@/lib/config/external-apis'
import { apiPath, appUrl, getAppBaseUrlFromRequest } from '@/lib/config/urls'
import { queryOne, execute, generateId } from '@/lib/db'
import { getSignupLocked } from '@/lib/platform/platform-settings'
import { createSession, setAuthCookies } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const base = getAppBaseUrlFromRequest(request)
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const savedState = request.cookies.get('oauth_state')?.value

  if (!code || !state || state !== savedState) {
    return NextResponse.redirect(appUrl('/login?error=oauth_state', base))
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(appUrl('/login?error=oauth_config', base))
  }

  const redirectUri = `${base}${apiPath('/auth/oauth/google/callback')}`
  const tokenRes = await fetch(getGoogleOAuthTokenUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(appUrl('/login?error=oauth_token', base))
  }

  const tokens = (await tokenRes.json()) as { access_token: string }
  const profileRes = await fetch(getGoogleUserInfoUrl(), {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
  if (!profileRes.ok) {
    return NextResponse.redirect(appUrl('/login?error=oauth_profile', base))
  }

  const profile = (await profileRes.json()) as { id: string; email: string; name?: string }
  let user = await queryOne<{ id: string; email: string; role: string; tenant_id: string | null }>(
    `SELECT u.id, u.email, u.role, tm.tenant_id
     FROM users u
     LEFT JOIN tenant_members tm ON tm.user_id = u.id AND tm.status = 'active'
     WHERE u.email = ? LIMIT 1`,
    [profile.email],
  )

  if (!user) {
    if (await getSignupLocked()) {
      return NextResponse.redirect(appUrl('/login?error=signup_locked', base))
    }
    return NextResponse.redirect(
      appUrl(`/register?email=${encodeURIComponent(profile.email)}&oauth=google`, base),
    )
  }

  const oauthExisting = await queryOne<{ id: string }>(
    `SELECT id FROM oauth_accounts WHERE provider = 'google' AND provider_user_id = ?`,
    [profile.id],
  )
  if (!oauthExisting) {
    await execute(
      `INSERT INTO oauth_accounts (id, user_id, provider, provider_user_id, email)
       VALUES (?, ?, 'google', ?, ?)`,
      [generateId(), user.id, profile.id, profile.email],
    )
  }

  const { accessToken, refreshToken, expiresAt } = await createSession(user.id)
  await setAuthCookies(accessToken, refreshToken, expiresAt)

  const redirectUrl = user.role === 'super_admin' ? '/admin' : '/dashboard'
  const res = NextResponse.redirect(appUrl(redirectUrl, base))
  res.cookies.delete('oauth_state')
  return res
}
