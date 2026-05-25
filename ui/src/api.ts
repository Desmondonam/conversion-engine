import type {
  HealthResponse,
  ProspectsListResponse,
  Prospect,
  OutreachRequest,
  OutreachResult,
} from './types'

const BASE = '/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${res.status} ${res.statusText}: ${text}`)
  }
  return res.json() as Promise<T>
}

// ─── Health ──────────────────────────────────────────────────────────────────
export const getHealth = () => request<HealthResponse>('/health')

// ─── Prospects ───────────────────────────────────────────────────────────────
export const listProspects = () => request<ProspectsListResponse>('/prospects')

export const getProspect = (email: string) =>
  request<Prospect>(`/prospects/${encodeURIComponent(email)}`)

// ─── Outreach ────────────────────────────────────────────────────────────────
export const initiateOutreach = (body: OutreachRequest) =>
  request<OutreachResult>('/outreach/initiate', {
    method: 'POST',
    body: JSON.stringify(body),
  })

// ─── Webhooks (simulation) ────────────────────────────────────────────────────
export const simulateEmailReply = (payload: {
  from: string
  subject: string
  text: string
}) =>
  request<{ trace_id: string; variant: string; reply_sent: boolean; latency_ms: number }>(
    '/webhooks/email',
    { method: 'POST', body: JSON.stringify(payload) },
  )

export const simulateSmsInbound = (payload: {
  from: string
  to: string
  text: string
}) => {
  const form = new URLSearchParams(payload)
  return request<{ action: string; trace_id: string }>(
    '/webhooks/sms',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    },
  )
}
