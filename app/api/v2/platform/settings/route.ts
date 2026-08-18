import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requireSuperAdmin } from '@/lib/platform/access'
import {
  getSettings,
  updateSetting,
  settingsToUi,
  saveAllUiSettings,
  type PlatformSettingKey,
} from '@/lib/platform/platform-settings'

export const GET = apiHandler(async () => {
  await requireSuperAdmin()
  const settings = await getSettings()
  return jsonOk({ ...settingsToUi(settings) })
}, 'v2/platform/settings')

const legacyPatchSchema = z.object({
  key: z.enum(['maintenance', 'signup', 'announcement', 'branding', 'developer']),
  value: z.record(z.unknown()),
})

const uiPatchSchema = z.object({
  maintenanceMode: z.boolean().optional(),
  maintenanceMessage: z.string().optional(),
  signupLocked: z.boolean().optional(),
  announcementEnabled: z.boolean().optional(),
  announcementTitle: z.string().optional(),
  announcementBody: z.string().optional(),
  brandingLogoUrl: z.string().max(500).optional(),
  brandingPrimaryColor: z.string().max(20).optional(),
  brandingAppName: z.string().max(120).optional(),
  localDevMode: z.boolean().optional(),
  mockMpesaCallbacks: z.boolean().optional(),
  bypassRateLimits: z.boolean().optional(),
  debugLogging: z.boolean().optional(),
  apiSandboxEnabled: z.boolean().optional(),
})

async function handleSaveSettings(request: NextRequest) {
  const auth = await requireSuperAdmin()
  const body = await request.json()

  if (body != null && typeof body === 'object' && 'key' in body && 'value' in body) {
    const parsed = legacyPatchSchema.parse(body)
    const settings = await updateSetting(
      parsed.key as PlatformSettingKey,
      parsed.value,
      auth.userId,
    )
    return jsonOk({ ...settingsToUi(settings) })
  }

  const parsed = uiPatchSchema.parse(body)
  const ui = await saveAllUiSettings(parsed, auth.userId)
  return jsonOk({ ...ui })
}

export const PATCH = apiHandler(handleSaveSettings, 'v2/platform/settings')
export const POST = apiHandler(handleSaveSettings, 'v2/platform/settings/save')
