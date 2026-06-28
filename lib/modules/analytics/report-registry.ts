/**
 * AquaERP report catalog — ISO 8601 periods, IFRS-aligned financial reports,
 * EU fisheries traceability, GS1-friendly exports (CSV UTF-8 BOM).
 */

export type ReportFormat = 'csv' | 'json' | 'html' | 'sms-summary'
export type DeliveryChannel = 'email' | 'sms' | 'whatsapp' | 'webhook' | 'in_app'

export interface ReportDefinition {
  id: string
  name: string
  description: string
  category: 'operations' | 'finance' | 'compliance' | 'commerce' | 'hr' | 'coldchain'
  standards: string[]
  defaultFormat: ReportFormat
  supportsShare: boolean
  webhookEvent: string
}

export const REPORT_CATALOG: ReportDefinition[] = [
  {
    id: 'kpi-summary',
    name: 'Executive KPI Summary',
    description: 'Fleet, orders, revenue, cold chain, procurement, HR headcount',
    category: 'operations',
    standards: ['ISO 8601', 'UTF-8 CSV'],
    defaultFormat: 'csv',
    supportsShare: true,
    webhookEvent: 'report.kpi.generated',
  },
  {
    id: 'executive-summary',
    name: 'Executive Dashboard',
    description: 'High-level tenant operational snapshot',
    category: 'operations',
    standards: ['IFRS management reporting'],
    defaultFormat: 'html',
    supportsShare: true,
    webhookEvent: 'report.executive.generated',
  },
  {
    id: 'traceability',
    name: 'Catch-to-Plate Traceability',
    description: 'EU fisheries lot codes, vessels, landing sites, MSC flags',
    category: 'compliance',
    standards: ['EU Regulation 1224/2009', 'MSC chain of custody'],
    defaultFormat: 'csv',
    supportsShare: true,
    webhookEvent: 'report.traceability.generated',
  },
  {
    id: 'financial',
    name: 'Financial Performance',
    description: 'Revenue, expenses, profit/loss by period (management accounts)',
    category: 'finance',
    standards: ['IFRS', 'ISO 4217 KES'],
    defaultFormat: 'csv',
    supportsShare: true,
    webhookEvent: 'report.financial.generated',
  },
  {
    id: 'profit-loss',
    name: 'Profit & Loss Statement',
    description: 'GL-based P&L for fiscal period',
    category: 'finance',
    standards: ['IFRS IAS 1'],
    defaultFormat: 'html',
    supportsShare: true,
    webhookEvent: 'report.profit_loss.generated',
  },
  {
    id: 'trial-balance',
    name: 'Trial Balance',
    description: 'Double-entry trial balance',
    category: 'finance',
    standards: ['IFRS', 'GAAP-ready'],
    defaultFormat: 'csv',
    supportsShare: true,
    webhookEvent: 'report.trial_balance.generated',
  },
  {
    id: 'commerce-orders',
    name: 'Commerce & Orders',
    description: 'Order volume, revenue, payment status, top species',
    category: 'commerce',
    standards: ['PCI SAQ-A metadata only', 'ISO 4217'],
    defaultFormat: 'csv',
    supportsShare: true,
    webhookEvent: 'report.commerce.generated',
  },
  {
    id: 'coldchain-compliance',
    name: 'Cold Chain & HACCP',
    description: 'Temperature alerts, zones, unresolved incidents',
    category: 'coldchain',
    standards: ['HACCP Codex Alimentarius', 'FSMA'],
    defaultFormat: 'csv',
    supportsShare: true,
    webhookEvent: 'report.coldchain.generated',
  },
  {
    id: 'procurement',
    name: 'Procurement Summary',
    description: 'POs, suppliers, GRN status',
    category: 'operations',
    standards: ['ISO 9001 supplier trace'],
    defaultFormat: 'csv',
    supportsShare: true,
    webhookEvent: 'report.procurement.generated',
  },
  {
    id: 'fishing-operations',
    name: 'BMU Operations',
    description: 'Trips, catches, fleet utilization',
    category: 'operations',
    standards: ['FAO area codes', 'ISO 8601'],
    defaultFormat: 'csv',
    supportsShare: true,
    webhookEvent: 'report.fishing.generated',
  },
]

export function getReportDefinition(reportType: string): ReportDefinition | undefined {
  return REPORT_CATALOG.find((r) => r.id === reportType)
}
