import { HashRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { OlderAdultDashboard } from './pages/older-adult/MyDay'
import { OlderAdultMedications } from './pages/older-adult/Medications'
import { OlderAdultWellbeing } from './pages/older-adult/Wellbeing'
import { OlderAdultRoutine } from './pages/older-adult/Routine'
import { OlderAdultSmartwatch } from './pages/older-adult/Smartwatch'
import { OlderAdultMeditation } from './pages/older-adult/Meditation'
import { CaregiverOverview } from './pages/caregiver/Overview'
import { CaregiverMonitoring } from './pages/caregiver/Monitoring'
import { Navigation } from './components/Navigation'

function App() {
  return (
    <HashRouter>
      <Navigation />
      <Routes>
        {/* Older Adult Routes */}
        <Route path="/older-adult" element={<Layout userRole="older-adult" />}>
          <Route index element={<OlderAdultDashboard />} />
          <Route path="my-day" element={<OlderAdultDashboard />} />
          <Route path="medications" element={<OlderAdultMedications />} />
          <Route path="wellbeing" element={<OlderAdultWellbeing />} />
          <Route path="routine" element={<OlderAdultRoutine />} />
          <Route path="smartwatch" element={<OlderAdultSmartwatch />} />
          <Route path="meditation" element={<OlderAdultMeditation />} />
        </Route>

        {/* Caregiver Routes */}
        <Route path="/caregiver" element={<Layout userRole="caregiver" />}>
          <Route index element={<CaregiverOverview />} />
          <Route path="overview" element={<CaregiverOverview />} />
          <Route path="monitoring" element={<CaregiverMonitoring />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App