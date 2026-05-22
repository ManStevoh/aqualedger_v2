/**
 * Third-party API base URLs — all overridable via environment variables.
 * Defaults match official vendor endpoints; set env in production for proxies/regions.
 */

function envUrl(key: string, fallback: string): string {
  const v = process.env[key]?.trim()
  return (v || fallback).replace(/\/+$/, '')
}

function join(base: string, path: string): string {
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

export function getStripeApiBase(): string {
  return envUrl('STRIPE_API_BASE_URL', 'https://api.stripe.com')
}

export function getStripePaymentIntentsUrl(): string {
  return join(getStripeApiBase(), '/v1/payment_intents')
}

export function getOpenAiChatCompletionsUrl(): string {
  return envUrl('OPENAI_API_BASE_URL', 'https://api.openai.com') + '/v1/chat/completions'
}

export function getOpenWeatherForecastUrl(query: string, apiKey: string): string {
  const base = envUrl(
    'OPENWEATHER_API_BASE_URL',
    'https://api.openweathermap.org/data/2.5',
  )
  return `${base}/forecast?q=${query}&appid=${apiKey}&units=metric&cnt=8`
}

export function getMpesaApiBase(): string {
  if (process.env.MPESA_API_BASE_URL?.trim()) {
    return envUrl('MPESA_API_BASE_URL', '')
  }
  return process.env.MPESA_ENV === 'production'
    ? envUrl('MPESA_PRODUCTION_API_BASE_URL', 'https://api.safaricom.co.ke')
    : envUrl('MPESA_SANDBOX_API_BASE_URL', 'https://sandbox.safaricom.co.ke')
}

export function getMpesaOAuthUrl(): string {
  return join(getMpesaApiBase(), '/oauth/v1/generate?grant_type=client_credentials')
}

export function getMpesaStkPushUrl(): string {
  return join(getMpesaApiBase(), '/mpesa/stkpush/v1/processrequest')
}

export function getGoogleOAuthAuthorizeUrl(params: URLSearchParams): string {
  const base = envUrl(
    'GOOGLE_OAUTH_AUTHORIZE_URL',
    'https://accounts.google.com/o/oauth2/v2/auth',
  )
  return `${base}?${params.toString()}`
}

export function getGoogleOAuthTokenUrl(): string {
  return envUrl('GOOGLE_OAUTH_TOKEN_URL', 'https://oauth2.googleapis.com/token')
}

export function getGoogleUserInfoUrl(): string {
  return envUrl('GOOGLE_OAUTH_USERINFO_URL', 'https://www.googleapis.com/oauth2/v2/userinfo')
}

export function getFcmSendUrl(): string {
  return envUrl('FCM_API_URL', 'https://fcm.googleapis.com/fcm/send')
}

export function getAfricasTalkingSmsUrl(): string {
  return envUrl(
    'AFRICASTALKING_SMS_URL',
    'https://api.africastalking.com/version1/messaging',
  )
}

export function getTwilioMessagesUrl(accountSid: string): string {
  const base = envUrl('TWILIO_API_BASE_URL', 'https://api.twilio.com')
  return join(base, `/2010-04-01/Accounts/${accountSid}/Messages.json`)
}

export function getResendApiUrl(): string {
  return envUrl('RESEND_API_BASE_URL', 'https://api.resend.com')
}

export function getResendEmailsUrl(): string {
  return join(getResendApiUrl(), '/emails')
}

export function getSendGridApiUrl(): string {
  return envUrl('SENDGRID_API_BASE_URL', 'https://api.sendgrid.com')
}

export function getSendGridMailSendUrl(): string {
  return join(getSendGridApiUrl(), '/v3/mail/send')
}

export function getWhatsAppApiUrl(): string | null {
  const v = process.env.WHATSAPP_API_URL?.trim()
  return v || null
}

export function getFisheriesGovApiUrl(): string | null {
  const v = process.env.FISHERIES_GOV_API_URL?.trim()
  return v || null
}
