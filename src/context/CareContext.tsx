import { createContext, useContext, useCallback, useState, useEffect, type ReactNode } from 'react'
import type {
  CareContextType,
  CarelyData,
  MedicationReminder,
  MedicationReminderInstance,
  WellbeingEntry,
} from '../types/carely'
import { loadInitialData, saveData } from '../types/carely'

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Use local calendar fields rather than toISOString(), which converts to UTC
// and can shift the date for users outside UTC.
function localDateKey(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(`${dateStr}T12:00:00`)
  date.setDate(date.getDate() + days)
  return localDateKey(date)
}

function getDayName(dateStr: string): string {
  return DAYS_OF_WEEK[new Date(`${dateStr}T12:00:00`).getDay()]
}

function generateInstancesForMedication(
  med: MedicationReminder,
  startFrom: string,
  daysAhead: number,
): MedicationReminderInstance[] {
  const instances: MedicationReminderInstance[] = []
  const endDate = med.endDate ? new Date(`${med.endDate}T12:00:00`) : null

  for (let offset = 0; offset <= daysAhead; offset++) {
    const date = addDays(startFrom, offset)
    const dateObj = new Date(`${date}T12:00:00`)

    if (endDate && dateObj > endDate) continue

    let shouldInclude = false
    if (med.recurrence === 'once') {
      shouldInclude = date === med.startDate
    } else if (med.recurrence === 'daily') {
      shouldInclude = true
    } else if (med.recurrence === 'weekly' && med.selectedDays) {
      shouldInclude = med.selectedDays.includes(getDayName(date))
    }

    if (!shouldInclude) continue

    for (const time of med.times) {
      instances.push({
        id: `inst-${med.id}-${date}-${time}`,
        medicationId: med.id,
        date,
        time,
        status: 'pending',
      })
    }
  }

  return instances
}

const CareContext = createContext<CareContextType | undefined>(undefined)

export function CareProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CarelyData>(() => loadInitialData())

  useEffect(() => {
    saveData(data)
  }, [data])

  // Regenerate medication occurrences when medication schedules change while
  // retaining the statuses of occurrences that already exist.
  useEffect(() => {
    setData((previous) => {
      const today = localDateKey()
      const generated: MedicationReminderInstance[] = []

      for (const medication of previous.medications) {
        if (medication.status !== 'active') continue
        generated.push(...generateInstancesForMedication(medication, today, 30))
      }

      const merged = generated.map((instance) => {
        const existing = previous.medicationInstances.find((item) => item.id === instance.id)
        return existing ?? instance
      })

      return { ...previous, medicationInstances: merged }
    })
  }, [data.medications])

  const acknowledgeMedication = useCallback((instanceId: string) => {
    setData((previous) => {
      const instance = previous.medicationInstances.find((item) => item.id === instanceId)
      if (!instance || instance.status !== 'pending') return previous
      return {
        ...previous,
        medicationInstances: previous.medicationInstances.map((item) =>
          item.id === instanceId
            ? { ...item, status: 'acknowledged', acknowledgedAt: new Date().toISOString() }
            : item,
        ),
      }
    })
  }, [])

  const postponeMedication = useCallback((instanceId: string) => {
    setData((previous) => {
      const instance = previous.medicationInstances.find((item) => item.id === instanceId)
      if (!instance || instance.status !== 'pending') return previous
      return {
        ...previous,
        medicationInstances: previous.medicationInstances.map((item) =>
          item.id === instanceId
            ? { ...item, status: 'postponed', postponedAt: new Date().toISOString() }
            : item,
        ),
      }
    })
  }, [])

  const addMedication = useCallback((medication: Omit<MedicationReminder, 'id'>) => {
    const newMedication: MedicationReminder = {
      ...medication,
      id: `med-${Date.now()}`,
    }

    setData((previous) => {
      const generated = generateInstancesForMedication(newMedication, localDateKey(), 30)
      return {
        ...previous,
        medications: [...previous.medications, newMedication],
        medicationInstances: [...previous.medicationInstances, ...generated],
      }
    })
  }, [])

  const editMedication = useCallback((id: string, updates: Partial<MedicationReminder>) => {
    setData((previous) => ({
      ...previous,
      medications: previous.medications.map((medication) =>
        medication.id === id ? { ...medication, ...updates } : medication,
      ),
    }))
  }, [])

  const deleteMedication = useCallback((id: string) => {
    setData((previous) => ({
      ...previous,
      medications: previous.medications.filter((medication) => medication.id !== id),
      medicationInstances: previous.medicationInstances.filter((instance) => instance.medicationId !== id),
    }))
  }, [])

  const pauseMedication = useCallback((id: string) => {
    setData((previous) => ({
      ...previous,
      medications: previous.medications.map((medication) =>
        medication.id === id ? { ...medication, status: 'paused' } : medication,
      ),
    }))
  }, [])

  const reactivateMedication = useCallback((id: string) => {
    setData((previous) => ({
      ...previous,
      medications: previous.medications.map((medication) =>
        medication.id === id ? { ...medication, status: 'active' } : medication,
      ),
    }))
  }, [])

  const completeActivity = useCallback((id: string) => {
    setData((previous) => {
      const activity = previous.activities.find((item) => item.id === id)
      if (!activity || activity.status !== 'pending') return previous
      return {
        ...previous,
        activities: previous.activities.map((item) =>
          item.id === id
            ? { ...item, status: 'completed', completedAt: new Date().toISOString() }
            : item,
        ),
      }
    })
  }, [])

  const postponeActivity = useCallback((id: string) => {
    setData((previous) => {
      const activity = previous.activities.find((item) => item.id === id)
      if (!activity || activity.status !== 'pending') return previous
      return {
        ...previous,
        activities: previous.activities.map((item) =>
          item.id === id
            ? { ...item, status: 'postponed', postponedAt: new Date().toISOString() }
            : item,
        ),
      }
    })
  }, [])

  const submitWellbeing = useCallback((entry: Omit<WellbeingEntry, 'id' | 'timestamp'>) => {
    const newEntry: WellbeingEntry = {
      ...entry,
      id: `wb-${Date.now()}`,
      timestamp: new Date().toISOString(),
      shared: false,
    }
    setData((previous) => ({
      ...previous,
      wellbeing: [newEntry, ...previous.wellbeing],
    }))
  }, [])

  const shareWellbeing = useCallback((id: string) => {
    setData((previous) => ({
      ...previous,
      wellbeing: previous.wellbeing.map((entry) => entry.id === id ? { ...entry, shared: true } : entry),
    }))
  }, [])

  const unshareWellbeing = useCallback((id: string) => {
    setData((previous) => ({
      ...previous,
      wellbeing: previous.wellbeing.map((entry) => entry.id === id ? { ...entry, shared: false } : entry),
    }))
  }, [])

  const value: CareContextType = {
    data,
    acknowledgeMedication,
    postponeMedication,
    addMedication,
    editMedication,
    deleteMedication,
    pauseMedication,
    reactivateMedication,
    completeActivity,
    postponeActivity,
    submitWellbeing,
    shareWellbeing,
    unshareWellbeing,
  }

  return <CareContext.Provider value={value}>{children}</CareContext.Provider>
}

export const useCare = (): CareContextType => {
  const context = useContext(CareContext)
  if (context === undefined) throw new Error('useCare must be used within a CareProvider')
  return context
}
