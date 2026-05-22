import { apiPath, resolveFetchUrl } from '@/lib/config/urls'

/** Cookie-authenticated JSON fetch with one refresh retry on 401 */

async function tryRefreshSession(): Promise<boolean> {
  const res = await fetch(resolveFetchUrl(apiPath('/auth/refresh')), {
    method: 'POST',
    credentials: 'same-origin',
  })
  return res.ok
}

export async function authFetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const run = () =>
    fetch(resolveFetchUrl(input), { ...init, credentials: 'same-origin' }).then(async (res) => ({
      res,
      json: (await res.json()) as T,
    }))

  let { res, json } = await run()
  if (res.status === 401) {
    if (await tryRefreshSession()) {
      ;({ res, json } = await run())
    }
  }
  return json
}
