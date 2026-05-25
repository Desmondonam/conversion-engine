import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, ArrowRight, AlertTriangle, RefreshCw } from 'lucide-react'
import { listProspects } from '../api'
import type { ProspectSummary } from '../types'
import { SegmentBadge, StatusPill } from '../components/Badge'
import Spinner from '../components/Spinner'

export default function Prospects() {
  const [prospects, setProspects] = useState<ProspectSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const load = () => {
    setLoading(true)
    setError(null)
    listProspects()
      .then((r) => setProspects(r.prospects))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const filtered = prospects.filter(
    (p) =>
      p.email.toLowerCase().includes(query.toLowerCase()) ||
      p.company.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Prospects</h1>
          <p className="text-gray-400 text-sm mt-1">{prospects.length} total in pipeline</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          <Link
            to="/outreach"
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={15} />
            New Outreach
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search by email or company…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
        />
      </div>

      {/* States */}
      {loading && (
        <div className="flex items-center gap-3 text-gray-400 py-12 justify-center">
          <Spinner /> <span>Loading prospects…</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3">
          <AlertTriangle size={16} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">
            {query ? 'No results match your search' : 'No prospects in the pipeline yet'}
          </p>
          {!query && (
            <Link
              to="/outreach"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-lg transition-colors"
            >
              <Plus size={15} /> Initiate first outreach
            </Link>
          )}
        </div>
      )}

      {/* Table */}
      {!loading && !error && filtered.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wide">
                <th className="text-left px-5 py-3 font-medium">Company / Contact</th>
                <th className="text-left px-5 py-3 font-medium">ICP Segment</th>
                <th className="text-left px-5 py-3 font-medium">Email</th>
                <th className="text-left px-5 py-3 font-medium">Discovery Call</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {filtered.map((p) => (
                <tr
                  key={p.email}
                  className="hover:bg-gray-800/40 transition-colors group"
                >
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-200">{p.company}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{p.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <SegmentBadge segment={p.icp_segment} />
                  </td>
                  <td className="px-5 py-4">
                    <StatusPill
                      active={p.email_thread_active}
                      label="Inactive"
                      activeLabel="Active thread"
                    />
                  </td>
                  <td className="px-5 py-4">
                    <StatusPill
                      active={p.discovery_call_booked}
                      label="Not booked"
                      activeLabel="Booked ✓"
                    />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      to={`/prospects/${encodeURIComponent(p.email)}`}
                      className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      View <ArrowRight size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
