import { useEffect, useState } from 'react'
import {
  Activity, CheckCircle, XCircle, RefreshCw,
  Server, Shield, Clock,
} from 'lucide-react'
import { getHealth } from '../api'
import type { HealthResponse } from '../types'
import Spinner from '../components/Spinner'

const SERVICES = [
  { key: 'openrouter', label: 'OpenRouter LLM', env: 'OPENROUTER_API_KEY', note: 'Dev-tier: Qwen3 / DeepSeek V3' },
  { key: 'anthropic', label: 'Anthropic Claude', env: 'ANTHROPIC_API_KEY', note: 'Eval-tier: Claude Sonnet 4.6' },
  { key: 'langfuse', label: 'Langfuse Observability', env: 'LANGFUSE_PUBLIC_KEY', note: 'Trace + cost monitoring' },
  { key: 'resend', label: 'Resend Email', env: 'RESEND_API_KEY', note: 'Primary outbound channel' },
  { key: 'africastalking', label: "Africa's Talking SMS", env: 'AFRICASTALKING_API_KEY', note: 'Secondary channel (warm leads)' },
  { key: 'hubspot', label: 'HubSpot CRM', env: 'HUBSPOT_ACCESS_TOKEN', note: 'Contact & activity logging' },
  { key: 'calcom', label: 'Cal.com Booking', env: 'CALCOM_API_KEY', note: 'Discovery call scheduling' },
]

export default function Health() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    getHealth()
      .then(setHealth)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Activity size={22} className="text-violet-400" />
            System Health
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Live server status and service configuration
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg text-sm transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading && !health && (
        <div className="flex items-center gap-3 text-gray-400 py-12 justify-center">
          <Spinner /> Checking server…
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-5 py-4 mb-6">
          <XCircle size={18} />
          <div>
            <p className="font-medium text-sm">Server unreachable</p>
            <p className="text-xs mt-0.5 opacity-70">{error}</p>
          </div>
        </div>
      )}

      {health && (
        <>
          {/* Main status */}
          <div
            className={`flex items-center gap-4 rounded-xl px-5 py-4 mb-6 border ${
              health.status === 'ok'
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}
          >
            {health.status === 'ok' ? (
              <CheckCircle size={24} className="text-emerald-400 flex-shrink-0" />
            ) : (
              <XCircle size={24} className="text-red-400 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className={`font-semibold ${health.status === 'ok' ? 'text-emerald-300' : 'text-red-300'}`}>
                Server {health.status.toUpperCase()}
              </p>
              {health.warning && (
                <p className="text-xs text-amber-400 mt-0.5">{health.warning}</p>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Clock size={12} />
              {new Date(health.timestamp).toLocaleTimeString()}
            </div>
          </div>

          {/* Live mode */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield size={18} className={health.live_mode ? 'text-red-400' : 'text-emerald-400'} />
                <div>
                  <p className="text-sm font-medium text-gray-200">Outbound Mode</p>
                  <p className="text-xs text-gray-500">
                    {health.live_mode
                      ? 'LIVE — emails & SMS sent to real prospects'
                      : 'SAFE — all outbound routed to staff sink'}
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  health.live_mode
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {health.live_mode ? 'LIVE' : 'SAFE'}
              </span>
            </div>
          </div>

          {/* Service status */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800 flex items-center gap-2">
              <Server size={14} className="text-violet-400" />
              <h2 className="text-sm font-semibold text-gray-300">Integrated Services</h2>
              <span className="ml-auto text-xs text-gray-500">Configure via .env</span>
            </div>
            <div className="divide-y divide-gray-800/60">
              {SERVICES.map((svc) => (
                <div key={svc.key} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-sm text-gray-200">{svc.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{svc.note}</p>
                  </div>
                  <div className="text-right">
                    <code className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                      {svc.env}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* API endpoints */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mt-6">
            <div className="px-5 py-4 border-b border-gray-800">
              <h2 className="text-sm font-semibold text-gray-300">API Endpoints</h2>
            </div>
            {[
              { method: 'GET', path: '/health', desc: 'Server health check' },
              { method: 'GET', path: '/prospects', desc: 'List all prospects' },
              { method: 'GET', path: '/prospects/{email}', desc: 'Prospect detail' },
              { method: 'POST', path: '/outreach/initiate', desc: 'Trigger full pipeline' },
              { method: 'POST', path: '/webhooks/email', desc: 'Email reply webhook' },
              { method: 'POST', path: '/webhooks/sms', desc: 'SMS inbound webhook' },
            ].map((ep) => (
              <div key={ep.path} className="flex items-center gap-4 px-5 py-3 border-b border-gray-800/40 last:border-0">
                <span
                  className={`text-xs font-bold font-mono w-12 ${
                    ep.method === 'GET' ? 'text-blue-400' : 'text-emerald-400'
                  }`}
                >
                  {ep.method}
                </span>
                <code className="text-xs text-gray-300 font-mono flex-1">{ep.path}</code>
                <span className="text-xs text-gray-500">{ep.desc}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
