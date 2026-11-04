import { HashRouter, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import { Layout } from './components/Layout'
import { RolePicker } from './components/Navigation'
import { OlderAdultDashboard } from './pages/older-adult/MyDay'
import { OlderAdultMedications } from './pages/older-adult/Medications'
import { OlderAdultWellbeing } from './pages/older-adult/Wellbeing'
import { OlderAdultRoutine } from './pages/older-adult/Routine'
import { OlderAdultSmartwatch } from './pages/older-adult/Smartwatch'
import { OlderAdultMeditation } from './pages/older-adult/Meditation'
import { CaregiverOverview } from './pages/caregiver/Overview'
import { CaregiverMonitoring } from './pages/caregiver/Monitoring'

type UserRole = 'older-adult' | 'caregiver'

const ROLE_STORAGE_KEY = 'carely_role'

function loadRole(): UserRole | null {
  if (typeof localStorage === 'undefined') return null
  const raw = localStorage.getItem(ROLE_STORAGE_KEY)
  return raw === 'older-adult' || raw === 'caregiver' ? (raw as UserRole) : null
}

function App() {
  const [userRole, setUserRole] = useState<UserRole | null>(loadRole)

  const setRole = (role: UserRole) => {
    localStorage.setItem(ROLE_STORAGE_KEY, role)
    setUserRole(role)
  }

  const clearRole = () => {
    localStorage.removeItem(ROLE_STORAGE_KEY)
    setUserRole(null)
  }

  // When no role is chosen, show the full-screen role picker and hide the app nav.
  if (userRole === null) {
    return (
      <HashRouter>
        <RolePicker setRole={setRole} />
      </HashRouter>
    )
  }

  return (
    <HashRouter>
      <Routes>
        {/* Older Adult routes */}
        <Route path="/older-adult" element={<Layout userRole="older-adult" onChangeRole={clearRole} />}>
          <Route index element={<OlderAdultDashboard />} />
          <Route path="my-day" element={<OlderAdultDashboard />} />
          <Route path="medications" element={<OlderAdultMedications />} />
          <Route path="wellbeing" element={<OlderAdultWellbeing />} />
          <Route path="routine" element={<OlderAdultRoutine />} />
          <Route path="smartwatch" element={<OlderAdultSmartwatch />} />
          <Route path="meditation" element={<OlderAdultMeditation />} />
        </Route>

        {/* Caregiver routes */}
        <Route path="/caregiver" element={<Layout userRole="caregiver" onChangeRole={clearRole} />}>
          <Route index element={<CaregiverOverview />} />
          <Route path="overview" element={<CaregiverOverview />} />
          <Route path="monitoring" element={<CaregiverMonitoring />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
