import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, Mail, Phone, AlertTriangle,
  TrendingUp, CheckCircle, Clock, ArrowRight,
} from 'lucide-react'
import { getHealth, listProspects } from '../api'
import type { HealthResponse, ProspectSummary } from '../types'
import { SegmentBadge } from '../components/Badge'
import Spinner from '../components/Spinner'

const SEGMENT_LABELS: Record<string, string> = {
  recently_funded_series_ab: 'Funded A/B',
  midmarket_cost_restructuring: 'Restructuring',
  engineering_leadership_transition: 'Leadership Δ',
  specialized_capability_gap: 'Capability Gap',
  no_match: 'No Match',
  not_enriched: 'Not Enriched',
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = 'violet',
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  color?: string
}) {
  const colors: Record<string, string> = {
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  }
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-lg border ${colors[color]}`}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [prospects, setProspects] = useState<ProspectSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getHealth(), listProspects()])
      .then(([h, p]) => {
        setHealth(h)
        setProspects(p.prospects)
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const segmentCounts = prospects.reduce<Record<string, number>>((acc, p) => {
    acc[p.icp_segment] = (acc[p.icp_segment] ?? 0) + 1
    return acc
  }, {})

  const activeThreads = prospects.filter((p) => p.email_thread_active).length
  const bookedCalls = prospects.filter((p) => p.discovery_call_booked).length

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">
          Tenacious Conversion Engine — lead generation &amp; outreach overview
        </p>
      </div>

      {loading && (
        <div className="flex items-center gap-3 text-gray-400">
          <Spinner /> <span>Loading…</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 mb-6">
          <AlertTriangle size={16} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* System status banner */}
          <div
            className={`flex items-center gap-3 rounded-xl px-5 py-3 mb-8 border ${
              health?.live_mode
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}
          >
            <div className={`w-2 h-2 rounded-full animate-pulse ${health?.live_mode ? 'bg-red-400' : 'bg-emerald-400'}`} />
            <span className="text-sm font-medium">
              {health?.live_mode
                ? '⚠ LIVE MODE — real outbound active'
                : 'SAFE MODE — outbound routed to staff sink'}
            </span>
            <span className="text-xs opacity-60 ml-auto">
              Server {health?.status} · {health?.timestamp?.slice(0, 19).replace('T', ' ')} UTC
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={Users} label="Total Prospects" value={prospects.length} color="violet" />
            <StatCard icon={Mail} label="Active Threads" value={activeThreads} sub="email conversations open" color="blue" />
            <StatCard icon={Phone} label="Calls Booked" value={bookedCalls} sub="discovery calls scheduled" color="emerald" />
            <StatCard
              icon={TrendingUp}
              label="Qualified Leads"
              value={prospects.filter((p) => p.icp_segment !== 'no_match' && p.icp_segment !== 'not_enriched').length}
              sub="ICP match ≥ 1 segment"
              color="amber"
            />
          </div>

          {/* ICP Breakdown + Recent prospects */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Segment breakdown */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                <CheckCircle size={14} className="text-violet-400" />
                ICP Segment Breakdown
              </h2>
              {prospects.length === 0 ? (
                <p className="text-gray-500 text-sm">No prospects yet</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(segmentCounts).map(([seg, count]) => {
                    const pct = Math.round((count / prospects.length) * 100)
                    return (
                      <div key={seg}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-400">{SEGMENT_LABELS[seg] ?? seg}</span>
                          <span className="text-xs text-gray-500">{count} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-violet-500 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Recent prospects */}
            <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <Clock size={14} className="text-violet-400" />
                  Recent Prospects
                </h2>
                <Link
                  to="/prospects"
                  className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
                >
                  View all <ArrowRight size={12} />
                </Link>
              </div>
              {prospects.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm mb-3">No prospects yet</p>
                  <Link
                    to="/outreach"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-lg transition-colors"
                  >
                    Initiate first outreach
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {prospects.slice(-5).reverse().map((p) => (
                    <Link
                      key={p.email}
                      to={`/prospects/${encodeURIComponent(p.email)}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-800/60 hover:bg-gray-800 transition-colors group"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-200">{p.company}</p>
                        <p className="text-xs text-gray-500">{p.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <SegmentBadge segment={p.icp_segment} />
                        {p.discovery_call_booked && (
                          <span className="text-xs text-emerald-400">📅 Booked</span>
                        )}
                        <ArrowRight size={14} className="text-gray-600 group-hover:text-gray-400" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
