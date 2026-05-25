// ─── Enums ────────────────────────────────────────────────────────────────────

export type ICPSegment =
  | 'recently_funded_series_ab'
  | 'midmarket_cost_restructuring'
  | 'engineering_leadership_transition'
  | 'specialized_capability_gap'
  | 'no_match'

export type Confidence = 'high' | 'medium' | 'low'

// ─── Sub-models ───────────────────────────────────────────────────────────────

export interface AIMaturityScore {
  score: number          // 0-3
  confidence: Confidence
  signals: Record<string, string>
  justification: string
}

export interface FundingEvent {
  round_type: string
  amount_usd: number | null
  date: string | null
  days_ago: number | null
}

export interface LayoffEvent {
  date: string
  headcount_cut: number | null
  percentage_cut: number | null
  days_ago: number | null
}

export interface JobPostSignal {
  total_open_roles: number
  engineering_roles: number
  ai_adjacent_roles: number
  velocity_60d: number | null
  sources: string[]
}

export interface LeadershipChange {
  role: string
  name: string
  date: string | null
  days_ago: number | null
}

export interface CompetitorGapEntry {
  competitor_name: string
  ai_maturity_score: number
  practices: string[]
}

export interface CompetitorGapBrief {
  prospect_score: number
  sector: string
  top_quartile_threshold: number
  prospect_percentile: number
  competitors: CompetitorGapEntry[]
  gaps: string[]
  confidence: Confidence
  generated_at: string
}

export interface HiringSignalBrief {
  company_name: string
  crunchbase_id: string
  sector: string
  employee_count: number | null
  location: string
  tech_stack: string[]
  funding: FundingEvent | null
  layoff: LayoffEvent | null
  job_posts: JobPostSignal | null
  leadership_change: LeadershipChange | null
  ai_maturity: AIMaturityScore | null
  icp_segment: ICPSegment
  icp_confidence: Confidence
  icp_reasoning: string
  last_enriched_at: string
}

// ─── Prospect ────────────────────────────────────────────────────────────────

export interface Prospect {
  name: string
  email: string
  phone: string | null
  title: string
  company_name: string
  company_domain: string
  hiring_signal_brief: HiringSignalBrief | null
  competitor_gap_brief: CompetitorGapBrief | null
  hubspot_contact_id: string | null
  thread_id: string | null
  email_thread_active: boolean
  sms_thread_active: boolean
  discovery_call_booked: boolean
  calcom_booking_uid: string | null
  created_at: string
  updated_at: string
}

// ─── API response types ───────────────────────────────────────────────────────

export interface HealthResponse {
  status: string
  live_mode: boolean
  timestamp: string
  warning: string | null
}

export interface ProspectsListResponse {
  count: number
  prospects: ProspectSummary[]
}

export interface ProspectSummary {
  email: string
  company: string
  icp_segment: ICPSegment | 'not_enriched'
  email_thread_active: boolean
  discovery_call_booked: boolean
}

export interface OutreachResult {
  trace_id: string
  status: string
  variant: string
  icp_segment: ICPSegment
  icp_confidence: Confidence
  ai_maturity: number
  send_result: {
    message_id: string
    to: string
    routed_to_sink: boolean
    status: string
    timestamp: string
  }
  hubspot_contact_id: string
  latency_ms: number
  hiring_signal_brief: HiringSignalBrief
  competitor_gap_brief: CompetitorGapBrief
}

export interface OutreachRequest {
  name: string
  email: string
  phone?: string
  title?: string
  company_name: string
  company_domain?: string
}
