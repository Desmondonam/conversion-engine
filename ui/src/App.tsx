import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Prospects from './pages/Prospects'
import ProspectDetail from './pages/ProspectDetail'
import Outreach from './pages/Outreach'
import Webhooks from './pages/Webhooks'
import Health from './pages/Health'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="prospects" element={<Prospects />} />
        <Route path="prospects/:email" element={<ProspectDetail />} />
        <Route path="outreach" element={<Outreach />} />
        <Route path="webhooks" element={<Webhooks />} />
        <Route path="health" element={<Health />} />
      </Route>
    </Routes>
  )
}
