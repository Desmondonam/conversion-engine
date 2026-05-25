import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Zap,
  Activity,
  Webhook,
  ChevronRight,
} from 'lucide-react'

const nav = [
  { to: '/',          label: 'Dashboard',  Icon: LayoutDashboard },
  { to: '/prospects', label: 'Prospects',  Icon: Users },
  { to: '/outreach',  label: 'Outreach',   Icon: Zap },
  { to: '/webhooks',  label: 'Simulate',   Icon: Webhook },
  { to: '/health',    label: 'Health',     Icon: Activity },
]

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-950">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col bg-gray-900 border-r border-gray-800">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">Tenacious</p>
            <p className="text-xs text-gray-400 leading-tight">Conversion Engine</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group ${
                  isActive
                    ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} className={isActive ? 'text-violet-400' : ''} />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight size={14} className="text-violet-500" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-800">
          <p className="text-xs text-gray-500">10Academy TRP1 · Week 10</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <Outlet />
      </main>
    </div>
  )
}
