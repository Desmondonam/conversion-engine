import { useState } from 'react'
import { Webhook, Mail, MessageSquare, CheckCircle, AlertTriangle } from 'lucide-react'
import { simulateEmailReply, simulateSmsInbound } from '../api'
import Spinner from '../components/Spinner'

type Tab = 'email' | 'sms'

function CodeBlock({ data }: { data: unknown }) {
  return (
    <pre className="bg-gray-950 border border-gray-800 rounded-lg p-4 text-xs text-green-400 font-mono overflow-x-auto whitespace-pre-wrap">
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}

function EmailSimulator() {
  const [from, setFrom] = useState('')
  const [subject, setSubject] = useState('Re: Tenacious outreach')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await simulateEmailReply({ from, subject, text })
      setResult(res as Record<string, unknown>)
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-xs text-gray-400 mb-1.5">From (prospect email)</label>
        <input
          type="email"
          required
          placeholder="jane@acme.co"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-violet-500"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1.5">Subject</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-violet-500"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1.5">Reply Body</label>
        <textarea
          required
          rows={5}
          placeholder="Thanks for reaching out! I'm interested in learning more. Can we schedule a call?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-violet-500 resize-none"
        />
      </div>

      {/* Quick-fill examples */}
      <div className="flex gap-2 flex-wrap">
        <span className="text-xs text-gray-500">Quick fill:</span>
        {[
          { label: 'Booking intent', text: "I'd love to schedule a call. What times work?" },
          { label: 'Interested', text: 'This looks interesting. Tell me more about your pricing.' },
          { label: 'Not interested', text: "Thanks but we're not looking for this right now." },
        ].map(({ label, text: t }) => (
          <button
            key={label}
            type="button"
            onClick={() => setText(t)}
            className="text-xs text-violet-400 hover:text-violet-300 underline"
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-3 py-2 text-sm">
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
      >
        {loading ? <Spinner size={14} /> : <Mail size={14} />}
        {loading ? 'Sending…' : 'Fire webhook'}
      </button>

      {result && (
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-sm mb-2">
            <CheckCircle size={14} /> Webhook processed
          </div>
          <CodeBlock data={result} />
        </div>
      )}
    </form>
  )
}

function SmsSimulator() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('+254900000000')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await simulateSmsInbound({ from, to, text })
      setResult(res as Record<string, unknown>)
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-xs text-gray-400 mb-1.5">From (prospect phone)</label>
        <input
          type="tel"
          required
          placeholder="+254700000000"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-violet-500"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1.5">To (shortcode)</label>
        <input
          type="tel"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-violet-500"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1.5">Message Text</label>
        <input
          type="text"
          required
          maxLength={160}
          placeholder="Yes I'd like to book a call"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-violet-500"
        />
        <p className="text-xs text-gray-600 mt-1">{text.length}/160 chars</p>
      </div>

      {/* Quick-fill */}
      <div className="flex gap-2 flex-wrap">
        <span className="text-xs text-gray-500">Quick fill:</span>
        {[
          { label: 'Book call', text: 'Yes book me in for a call' },
          { label: 'STOP', text: 'STOP' },
          { label: 'Question', text: 'What services do you offer?' },
        ].map(({ label, text: t }) => (
          <button
            key={label}
            type="button"
            onClick={() => setText(t)}
            className="text-xs text-violet-400 hover:text-violet-300 underline"
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-3 py-2 text-sm">
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
      >
        {loading ? <Spinner size={14} /> : <MessageSquare size={14} />}
        {loading ? 'Sending…' : 'Fire webhook'}
      </button>

      {result && (
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-sm mb-2">
            <CheckCircle size={14} /> Webhook processed
          </div>
          <CodeBlock data={result} />
        </div>
      )}
    </form>
  )
}

export default function Webhooks() {
  const [tab, setTab] = useState<Tab>('email')

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Webhook size={22} className="text-violet-400" />
          Webhook Simulator
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Simulate inbound email replies and SMS messages to test the agent's response pipeline
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-800/60 p-1 rounded-lg mb-6 w-fit">
        {([['email', 'Email Reply', Mail], ['sms', 'SMS Inbound', MessageSquare]] as const).map(
          ([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                tab === id
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ),
        )}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        {tab === 'email' ? <EmailSimulator /> : <SmsSimulator />}
      </div>
    </div>
  )
}
