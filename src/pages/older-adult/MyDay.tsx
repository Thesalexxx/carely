import { useMemo } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Pill,
  RotateCcw,
} from 'lucide-react'
import { useCare } from '../../context/CareContext'
import { useLang } from '../../context/LanguageContext'

type ActivityStatus = 'pending' | 'completed' | 'postponed'

function localDateKey(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function normalizeActivityStatus(status?: string): ActivityStatus {
  if (status === 'completed' || status === 'postponed') return status
  return 'pending'
}

export const OlderAdultDashboard = () => {
  const {
    data,
    acknowledgeMedication,
    postponeMedication,
    completeActivity,
    postponeActivity,
  } = useCare()
  const { lang, isRTL } = useLang()
  const isPersian = lang === 'fa'
  const locale = isPersian ? 'fa-IR' : 'en-US'

  const copy = {
    en: {
      title: 'My Day',
      date: 'Today',
      medicationsAwaiting: 'Medication reminders awaiting response',
      completedToday: 'Completed today',
      routinesToday: "Today's activities",
      alerts: 'Needs attention',
      medications: "Today's medication reminders",
      routine: "Today's routine",
      noMedication: 'No medication reminders today.',
      noActivity: 'No activities in your routine yet.',
      medicationFallback: 'Medication',
      pending: 'Awaiting response',
      acknowledged: 'Reminder acknowledged',
      medicationPostponed: 'Reminder postponed',
      activityPending: 'To do',
      activityCompleted: 'Completed',
      activityPostponed: 'Postponed',
      acknowledge: 'Acknowledge',
      postpone: 'Postpone',
      complete: 'Mark complete',
      allDone: 'All caught up. There are no activities needing attention.',
      sharedState: 'Your activity status is shared between My Day and Routine on this device.',
    },
    fa: {
      title: 'روز من',
      date: 'امروز',
      medicationsAwaiting: 'یادآورهای دارویی در انتظار پاسخ',
      completedToday: 'انجام‌شده امروز',
      routinesToday: 'فعالیت‌های امروز',
      alerts: 'نیازمند توجه',
      medications: 'یادآورهای دارویی امروز',
      routine: 'برنامه امروز',
      noMedication: 'امروز یادآور دارویی ندارید.',
      noActivity: 'هنوز فعالیتی در برنامه شما نیست.',
      medicationFallback: 'دارو',
      pending: 'در انتظار پاسخ',
      acknowledged: 'دریافت یادآور تأیید شد',
      medicationPostponed: 'یادآور به تعویق افتاد',
      activityPending: 'در انتظار انجام',
      activityCompleted: 'انجام‌شده',
      activityPostponed: 'به تعویق افتاده',
      acknowledge: 'تأیید دریافت یادآور',
      postpone: 'به تعویق انداختن',
      complete: 'علامت‌گذاری به‌عنوان انجام‌شده',
      allDone: 'همه کارها به‌روز هستند. فعالیتی برای پیگیری باقی نمانده است.',
      sharedState: 'وضعیت فعالیت‌ها در صفحه‌های «روز من» و «برنامه روزانه» در همین دستگاه مشترک است.',
    },
  }[lang]

  const today = localDateKey()
  const activities = Array.isArray(data?.activities) ? data.activities : []
  const medications = Array.isArray(data?.medications) ? data.medications : []
  const medicationInstances = Array.isArray(data?.medicationInstances) ? data.medicationInstances : []

  const todaysMedicationInstances = useMemo(
    () => medicationInstances
      .filter((instance) => instance.date === today)
      .sort((a, b) => String(a.time).localeCompare(String(b.time))),
    [medicationInstances, today],
  )

  const activityCounts = useMemo(() => {
    const completed = activities.filter((activity) => normalizeActivityStatus(activity.status) === 'completed').length
    const postponed = activities.filter((activity) => normalizeActivityStatus(activity.status) === 'postponed').length
    const pending = activities.length - completed - postponed
    return { completed, postponed, pending, total: activities.length }
  }, [activities])

  const pendingMedicationCount = todaysMedicationInstances.filter((instance) => instance.status === 'pending').length
  const acknowledgedMedicationCount = todaysMedicationInstances.filter((instance) => instance.status === 'acknowledged').length
  const completedToday = activityCounts.completed + acknowledgedMedicationCount
  const alertsCount = pendingMedicationCount + activityCounts.pending

  const todayLabel = new Intl.DateTimeFormat(locale, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  }).format(new Date())

  const activityStatusLabel = (status: ActivityStatus) => {
    if (status === 'completed') return copy.activityCompleted
    if (status === 'postponed') return copy.activityPostponed
    return copy.activityPending
  }

  const medicationStatusLabel = (status: string) => {
    if (status === 'acknowledged') return copy.acknowledged
    if (status === 'postponed') return copy.medicationPostponed
    return copy.pending
  }

  return (
    <main dir={isRTL ? 'rtl' : 'ltr'} className="mx-auto w-full max-w-6xl space-y-6 pb-8">
      <header>
        <p className="text-sm font-medium text-primary-700">{copy.date} · {todayLabel}</p>
        <h1 className="mt-1 text-3xl font-heading font-bold text-gray-900">{copy.title}</h1>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
          <div className="flex items-center justify-between"><p className="text-sm font-medium text-sky-800">{copy.medicationsAwaiting}</p><Pill className="h-6 w-6 text-sky-600" /></div>
          <p className="mt-2 text-3xl font-bold tabular-nums text-sky-950">{pendingMedicationCount}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <div className="flex items-center justify-between"><p className="text-sm font-medium text-emerald-800">{copy.completedToday}</p><CheckCircle2 className="h-6 w-6 text-emerald-600" /></div>
          <p className="mt-2 text-3xl font-bold tabular-nums text-emerald-950">{completedToday}</p>
        </div>
        <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
          <div className="flex items-center justify-between"><p className="text-sm font-medium text-violet-800">{copy.routinesToday}</p><Clock3 className="h-6 w-6 text-violet-600" /></div>
          <p className="mt-2 text-3xl font-bold tabular-nums text-violet-950">{activities.length}</p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <div className="flex items-center justify-between"><p className="text-sm font-medium text-amber-800">{copy.alerts}</p><AlertTriangle className="h-6 w-6 text-amber-600" /></div>
          <p className="mt-2 text-3xl font-bold tabular-nums text-amber-950">{alertsCount}</p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-4"><h2 className="font-semibold text-gray-900">{copy.medications}</h2></div>
          {todaysMedicationInstances.length === 0 ? (
            <p className="p-5 text-sm text-gray-500">{copy.noMedication}</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {todaysMedicationInstances.map((instance) => {
                const medication = medications.find((item) => item.id === instance.medicationId)
                return (
                  <li key={instance.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-700"><Pill className="h-4 w-4" /></div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">{medication?.name || copy.medicationFallback}</p>
                        <p className="mt-0.5 text-sm text-gray-500">{instance.time}</p>
                        <p className="mt-1 text-xs text-gray-500">{medicationStatusLabel(instance.status)}</p>
                      </div>
                    </div>
                    {instance.status === 'pending' && (
                      <div className="flex gap-2">
                        <button type="button" onClick={() => acknowledgeMedication(instance.id)} className="min-h-9 rounded-lg border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-50">{copy.acknowledge}</button>
                        <button type="button" onClick={() => postponeMedication(instance.id)} className="min-h-9 rounded-lg border border-amber-200 px-3 py-2 text-sm font-medium text-amber-800 hover:bg-amber-50">{copy.postpone}</button>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 p-4">
            <div><h2 className="font-semibold text-gray-900">{copy.routine}</h2><p className="mt-1 text-xs text-gray-500">{activityCounts.completed}/{activityCounts.total} {copy.activityCompleted.toLowerCase()}</p></div>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">{activityCounts.pending} {copy.activityPending}</span>
          </div>
          {activities.length === 0 ? (
            <p className="p-5 text-sm text-gray-500">{copy.noActivity}</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {[...activities].sort((a, b) => String(a.time ?? '').localeCompare(String(b.time ?? ''))).map((activity) => {
                const status = normalizeActivityStatus(activity.status)
                return (
                  <li key={activity.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className={`font-medium ${status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{activity.name}</p>
                      <div className="mt-1 flex items-center gap-2 text-sm text-gray-500"><Clock3 className="h-3.5 w-3.5" />{activity.time || '—'}<span>·</span><span>{activityStatusLabel(status)}</span></div>
                    </div>
                    {status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                    ) : status === 'postponed' ? (
                      <span className="inline-flex items-center gap-1 text-sm text-amber-700"><RotateCcw className="h-4 w-4" />{copy.activityPostponed}</span>
                    ) : (
                      <div className="flex gap-2">
                        <button type="button" onClick={() => completeActivity(activity.id)} className="min-h-9 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700">{copy.complete}</button>
                        <button type="button" onClick={() => postponeActivity(activity.id)} className="min-h-9 rounded-lg border border-amber-200 px-3 py-2 text-sm font-medium text-amber-800 hover:bg-amber-50">{copy.postpone}</button>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>

      {alertsCount === 0 && <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{copy.allDone}</p>}
      <p className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">{copy.sharedState}</p>
    </main>
  )
}
