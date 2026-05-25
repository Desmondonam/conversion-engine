import type { ICPSegment, Confidence } from '../types'

// ─── ICP Segment badge ────────────────────────────────────────────────────────

const SEGMENT_LABEL: Record<string, string> = {
  recently_funded_series_ab: 'Funded A/B',
  midmarket_cost_restructuring: 'Restructuring',
  engineering_leadership_transition: 'Leadership Δ',
  specialized_capability_gap: 'Capability Gap',
  no_match: 'No Match',
  not_enriched: 'Not Enriched',
}

const SEGMENT_COLOR: Record<string, string> = {
  recently_funded_series_ab: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  midmarket_cost_restructuring: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  engineering_leadership_transition: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  specialized_capability_gap: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  no_match: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  not_enriched: 'bg-gray-500/10 text-gray-500 border-gray-700',
}

export function SegmentBadge({ segment }: { segment: ICPSegment | 'not_enriched' }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${SEGMENT_COLOR[segment] ?? SEGMENT_COLOR.no_match}`}
    >
      {SEGMENT_LABEL[segment] ?? segment}
    </span>
  )
}

// ─── Confidence badge ────────────────────────────────────────────────────────

const CONF_COLOR: Record<Confidence, string> = {
  high: 'text-emerald-400',
  medium: 'text-amber-400',
  low: 'text-gray-500',
}

export function ConfidenceDot({ confidence }: { confidence: Confidence }) {
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${CONF_COLOR[confidence].replace('text-', 'bg-')}`} />
  )
}

export function ConfidenceLabel({ confidence }: { confidence: Confidence }) {
  return (
    <span className={`text-xs font-medium capitalize ${CONF_COLOR[confidence]}`}>
      {confidence}
    </span>
  )
}

// ─── AI Maturity bar ─────────────────────────────────────────────────────────

export function AIMaturityBar({ score }: { score: number }) {
  const pct = (score / 3) * 100
  const color =
    score >= 3 ? 'bg-emerald-500' :
    score >= 2 ? 'bg-blue-500' :
    score >= 1 ? 'bg-amber-500' :
    'bg-gray-600'

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-400 w-4">{score}/3</span>
    </div>
  )
}

// ─── Status pill ─────────────────────────────────────────────────────────────

export function StatusPill({
  active,
  label,
  activeLabel,
}: {
  active: boolean
  label: string
  activeLabel?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
        active
          ? 'bg-emerald-500/15 text-emerald-300'
          : 'bg-gray-700/50 text-gray-500'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-400' : 'bg-gray-600'}`} />
      {active ? (activeLabel ?? label) : label}
    </span>
  )
}
