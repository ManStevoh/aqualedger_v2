import { NextRequest } from 'next/server'
import { traceabilityVerifyUrl } from '@/lib/config/urls'
import { apiHandler, jsonOk, notFound } from '@/lib/api-handler'
import { verifyByHash, verifyByLotCode } from '@/lib/modules/traceability/public-verify'

export const GET = apiHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const hash = searchParams.get('hash')
  const lot = searchParams.get('lot')
  const tenant = searchParams.get('tenant')

  if (hash) {
    const cert = await verifyByHash(hash)
    if (!cert) throw notFound('Certificate not found')
    return jsonOk({
      verified: true,
      lotCode: cert.lot_code,
      tenantName: cert.tenant_name,
      chainSummary: JSON.parse(cert.chain_summary || '{}'),
      issuedAt: cert.issued_at,
      verifyUrl: traceabilityVerifyUrl({ hash }),
      standard: 'EU fisheries traceability / SHA-256 chain of custody',
    })
  }

  if (lot && tenant) {
    const result = await verifyByLotCode(tenant, lot)
    if (!result) throw notFound('Lot not found')
    return jsonOk({
      verified: true,
      ...result,
      verifyUrl: traceabilityVerifyUrl({ lot, tenant }),
    })
  }

  throw notFound('Provide hash or lot+tenant query params')
}, 'public/traceability/verify')
