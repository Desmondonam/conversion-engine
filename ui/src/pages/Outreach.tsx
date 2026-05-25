import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Zap, CheckCircle, AlertTriangle, Clock,
  Building2, Mail, Phone, User, Globe,
} from 'lucide-react'
import { initiateOutreach } from '../api'
import type { OutreachRequest, OutreachResult } from '../types'
import { SegmentBadge, ConfidenceLabel, AIMaturityBar } from '../components/Badge'
import Spinner from '../components/Spinner'

const INITIAL: OutreachRequest = {
  name: '',
  email: '',
  phone: '',
  title: '',
  company_name: '',
  company_domain: '',
}

function Field({
  label,
  icon: Icon,
  required,
  ...props
}: {
  label: string
  icon: React.ElementType
  required?: boolean
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          {...props}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
        />
      </div>
    </div>
  )
}

export default function Outreach() {
  const navigate = useNavigate()
  const [form, setForm] = useState<OutreachRequest>(INITIAL)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<OutreachResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const set = (key: keyof OutreachRequest) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await initiateOutreach(form)
      setResult(res)
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setForm(INITIAL)
    setResult(null)
    setError(null)
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Zap size={22} className="text-violet-400" />
          Initiate Outreach
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Runs the full pipeline: enrichment → ICP classification → email compose → send → HubSpot log
        </p>
      </div>

      {!result ? (
        <form onSubmit={submit} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field
              label="Full Name"
              icon={User}
              required
              placeholder="Jane Mwangi"
              value={form.name}
              onChange={set('name')}
            />
            <Field
              label="Job Title"
              icon={Building2}
              placeholder="CTO"
              value={form.title}
              onChange={set('title')}
            />
            <Field
              label="Email Address"
              icon={Mail}
              required
              type="email"
              placeholder="jane@acme.co"
              value={form.email}
              onChange={set('email')}
            />
            <Field
              label="Phone"
              icon={Phone}
              type="tel"
              placeholder="+254700000000"
              value={form.phone}
              onChange={set('phone')}
            />
            <Field
              label="Company Name"
              icon={Building2}
              required
              placeholder="Acme Corp"
              value={form.company_name}
              onChange={set('company_name')}
            />
            <Field
              label="Company Domain"
              icon={Globe}
              placeholder="acme.co"
              value={form.company_domain}
              onChange={set('company_domain')}
            />
          </div>

          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3">
              <AlertTriangle size={15} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-gray-500">
              ⚠ LIVE_MODE=false — email will route to staff sink
            </p>
            <button
              type="submit"
              disabled={loading || !form.name || !form.email || !form.company_name}
              className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
            >
              {loading ? <Spinner size={15} /> : <Zap size={15} />}
              {loading ? 'Running pipeline…' : 'Launch Pipeline'}
            </button>
          </div>
        </form>
      ) : (
        /* Result card */
        <div className="space-y-5">
          {/* Header result */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 flex items-start gap-4">
            <CheckCircle size={20} className="text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-emerald-300 font-semibold">Pipeline completed</p>
              <p className="text-emerald-400/70 text-sm mt-0.5">
                {form.name} @ {form.company_name} — email {result.send_result.routed_to_sink ? 'routed to staff sink' : 'sent to prospect'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Clock size={13} />
              {result.latency_ms}ms
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-2">ICP Segment</p>
              <SegmentBadge segment={result.icp_segment} />
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-gray-500">Confidence:</span>
                <ConfidenceLabel confidence={result.icp_confidence} />
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-2">AI Maturity</p>
              <AIMaturityBar score={result.ai_maturity} />
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Email Variant</p>
              <p className="text-sm text-gray-200 font-mono">{result.variant}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Trace ID</p>
              <p className="text-xs text-gray-400 font-mono truncate">{result.trace_id}</p>
            </div>
          </div>

          {/* Send result */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Send Result</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-gray-500">To</span>
              <span className="text-gray-200">{result.send_result.to}</span>
              <span className="text-gray-500">Status</span>
              <span className="text-emerald-400">{result.send_result.status}</span>
              <span className="text-gray-500">Message ID</span>
              <span className="text-gray-400 font-mono text-xs truncate">{result.send_result.message_id}</span>
            </div>
          </div>

          {/* ICP Reasoning */}
          {result.hiring_signal_brief.icp_reasoning && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">ICP Reasoning</p>
              <p className="text-sm text-gray-300">{result.hiring_signal_brief.icp_reasoning}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={reset}
              className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm rounded-lg transition-colors"
            >
              New prospect
            </button>
            <button
              onClick={() => navigate(`/prospects/${encodeURIComponent(form.email)}`)}
              className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-lg transition-colors"
            >
              View prospect detail →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
