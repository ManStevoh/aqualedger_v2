import { apiHandler, jsonOk } from '@/lib/api-handler'
import { getSettings, settingsToUi } from '@/lib/platform/platform-settings'

/** Public — maintenance mode, signup lock, and site announcement (no auth) */
export const GET = apiHandler(async () => {
  const settings = await getSettings()
  return jsonOk(settingsToUi(settings))
}, 'public/platform/status')
