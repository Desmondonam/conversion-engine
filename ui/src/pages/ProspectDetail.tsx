import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Building2, Mail, Phone, Briefcase,
  TrendingUp, Users, AlertTriangle, Star, Link2,
} from 'lucide-react'
import { getProspect } from '../api'
import type { Prospect } from '../types'
import {
  SegmentBadge, ConfidenceLabel, AIMaturityBar, StatusPill,
} from '../components/Badge'
import Spinner from '../components/Spinner'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">{title}</h2>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-gray-800/60 last:border-0">
      <span className="text-sm text-gray-500 flex-shrink-0 w-40">{label}</span>
      <span className="text-sm text-gray-200 text-right">{value ?? '—'}</span>
    </div>
  )
}

export default function ProspectDetail() {
  const { email } = useParams<{ email: string }>()
  const [prospect, setProspect] = useState<Prospect | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!email) return
    getProspect(email)
      .then(setProspect)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [email])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size={28} />
      </div>
    )
  }

  if (error || !prospect) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3">
          <AlertTriangle size={16} />
          <span className="text-sm">{error ?? 'Prospect not found'}</span>
        </div>
      </div>
    )
  }

  const brief = prospect.hiring_signal_brief
  const gap = prospect.competitor_gap_brief

  return (
    <div className="p-8 max-w-5xl">
      {/* Back */}
      <Link
        to="/prospects"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-200 text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={15} /> Back to prospects
      </Link>

      {/* Title */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">{prospect.company_name}</h1>
          <p className="text-gray-400 text-sm mt-1">
            {prospect.name} · {prospect.title || 'No title'}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {brief && <SegmentBadge segment={brief.icp_segment} />}
          <div className="flex gap-2">
            <StatusPill active={prospect.email_thread_active} label="Email inactive" activeLabel="Email active" />
            <StatusPill active={prospect.discovery_call_booked} label="No call" activeLabel="Call booked" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact */}
        <Section title="Contact">
          <Row label={<><Mail size={12} className="inline mr-1" />Email</>} value={prospect.email} />
          <Row label={<><Phone size={12} className="inline mr-1" />Phone</>} value={prospect.phone} />
          <Row label={<><Building2 size={12} className="inline mr-1" />Company</>} value={prospect.company_name} />
          <Row label={<><Link2 size={12} className="inline mr-1" />Domain</>} value={prospect.company_domain || '—'} />
          <Row label={<><Briefcase size={12} className="inline mr-1" />Title</>} value={prospect.title || '—'} />
          <Row label="HubSpot ID" value={prospect.hubspot_contact_id ?? '—'} />
          <Row label="Cal.com UID" value={prospect.calcom_booking_uid ?? '—'} />
          <Row
            label="Created"
            value={new Date(prospect.created_at).toLocaleString()}
          />
        </Section>

        {/* ICP & AI Maturity */}
        <Section title="ICP Classification">
          {brief ? (
            <>
              <Row label="Segment" value={<SegmentBadge segment={brief.icp_segment} />} />
              <Row label="Confidence" value={<ConfidenceLabel confidence={brief.icp_confidence} />} />
              <div className="py-2 border-b border-gray-800/60">
                <p className="text-sm text-gray-500 mb-2">AI Maturity Score</p>
                {brief.ai_maturity && <AIMaturityBar score={brief.ai_maturity.score} />}
                {brief.ai_maturity?.justification && (
                  <p className="text-xs text-gray-500 mt-2 italic">{brief.ai_maturity.justification}</p>
                )}
              </div>
              <Row label="Sector" value={brief.sector || '—'} />
              <Row label="Employees" value={brief.employee_count ?? '—'} />
              <Row label="Location" value={brief.location || '—'} />
              {brief.icp_reasoning && (
                <div className="mt-3 p-3 bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-400">{brief.icp_reasoning}</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-sm">Not yet enriched</p>
          )}
        </Section>

        {/* Hiring signals */}
        {brief && (
          <Section title="Hiring Signals">
            {brief.funding ? (
              <Row
                label="💰 Funding"
                value={`${brief.funding.round_type}${brief.funding.amount_usd ? ` · $${(brief.funding.amount_usd / 1e6).toFixed(1)}M` : ''}${brief.funding.days_ago ? ` · ${brief.funding.days_ago}d ago` : ''}`}
              />
            ) : (
              <Row label="💰 Funding" value="—" />
            )}
            {brief.layoff ? (
              <Row
                label="📉 Layoff"
                value={`${brief.layoff.percentage_cut ? `${brief.layoff.percentage_cut}%` : ''} ${brief.layoff.days_ago ? `· ${brief.layoff.days_ago}d ago` : ''}`}
              />
            ) : (
              <Row label="📉 Layoff" value="—" />
            )}
            {brief.job_posts ? (
              <>
                <Row label="📋 Open Roles" value={brief.job_posts.total_open_roles} />
                <Row label="  Engineering" value={brief.job_posts.engineering_roles} />
                <Row label="  AI-Adjacent" value={brief.job_posts.ai_adjacent_roles} />
                {brief.job_posts.velocity_60d != null && (
                  <Row label="  Velocity 60d" value={`${brief.job_posts.velocity_60d}×`} />
                )}
              </>
            ) : (
              <Row label="📋 Job Posts" value="—" />
            )}
            {brief.leadership_change ? (
              <Row
                label="👤 Leadership Δ"
                value={`${brief.leadership_change.role}: ${brief.leadership_change.name}${brief.leadership_change.days_ago ? ` · ${brief.leadership_change.days_ago}d ago` : ''}`}
              />
            ) : (
              <Row label="👤 Leadership Δ" value="—" />
            )}
            {brief.tech_stack.length > 0 && (
              <div className="py-2">
                <p className="text-sm text-gray-500 mb-2">Tech Stack</p>
                <div className="flex flex-wrap gap-1">
                  {brief.tech_stack.map((t) => (
                    <span key={t} className="px-2 py-0.5 bg-gray-800 text-gray-300 text-xs rounded">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Section>
        )}

        {/* Competitor Gap */}
        {gap && (
          <Section title="Competitor Gap Brief">
            <Row label="Prospect Score" value={<span className="font-mono">{gap.prospect_score}/3</span>} />
            <Row label="Sector" value={gap.sector || '—'} />
            <Row label="Percentile" value={`${gap.prospect_percentile.toFixed(0)}th`} />
            <Row label="Top-quartile threshold" value={gap.top_quartile_threshold} />
            <Row label="Confidence" value={<ConfidenceLabel confidence={gap.confidence} />} />

            {gap.gaps.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                  <TrendingUp size={11} /> Identified Gaps
                </p>
                <ul className="space-y-1.5">
                  {gap.gaps.map((g, i) => (
                    <li key={i} className="text-xs text-gray-300 bg-gray-800 rounded px-3 py-2">
                      {g}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {gap.competitors.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                  <Users size={11} /> Sector Peers
                </p>
                <div className="space-y-1">
                  {gap.competitors.slice(0, 5).map((c) => (
                    <div key={c.competitor_name} className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{c.competitor_name}</span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Star
                            key={i}
                            size={10}
                            className={i < c.ai_maturity_score ? 'text-amber-400 fill-amber-400' : 'text-gray-700'}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Section>
        )}
      </div>
    </div>
  )
}
