import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Edit2,
  Pause,
  Pill,
  Play,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useCare } from '../../context/CareContext'
import { useLang } from '../../context/LanguageContext'
import { IS_DEMO, resetDemoData } from '../../types/carely'

type Recurrence = 'daily' | 'weekly' | 'once'
type FormErrors = {
  name?: string
  times?: string
  days?: string
  dates?: string
  form?: string
}

const WEEK_DAYS = [
  { key: 'Sun', labelKey: 'daySun', fallback: 'Sun' },
  { key: 'Mon', labelKey: 'dayMon', fallback: 'Mon' },
  { key: 'Tue', labelKey: 'dayTue', fallback: 'Tue' },
  { key: 'Wed', labelKey: 'dayWed', fallback: 'Wed' },
  { key: 'Thu', labelKey: 'dayThu', fallback: 'Thu' },
  { key: 'Fri', labelKey: 'dayFri', fallback: 'Fri' },
  { key: 'Sat', labelKey: 'daySat', fallback: 'Sat' },
]

function localDateKey(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getStatusLabel(status: string, t: (key: string) => string): string {
  if (status === 'acknowledged') return t('reminderAcknowledged')
  if (status === 'postponed') return t('reminderPostponed')
  return t('awaitingResponse')
}

function getStatusClasses(status: string): string {
  if (status === 'acknowledged') return 'bg-emerald-50 text-emerald-800 border-emerald-200'
  if (status === 'postponed') return 'bg-amber-50 text-amber-800 border-amber-200'
  return 'bg-sky-50 text-sky-800 border-sky-200'
}

export const OlderAdultMedications = () => {
  const {
    data,
    acknowledgeMedication,
    postponeMedication,
    addMedication,
    editMedication,
    deleteMedication,
    pauseMedication,
    reactivateMedication,
  } = useCare()
  const { t, isRTL } = useLang()

  // Fallback text keeps the interface readable if a translation key is missing.
  const tr = (key: string, fallback: string) => {
    const translated = t(key)
    return translated === key ? fallback : translated
  }

  const medications = Array.isArray(data?.medications) ? data.medications : []
  const instances = Array.isArray(data?.medicationInstances) ? data.medicationInstances : []
  const today = localDateKey()
  const nameInputRef = useRef<HTMLInputElement>(null)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [dosage, setDosage] = useState('')
  const [times, setTimes] = useState<string[]>(['08:00'])
  const [recurrence, setRecurrence] = useState<Recurrence>('daily')
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState('')

  const todaysInstances = useMemo(
    () => instances
      .filter((instance) => instance.date === today)
      .sort((a, b) => a.time.localeCompare(b.time)),
    [instances, today],
  )
  const acknowledgedToday = todaysInstances.filter((instance) => instance.status === 'acknowledged').length
  const pendingToday = todaysInstances.filter((instance) => instance.status === 'pending').length

  useEffect(() => {
    if (isFormOpen) {
      const timeout = window.setTimeout(() => nameInputRef.current?.focus(), 30)
      return () => window.clearTimeout(timeout)
    }
    return undefined
  }, [isFormOpen])

  useEffect(() => {
    if (!feedback) return undefined
    const timeout = window.setTimeout(() => setFeedback(''), 3500)
    return () => window.clearTimeout(timeout)
  }, [feedback])

  const clearForm = () => {
    setEditingId(null)
    setName('')
    setDosage('')
    setTimes(['08:00'])
    setRecurrence('daily')
    setSelectedDays([])
    setStartDate(localDateKey())
    setEndDate('')
    setNotes('')
    setErrors({})
    setIsSaving(false)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    clearForm()
  }

  // Demo only: restores the original synthetic dataset. Beta user data is
  // never touched because this function is a no-op in beta mode.
  const handleResetDemo = () => {
    if (!IS_DEMO) return
    const confirmed = window.confirm(
      tr('confirmResetDemo', 'This will reset all demo data to the original synthetic dataset. Continue?')
    )
    if (!confirmed) return
    resetDemoData()
    window.location.reload()
  }

  const openAddForm = () => {
    clearForm()
    setIsFormOpen(true)
    setFeedback('')
  }

  const openEditForm = (medication: (typeof medications)[number]) => {
    setEditingId(medication.id)
    setName(medication.name ?? '')
    setDosage(medication.dosage ?? '')
    setTimes(medication.times?.length ? [...medication.times] : ['08:00'])
    setRecurrence(medication.recurrence ?? 'daily')
    setSelectedDays([...(medication.selectedDays ?? [])])
    setStartDate(medication.startDate || today)
    setEndDate(medication.endDate ?? '')
    setNotes(medication.notes ?? '')
    setErrors({})
    setFeedback('')
    setIsFormOpen(true)
  }

  const updateTime = (index: number, value: string) => {
    setTimes((current) => current.map((time, i) => (i === index ? value : time)))
    setErrors((current) => ({ ...current, times: undefined, form: undefined }))
  }

  const toggleDay = (day: string) => {
    setSelectedDays((current) => current.includes(day)
      ? current.filter((item) => item !== day)
      : [...current, day])
    setErrors((current) => ({ ...current, days: undefined }))
  }

  const validate = (): { valid: boolean; validTimes: string[] } => {
    const nextErrors: FormErrors = {}
    const cleanTimes = times.map((time) => time.trim()).filter(Boolean)
    const uniqueTimes = [...new Set(cleanTimes)]

    if (!name.trim()) nextErrors.name = tr('errorMedicationNameRequired', 'Enter a medication name.')
    if (cleanTimes.length === 0) {
      nextErrors.times = tr('errorReminderTimeRequired', 'Add at least one reminder time.')
    } else if (uniqueTimes.length !== cleanTimes.length) {
      nextErrors.times = tr('errorDuplicateReminderTime', 'Remove duplicate reminder times.')
    }
    if (recurrence === 'weekly' && selectedDays.length === 0) {
      nextErrors.days = tr('errorSelectWeekday', 'Select at least one day.')
    }
    if (!startDate || (endDate && endDate < startDate)) {
      nextErrors.dates = tr('errorInvalidDateRange', 'The end date must be on or after the start date.')
    }

    setErrors(nextErrors)
    return { valid: Object.keys(nextErrors).length === 0, validTimes: uniqueTimes }
  }

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSaving) return

    const result = validate()
    if (!result.valid) return

    setIsSaving(true)
    setErrors({})

    const existingMedication = editingId
      ? medications.find((medication) => medication.id === editingId)
      : undefined

    const medication: Parameters<typeof addMedication>[0] = {
      name: name.trim(),
      dosage: dosage.trim(),
      times: result.validTimes,
      recurrence,
      selectedDays: recurrence === 'weekly' ? selectedDays : undefined,
      startDate,
      endDate: endDate || undefined,
      status: existingMedication?.status ?? 'active',
      notes: notes.trim() || undefined,
    }

    try {
      if (editingId) {
        await Promise.resolve(editMedication(editingId, medication))
        setFeedback(tr('medicationUpdated', 'Medication updated.'))
      } else {
        await Promise.resolve(addMedication(medication))
        setFeedback(tr('medicationAdded', 'Medication added.'))
      }
      setIsFormOpen(false)
      clearForm()
    } catch (error) {
      console.error('Could not save medication:', error)
      setErrors({ form: tr('errorSaveMedication', 'Could not save this medication. Please try again.') })
      setIsSaving(false)
    }
  }

  const handleDelete = (id: string, medicationName: string) => {
    const confirmed = window.confirm(
      `${tr('confirmDeleteMedication', 'Delete this medication?')}\n\n${medicationName}`,
    )
    if (!confirmed) return

    try {
      deleteMedication(id)
      if (editingId === id) closeForm()
      setFeedback(tr('medicationDeleted', 'Medication deleted.'))
    } catch (error) {
      console.error('Could not delete medication:', error)
      setFeedback(tr('errorDeleteMedication', 'Could not delete this medication.'))
    }
  }

  const recurrenceLabel = (value: Recurrence) => {
    if (value === 'weekly') return tr('recurrenceWeekly', 'Selected weekdays')
    if (value === 'once') return tr('recurrenceOnce', 'Once')
    return tr('recurrenceDaily', 'Every day')
  }

  return (
    <main dir={isRTL ? 'rtl' : 'ltr'} className="mx-auto w-full max-w-5xl space-y-6 pb-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {tr('medications', 'Medications')}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {tr('manageMedicationDescription', 'Manage medication reminders and schedules.')}
          </p>
        </div>
        <button
          type="button"
          onClick={openAddForm}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          <Plus size={18} aria-hidden="true" />
          {tr('addMedication', 'Add medication')}
        </button>
        {IS_DEMO && (
          <button
            type="button"
            onClick={handleResetDemo}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <AlertCircle size={16} /> {tr('resetDemoData', 'Reset demo data')}
          </button>
        )}
      </header>

      {feedback && (
        <div role="status" aria-live="polite" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {feedback}
        </div>
      )}

      {isFormOpen && (
        <section className="relative z-10 rounded-xl border border-primary-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? tr('editMedication', 'Edit medication') : tr('addMedication', 'Add medication')}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {tr('medicationFormDescription', 'Enter the medication details and reminder schedule.')}
              </p>
            </div>
            <button
              type="button"
              onClick={closeForm}
              aria-label={tr('close', 'Close')}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <X size={19} />
            </button>
          </div>

          <form onSubmit={handleSave} noValidate className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="medication-name" className="block text-sm font-medium text-gray-700">
                  {tr('medicationName', 'Medication name')} <span className="text-red-600">*</span>
                </label>
                <input
                  ref={nameInputRef}
                  id="medication-name"
                  name="medicationName"
                  type="text"
                  autoComplete="off"
                  required
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value)
                    setErrors((current) => ({ ...current, name: undefined, form: undefined }))
                  }}
                  placeholder={tr('medicationNamePlaceholder', 'e.g. Medication name')}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'medication-name-error' : undefined}
                  className="relative z-10 block min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                />
                {errors.name && <p id="medication-name-error" className="text-sm text-red-600">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="medication-dosage" className="block text-sm font-medium text-gray-700">
                  {tr('dosage', 'Dosage / instructions')} <span className="font-normal text-gray-400">({tr('optional', 'optional')})</span>
                </label>
                <input
                  id="medication-dosage"
                  name="dosage"
                  type="text"
                  value={dosage}
                  onChange={(event) => setDosage(event.target.value)}
                  placeholder={tr('dosagePlaceholder', 'e.g. As prescribed')}
                  className="relative z-10 block min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                />
              </div>
            </div>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-gray-700">
                {tr('reminderTime', 'Reminder times')} <span className="text-red-600">*</span>
              </legend>
              <div className="space-y-2">
                {times.map((time, index) => (
                  <div key={`time-${index}`} className="flex max-w-md items-center gap-2">
                    <label className="sr-only" htmlFor={`medication-time-${index}`}>
                      {tr('reminderTime', 'Reminder time')} {index + 1}
                    </label>
                    <input
                      id={`medication-time-${index}`}
                      name={`reminderTime-${index}`}
                      type="time"
                      required
                      value={time}
                      onChange={(event) => updateTime(index, event.target.value)}
                      className="relative z-10 min-h-11 min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 shadow-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                    />
                    <button
                      type="button"
                      onClick={() => setTimes((current) => current.length > 1 ? current.filter((_, i) => i !== index) : current)}
                      disabled={times.length === 1}
                      aria-label={`${tr('removeTime', 'Remove time')} ${index + 1}`}
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setTimes((current) => [...current, ''])}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-primary-700 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <Plus size={15} />
                {tr('addTime', 'Add another time')}
              </button>
              {errors.times && <p className="text-sm text-red-600">{errors.times}</p>}
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-gray-700">{tr('recurrence', 'Repeat')}</legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {([
                  { value: 'daily', label: tr('recurrenceDaily', 'Every day') },
                  { value: 'weekly', label: tr('recurrenceWeekly', 'Selected weekdays') },
                  { value: 'once', label: tr('recurrenceOnce', 'Once') },
                ] as const).map((option) => (
                  <label
                    key={option.value}
                    className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${recurrence === option.value ? 'border-primary-400 bg-primary-50 text-primary-800' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <input
                      type="radio"
                      name="medication-recurrence"
                      value={option.value}
                      checked={recurrence === option.value}
                      onChange={() => setRecurrence(option.value)}
                      className="h-4 w-4 accent-primary-600"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>

            {recurrence === 'weekly' && (
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-gray-700">{tr('selectDays', 'Choose days')}</legend>
                <div className="flex flex-wrap gap-2">
                  {WEEK_DAYS.map((day) => {
                    const selected = selectedDays.includes(day.key)
                    return (
                      <button
                        key={day.key}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => toggleDay(day.key)}
                        className={`min-h-10 min-w-12 rounded-lg border px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary-500 ${selected ? 'border-primary-400 bg-primary-50 text-primary-800' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
                      >
                        {tr(day.labelKey, day.fallback)}
                      </button>
                    )
                  })}
                </div>
                {errors.days && <p className="text-sm text-red-600">{errors.days}</p>}
              </fieldset>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="medication-start-date" className="block text-sm font-medium text-gray-700">
                  {tr('startDate', 'Start date')}
                </label>
                <input
                  id="medication-start-date"
                  name="startDate"
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="relative z-10 block min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 shadow-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="medication-end-date" className="block text-sm font-medium text-gray-700">
                  {tr('endDate', 'End date')} <span className="font-normal text-gray-400">({tr('optional', 'optional')})</span>
                </label>
                <input
                  id="medication-end-date"
                  name="endDate"
                  type="date"
                  min={startDate || undefined}
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="relative z-10 block min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 shadow-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                />
              </div>
            </div>
            {errors.dates && <p className="text-sm text-red-600">{errors.dates}</p>}

            <div className="space-y-1.5">
              <label htmlFor="medication-notes" className="block text-sm font-medium text-gray-700">
                {tr('notes', 'Notes')} <span className="font-normal text-gray-400">({tr('optional', 'optional')})</span>
              </label>
              <textarea
                id="medication-notes"
                name="notes"
                rows={2}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder={tr('enterNote', 'Add an optional note')}
                className="relative z-10 block w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              />
            </div>

            {errors.form && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {errors.form}
              </p>
            )}

            <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeForm}
                disabled={isSaving}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {tr('cancel', 'Cancel')}
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
              >
                <Save size={16} />
                {isSaving ? tr('saving', 'Saving…') : tr('saveMedication', 'Save medication')}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl border border-sky-100 bg-sky-50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-700">
            <Clock3 size={20} />
          </div>
          <div>
            <p className="text-sm text-sky-800">{tr('awaitingResponse', 'Awaiting response')}</p>
            <p className="text-2xl font-bold text-sky-950">{pendingToday}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-sm text-emerald-800">{tr('reminderAcknowledged', 'Reminder acknowledged')}</p>
            <p className="text-2xl font-bold text-emerald-950">{acknowledgedToday}</p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-4 py-4 sm:px-5">
          <h2 className="font-semibold text-gray-900">{tr('todaysMedicationSchedule', "Today's medication reminders")}</h2>
        </div>
        {todaysInstances.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <Clock3 className="mx-auto mb-2 text-gray-300" size={28} />
            <p className="text-sm text-gray-500">{tr('noUpcomingReminders', 'No medication reminders scheduled for today.')}</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {todaysInstances.map((instance) => {
              const medication = medications.find((item) => item.id === instance.medicationId)
              if (!medication) return null
              return (
                <li key={instance.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                      <Pill size={19} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900">{medication.name}</p>
                      {medication.dosage && <p className="mt-0.5 text-sm text-gray-500">{medication.dosage}</p>}
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                          <Clock3 size={14} /> {instance.time}
                        </span>
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusClasses(instance.status)}`}>
                          {getStatusLabel(instance.status, t)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {instance.status === 'pending' && (
                    <div className="flex shrink-0 gap-2 sm:ps-3">
                      <button
                        type="button"
                        onClick={() => acknowledgeMedication(instance.id)}
                        className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-50 sm:flex-none"
                      >
                        <CheckCircle2 size={15} /> {tr('acknowledge', 'Acknowledge')}
                      </button>
                      <button
                        type="button"
                        onClick={() => postponeMedication(instance.id)}
                        className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-medium text-amber-800 hover:bg-amber-50 sm:flex-none"
                      >
                        <AlertCircle size={15} /> {tr('postpone', 'Postpone')}
                      </button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4 sm:px-5">
          <div>
            <h2 className="font-semibold text-gray-900">{tr('medicationDetails', 'Your medications')}</h2>
            <p className="mt-0.5 text-sm text-gray-500">
              {medications.length} {tr('medicationsCountLabel', 'medication(s)')}
            </p>
          </div>
          {!isFormOpen && (
            <button
              type="button"
              onClick={openAddForm}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-50"
            >
              <Plus size={16} /> {tr('addMedication', 'Add medication')}
            </button>
          )}
        </div>

        {medications.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <Pill className="mx-auto mb-3 text-gray-300" size={32} />
            <h3 className="font-medium text-gray-900">{tr('noMedicationsYet', 'No medications added yet')}</h3>
            <p className="mt-1 text-sm text-gray-500">{tr('noMedicationsDescription', 'Add a medication to create its reminder schedule.')}</p>
            <button
              type="button"
              onClick={openAddForm}
              className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            >
              <Plus size={16} /> {tr('addMedication', 'Add medication')}
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {medications.map((medication) => (
              <li key={medication.id} className="px-4 py-4 sm:px-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{medication.name}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${medication.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                        {medication.status === 'active' ? tr('active', 'Active') : tr('paused', 'Paused')}
                      </span>
                    </div>
                    {medication.dosage && <p className="mt-1 text-sm text-gray-600">{medication.dosage}</p>}
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span>{tr('reminderTime', 'Times')}: {medication.times.join(', ')}</span>
                      <span>{tr('recurrence', 'Repeat')}: {recurrenceLabel(medication.recurrence)}</span>
                      {medication.recurrence === 'weekly' && (medication.selectedDays?.length ?? 0) > 0 && (
                        <span>{medication.selectedDays?.map((day) => tr(`day${day}`, day)).join(', ')}</span>
                      )}
                      <span>{tr('startDate', 'Starts')}: {medication.startDate}</span>
                      {medication.endDate && <span>{tr('endDate', 'Ends')}: {medication.endDate}</span>}
                    </div>
                    {medication.notes && <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">{medication.notes}</p>}
                  </div>

                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    {medication.status === 'active' ? (
                      <button
                        type="button"
                        onClick={() => pauseMedication(medication.id)}
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Pause size={14} /> {tr('pauseMedication', 'Pause')}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => reactivateMedication(medication.id)}
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-emerald-200 px-3 py-2 text-sm text-emerald-800 hover:bg-emerald-50"
                      >
                        <Play size={14} /> {tr('reactivateMedication', 'Reactivate')}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => openEditForm(medication)}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Edit2 size={14} /> {tr('editMedication', 'Edit')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(medication.id, medication.name)}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={14} /> {tr('deleteMedication', 'Delete')}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="flex items-start gap-2 rounded-lg bg-gray-50 px-3 py-3 text-xs leading-5 text-gray-500">
        <AlertCircle size={15} className="mt-0.5 shrink-0" />
        {tr('medicationAcknowledgementDisclaimer', 'Acknowledging a reminder only records that the reminder was acknowledged. It does not confirm that medication was taken.')}
      </p>
    </main>
  )
}
