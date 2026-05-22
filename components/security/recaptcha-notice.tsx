'use client'

/** GDPR / Google reCAPTCHA disclosure for auth forms. */
export function RecaptchaNotice() {
  return (
    <p className="text-center text-xs text-slate-500">
      This site is protected by reCAPTCHA and the Google{' '}
      <a
        href="https://policies.google.com/privacy"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-slate-400"
      >
        Privacy Policy
      </a>{' '}
      and{' '}
      <a
        href="https://policies.google.com/terms"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-slate-400"
      >
        Terms of Service
      </a>{' '}
      apply.
    </p>
  )
}
