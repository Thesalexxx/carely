import { useMemo, type ReactNode } from 'react'
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock3,
  Heart,
  Pill,
  Share2,
} from 'lucide-react'
import { useCare } from '../../context/CareContext'
import { useLang } from '../../context/LanguageContext'

type Status = 'pending' | 'acknowledged' | 'postponed' | 'completed'

function localDateKey(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function timeToMinutes(value: string): number {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i)
  if (!match) return Number.MAX_SAFE_INTEGER
  let hours = Number(match[1])
  const minutes = Number(match[2])
  const meridiem = match[3]?.toUpperCase()
  if (meridiem === 'PM' && hours < 12) hours += 12
  if (meridiem === 'AM' && hours === 12) hours = 0
  return hours * 60 + minutes
}

function sortByTime<T extends { time: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))
}

function statusClasses(status: Status): string {
  if (status === 'acknowledged' || status === 'completed') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  }
  if (status === 'postponed') return 'border-amber-200 bg-amber-50 text-amber-800'
  return 'border-sky-200 bg-sky-50 text-sky-800'
}

function StatCard({
  label,
  value,
  detail,
  icon,
  tone,
}: {
  label: string
  value: string | number
  detail: string
  icon: ReactNode
  tone: 'blue' | 'green' | 'amber' | 'purple'
}) {
  const tones = {
    blue: 'border-blue-100 bg-blue-50 text-blue-800',
    green: 'border-emerald-100 bg-emerald-50 text-emerald-800',
    amber: 'border-amber-100 bg-amber-50 text-amber-800',
    purple: 'border-violet-100 bg-violet-50 text-violet-800',
  }
  return (
    <section className={`rounded-2xl border p-4 shadow-sm ${tones[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium opacity-80">{label}</p>
          <p className="mt-1 text-3xl font-bold">{value}</p>
          <p className="mt-1 text-xs opacity-75">{detail}</p>
        </div>
        <span className="rounded-xl bg-white/70 p-2">{icon}</span>
      </div>
    </section>
  )
}

export const CaregiverMonitoring = () => {
  const { data } = useCare()
  const { lang, isRTL } = useLang()
  const isPersian = lang === 'fa'
  const locale = isPersian ? 'fa-IR' : 'en-US'
  const number = (value: number) => new Intl.NumberFormat(locale).format(value)

  const copy = isPersian
    ? {
        title: 'پایش وضعیت',
        subtitle: 'نمایی از یادآورهای دارویی، برنامه روزانه و وضعیت‌هایی که سالمند با شما به اشتراک گذاشته است.',
        pendingMeds: 'یادآورهای در انتظار',
        acknowledgedMeds: 'یادآورهای تأییدشده',
        postponedMeds: 'یادآورهای به‌تعویق‌افتاده',
        pendingActivities: 'فعالیت‌های در انتظار',
        medicationToday: 'یادآورهای دارویی امروز',
        routines: 'وضعیت برنامه روزانه',
        postponed: 'موارد به‌تعویق‌افتاده',
        sharedWellbeing: 'وضعیت‌های به‌اشتراک‌گذاشته‌شده',
        noMeds: 'برای امروز یادآور دارویی ثبت نشده است.',
        noActivities: 'فعالیتی برای نمایش وجود ندارد.',
        noPostponed: 'موردی به تعویق نیفتاده است.',
        noShared: 'هنوز وضعیت عمومی‌ای با شما به اشتراک گذاشته نشده است.',
        pending: 'در انتظار پاسخ',
        acknowledged: 'یادآور تأیید شد',
        completed: 'انجام‌شده',
        postponedStatus: 'به‌تعویق‌افتاده',
        time: 'زمان',
        energy: 'انرژی',
        reminderDisclaimer: 'تأیید یادآور فقط نشان می‌دهد که پیام یادآور دیده یا تأیید شده است؛ این وضعیت به معنی مصرف قطعی دارو نیست.',
        privacy: 'در این صفحه فقط وضعیت‌هایی نمایش داده می‌شوند که سالمند صریحاً با مراقب به اشتراک گذاشته است.',
        smartwatchUnavailable: 'داده‌های ساعت هوشمند هنوز به نمای مراقب متصل نیستند. مقادیر نمایشی فعلاً فقط در صفحه سالمند شبیه‌سازی می‌شوند.',
        medicationFallback: 'دارو',
        shared: 'به‌اشتراک‌گذاشته‌شده',
        private: 'خصوصی',
        recorded: 'زمان ثبت',
      }
    : {
        title: 'Monitoring',
        subtitle: 'An overview of medication reminders, daily activities, and information the older adult has chosen to share.',
        pendingMeds: 'Reminders awaiting response',
        acknowledgedMeds: 'Reminders acknowledged',
        postponedMeds: 'Reminders postponed',
        pendingActivities: 'Activities pending',
        medicationToday: "Today's medication reminders",
        routines: 'Daily routine status',
        postponed: 'Postponed items',
        sharedWellbeing: 'Shared wellbeing updates',
        noMeds: 'No medication reminders scheduled for today.',
        noActivities: 'There are no activities to display.',
        noPostponed: 'Nothing has been postponed.',
        noShared: 'No wellbeing updates have been shared with you yet.',
        pending: 'Awaiting response',
        acknowledged: 'Reminder acknowledged',
        completed: 'Completed',
        postponedStatus: 'Postponed',
        time: 'Time',
        energy: 'Energy',
        reminderDisclaimer: 'Acknowledging a reminder only records that the reminder was seen or acknowledged. It does not confirm that medication was taken.',
        privacy: 'This page only shows wellbeing updates the older adult has explicitly chosen to share.',
        smartwatchUnavailable: 'Smartwatch readings are not connected to the caregiver view yet. The current readings are simulated only on the older adult page.',
        medicationFallback: 'Medication',
        shared: 'Shared',
        private: 'Private',
        recorded: 'Recorded',
      }

  const today = localDateKey()
  const todayInstances = useMemo(
    () => sortByTime((data.medicationInstances ?? []).filter((item) => item.date === today)),
    [data.medicationInstances, today],
  )
  const activities = useMemo(() => sortByTime(data.activities ?? []), [data.activities])
  const sharedWellbeing = useMemo(
    () => [...(data.wellbeing ?? [])]
      .filter((entry) => entry.shared)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [data.wellbeing],
  )

  const pendingMeds = todayInstances.filter((item) => item.status === 'pending')
  const acknowledgedMeds = todayInstances.filter((item) => item.status === 'acknowledged')
  const postponedMeds = todayInstances.filter((item) => item.status === 'postponed')
  const pendingActivities = activities.filter((item) => item.status === 'pending')
  const postponedActivities = activities.filter((item) => item.status === 'postponed')

  const postponedItems = [
    ...postponedMeds.map((item) => {
      const medication = data.medications.find((med) => med.id === item.medicationId)
      return { id: item.id, name: medication?.name || copy.medicationFallback, time: item.time, kind: 'medication' as const }
    }),
    ...postponedActivities.map((item) => ({ id: item.id, name: item.name, time: item.time, kind: 'activity' as const })),
  ].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    if (Number.isNaN(date.getTime())) return '—'
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
  }

  const activityStatusLabel = (status: string) =>
    status === 'completed' ? copy.completed : status === 'postponed' ? copy.postponedStatus : copy.pending

  const medicationStatusLabel = (status: string) =>
    status === 'acknowledged' ? copy.acknowledged : status === 'postponed' ? copy.postponedStatus : copy.pending

  return (
    <main dir={isRTL ? 'rtl' : 'ltr'} className="mx-auto w-full max-w-6xl space-y-6 pb-8">
      <header>
        <h1 className="text-3xl font-heading font-bold text-gray-900">{copy.title}</h1>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-600">{copy.subtitle}</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={copy.pendingMeds} value={number(pendingMeds.length)} detail={copy.medicationToday} icon={<Clock3 className="h-5 w-5" />} tone="blue" />
        <StatCard label={copy.acknowledgedMeds} value={number(acknowledgedMeds.length)} detail={copy.medicationToday} icon={<CheckCircle2 className="h-5 w-5" />} tone="green" />
        <StatCard label={copy.postponedMeds} value={number(postponedMeds.length)} detail={copy.medicationToday} icon={<AlertCircle className="h-5 w-5" />} tone="amber" />
        <StatCard label={copy.pendingActivities} value={number(pendingActivities.length)} detail={copy.routines} icon={<Activity className="h-5 w-5" />} tone="purple" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
            <Pill className="h-5 w-5 text-primary-600" />
            <h2 className="font-semibold text-gray-900">{copy.medicationToday}</h2>
            <span className="ms-auto rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">{number(todayInstances.length)}</span>
          </div>
          {todayInstances.length === 0 ? (
            <p className="px-5 py-8 text-sm text-gray-500">{copy.noMeds}</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {todayInstances.map((instance) => {
                const medication = data.medications.find((item) => item.id === instance.medicationId)
                return (
                  <li key={instance.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900">{medication?.name || copy.medicationFallback}</p>
                      {medication?.dosage && <p className="mt-0.5 text-xs text-gray-500">{medication.dosage}</p>}
                      <p className="mt-1 flex items-center gap-1 text-xs text-gray-500"><Clock3 className="h-3.5 w-3.5" />{instance.time}</p>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusClasses(instance.status)}`}>
                      {medicationStatusLabel(instance.status)}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
            <Activity className="h-5 w-5 text-primary-600" />
            <h2 className="font-semibold text-gray-900">{copy.routines}</h2>
            <span className="ms-auto rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">{number(activities.length)}</span>
          </div>
          {activities.length === 0 ? (
            <p className="px-5 py-8 text-sm text-gray-500">{copy.noActivities}</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {activities.map((activity) => (
                <li key={activity.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <div className="min-w-0">
                    <p className={`font-medium ${activity.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{activity.name}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-gray-500"><Clock3 className="h-3.5 w-3.5" />{activity.time}</p>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusClasses(activity.status)}`}>
                    {activityStatusLabel(activity.status)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <h2 className="font-semibold text-gray-900">{copy.postponed}</h2>
            <span className="ms-auto rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">{number(postponedItems.length)}</span>
          </div>
          {postponedItems.length === 0 ? (
            <p className="px-5 py-8 text-sm text-gray-500">{copy.noPostponed}</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {postponedItems.map((item) => (
                <li key={`${item.kind}-${item.id}`} className="flex items-center justify-between gap-3 px-5 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="mt-1 text-xs text-gray-500">{item.time} · {item.kind === 'medication' ? copy.medicationToday : copy.routines}</p>
                  </div>
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">{copy.postponedStatus}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
            <Heart className="h-5 w-5 text-rose-600" />
            <h2 className="font-semibold text-gray-900">{copy.sharedWellbeing}</h2>
            <span className="ms-auto rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-800">{number(sharedWellbeing.length)}</span>
          </div>
          {sharedWellbeing.length === 0 ? (
            <p className="px-5 py-8 text-sm text-gray-500">{copy.noShared}</p>
          ) : (
            <div className="max-h-[28rem] divide-y divide-gray-100 overflow-y-auto">
              {sharedWellbeing.slice(0, 8).map((entry) => (
                <article key={entry.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-semibold text-gray-900">{entry.mood}</p>
                    <span className="text-xs text-gray-500">{formatDate(entry.timestamp)}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{copy.energy}: {entry.energy ? number(Number(entry.energy)) : '—'}/10</p>
                  {entry.note && <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">{entry.note}</p>}
                  <span className="mt-2 inline-flex items-center gap-1 text-xs text-blue-700"><Share2 className="h-3 w-3" />{copy.shared}</span>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="space-y-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-950">
        <p>{copy.reminderDisclaimer}</p>
        <p>{copy.privacy}</p>
        <p className="text-xs text-blue-800">{copy.smartwatchUnavailable}</p>
      </div>
    </main>
  )
}
