import { useMemo, type ReactNode } from 'react'
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Heart,
  Pill,
  Share2,
} from 'lucide-react'
import { useCare } from '../../context/CareContext'
import { useLang } from '../../context/LanguageContext'

type Tone = 'blue' | 'green' | 'amber' | 'purple'

function localDateKey(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function StatCard({
  label,
  value,
  caption,
  icon,
  tone,
}: {
  label: string
  value: string | number
  caption: string
  icon: ReactNode
  tone: Tone
}) {
  const styles: Record<Tone, string> = {
    blue: 'border-blue-100 bg-blue-50 text-blue-900',
    green: 'border-emerald-100 bg-emerald-50 text-emerald-900',
    amber: 'border-amber-100 bg-amber-50 text-amber-900',
    purple: 'border-violet-100 bg-violet-50 text-violet-900',
  }
  return (
    <section className={`rounded-2xl border p-4 shadow-sm ${styles[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium opacity-80">{label}</p>
          <p className="mt-1 text-3xl font-bold">{value}</p>
          <p className="mt-1 text-xs opacity-75">{caption}</p>
        </div>
        <span className="rounded-xl bg-white/70 p-2">{icon}</span>
      </div>
    </section>
  )
}

function ProgressRow({
  label,
  detail,
  percent,
  color,
}: {
  label: string
  detail: string
  percent: number
  color: string
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-gray-800">{label}</span>
        <span className="text-gray-500">{detail}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} />
      </div>
    </div>
  )
}

export const CaregiverOverview = () => {
  const { data } = useCare()
  const { lang, isRTL } = useLang()
  const isPersian = lang === 'fa'
  const locale = isPersian ? 'fa-IR' : 'en-US'
  const number = (value: number) => new Intl.NumberFormat(locale).format(value)

  const copy = isPersian
    ? {
        title: 'نمای کلی مراقب',
        subtitle: 'خلاصه‌ای از یادآورهای امروز، فعالیت‌های روزانه و وضعیت‌های به‌اشتراک‌گذاشته‌شده.',
        medicationToday: 'یادآورهای دارویی امروز',
        pendingReminders: 'یادآورهای در انتظار',
        acknowledgedReminders: 'یادآورهای تأییدشده',
        postponedReminders: 'یادآورهای به‌تعویق‌افتاده',
        activities: 'فعالیت‌های برنامه روزانه',
        pendingActivities: 'فعالیت‌های در انتظار',
        completedActivities: 'فعالیت‌های انجام‌شده',
        postponedActivities: 'فعالیت‌های به‌تعویق‌افتاده',
        sharedWellbeing: 'آخرین وضعیت‌های به‌اشتراک‌گذاشته‌شده',
        noMeds: 'امروز یادآور دارویی وجود ندارد.',
        noActivities: 'فعالیتی برای نمایش ثبت نشده است.',
        noShared: 'هنوز وضعیتی با شما به اشتراک گذاشته نشده است.',
        pending: 'در انتظار پاسخ',
        acknowledged: 'یادآور تأیید شده',
        postponed: 'به‌تعویق‌افتاده',
        completed: 'انجام‌شده',
        energy: 'انرژی',
        recorded: 'زمان ثبت',
        reminderResponse: 'وضعیت پاسخ به یادآورها',
        activityProgress: 'پیشرفت فعالیت‌ها',
        responseDetail: 'یادآور تأییدشده از کل یادآورهای امروز',
        activityDetail: 'فعالیت انجام‌شده از کل فعالیت‌های ثبت‌شده',
        reminderDisclaimer: 'تأیید یادآور به معنی مصرف قطعی دارو نیست؛ فقط ثبت پاسخ به یادآور است.',
        privacy: 'فقط اطلاعاتی از حال عمومی نمایش داده می‌شود که سالمند صریحاً به اشتراک گذاشته باشد.',
        smartwatchUnavailable: 'داده‌های ساعت هوشمند هنوز به نمای مراقب همگام نمی‌شوند؛ مقادیر فعلی فقط در صفحه سالمند شبیه‌سازی شده‌اند.',
        medicationFallback: 'دارو',
        noDose: 'بدون توضیح دوز',
        routineNote: 'ساختار فعلی فعالیت‌ها تاریخ جداگانه برای هر تکرار ندارد؛ این بخش وضعیت فهرست فعالیت‌های مشترک موجود را نمایش می‌دهد.',
      }
    : {
        title: 'Caregiver overview',
        subtitle: "A current summary of today's reminders, routine activities, and wellbeing updates shared by the older adult.",
        medicationToday: "Today's medication reminders",
        pendingReminders: 'Reminders awaiting response',
        acknowledgedReminders: 'Reminders acknowledged',
        postponedReminders: 'Reminders postponed',
        activities: 'Routine activities',
        pendingActivities: 'Activities pending',
        completedActivities: 'Activities completed',
        postponedActivities: 'Activities postponed',
        sharedWellbeing: 'Recent shared wellbeing updates',
        noMeds: 'There are no medication reminders scheduled for today.',
        noActivities: 'There are no routine activities to display.',
        noShared: 'No wellbeing updates have been shared with you yet.',
        pending: 'Awaiting response',
        acknowledged: 'Reminder acknowledged',
        postponed: 'Postponed',
        completed: 'Completed',
        energy: 'Energy',
        recorded: 'Recorded',
        reminderResponse: 'Reminder response status',
        activityProgress: 'Routine activity progress',
        responseDetail: 'Acknowledged reminders out of all reminders scheduled today',
        activityDetail: 'Completed activities out of all activities in the current list',
        reminderDisclaimer: 'Acknowledging a reminder does not confirm that medication was taken. It only records a response to the reminder.',
        privacy: 'Only wellbeing information explicitly shared by the older adult is displayed here.',
        smartwatchUnavailable: 'Smartwatch readings are not synchronized to the caregiver view yet; current readings are simulated only on the older adult page.',
        medicationFallback: 'Medication',
        noDose: 'No dosage information',
        routineNote: 'The current activity model does not store a separate date for each recurrence; this section reflects the existing shared activity list.',
      }

  const today = localDateKey()
  const todayInstances = useMemo(
    () => (data.medicationInstances ?? []).filter((instance) => instance.date === today),
    [data.medicationInstances, today],
  )
  const pendingMeds = todayInstances.filter((item) => item.status === 'pending')
  const acknowledgedMeds = todayInstances.filter((item) => item.status === 'acknowledged')
  const postponedMeds = todayInstances.filter((item) => item.status === 'postponed')

  const activities = data.activities ?? []
  const pendingActivities = activities.filter((item) => item.status === 'pending')
  const completedActivities = activities.filter((item) => item.status === 'completed')
  const postponedActivities = activities.filter((item) => item.status === 'postponed')

  const sharedWellbeing = useMemo(
    () => [...(data.wellbeing ?? [])]
      .filter((entry) => entry.shared)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [data.wellbeing],
  )

  const reminderResponsePercent = todayInstances.length
    ? Math.round((acknowledgedMeds.length / todayInstances.length) * 100)
    : 0
  const activityProgressPercent = activities.length
    ? Math.round((completedActivities.length / activities.length) * 100)
    : 0

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    if (Number.isNaN(date.getTime())) return '—'
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
  }

  const medicationName = (medicationId: string) =>
    data.medications.find((medication) => medication.id === medicationId)?.name || copy.medicationFallback

  const medicationStatus = (status: string) =>
    status === 'acknowledged' ? copy.acknowledged : status === 'postponed' ? copy.postponed : copy.pending

  const activityStatus = (status: string) =>
    status === 'completed' ? copy.completed : status === 'postponed' ? copy.postponed : copy.pending

  const statusStyle = (status: string) => {
    if (status === 'acknowledged' || status === 'completed') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
    if (status === 'postponed') return 'border-amber-200 bg-amber-50 text-amber-800'
    return 'border-sky-200 bg-sky-50 text-sky-800'
  }

  return (
    <main dir={isRTL ? 'rtl' : 'ltr'} className="mx-auto w-full max-w-6xl space-y-6 pb-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">{copy.title}</h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-600">{copy.subtitle}</p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-800">
          <CalendarDays className="h-4 w-4" />
          {new Intl.DateTimeFormat(locale, { dateStyle: 'full' }).format(new Date())}
        </span>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={copy.pendingReminders} value={number(pendingMeds.length)} caption={copy.medicationToday} icon={<Clock3 className="h-5 w-5" />} tone="amber" />
        <StatCard label={copy.acknowledgedReminders} value={number(acknowledgedMeds.length)} caption={copy.medicationToday} icon={<CheckCircle2 className="h-5 w-5" />} tone="green" />
        <StatCard label={copy.pendingActivities} value={number(pendingActivities.length)} caption={copy.activities} icon={<Activity className="h-5 w-5" />} tone="blue" />
        <StatCard label={copy.sharedWellbeing} value={number(sharedWellbeing.length)} caption={isPersian ? 'ثبت‌های قابل مشاهده برای مراقب' : 'Entries visible to the caregiver'} icon={<Heart className="h-5 w-5" />} tone="purple" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Pill className="h-5 w-5 text-primary-600" />
            <h2 className="font-semibold text-gray-900">{copy.medicationToday}</h2>
          </div>
          {todayInstances.length === 0 ? (
            <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">{copy.noMeds}</p>
          ) : (
            <div className="space-y-2">
              {[...todayInstances].sort((a, b) => a.time.localeCompare(b.time)).map((instance) => (
                <div key={instance.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gray-50 p-3">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900">{medicationName(instance.medicationId)}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{instance.time}</p>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyle(instance.status)}`}>{medicationStatus(instance.status)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary-600" />
            <h2 className="font-semibold text-gray-900">{copy.activities}</h2>
          </div>
          {activities.length === 0 ? (
            <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">{copy.noActivities}</p>
          ) : (
            <div className="space-y-2">
              {[...activities].sort((a, b) => a.time.localeCompare(b.time)).map((activity) => (
                <div key={activity.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gray-50 p-3">
                  <div className="min-w-0">
                    <p className={`font-medium ${activity.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{activity.name}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{activity.time}</p>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyle(activity.status)}`}>{activityStatus(activity.status)}</span>
                </div>
              ))}
            </div>
          )}
          <p className="mt-3 text-xs leading-5 text-gray-500">{copy.routineNote}</p>
        </section>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary-600" />
          <h2 className="font-semibold text-gray-900">{copy.reminderResponse}</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <ProgressRow
            label={copy.reminderResponse}
            detail={`${number(acknowledgedMeds.length)} / ${number(todayInstances.length)}`}
            percent={reminderResponsePercent}
            color="bg-emerald-500"
          />
          <ProgressRow
            label={copy.activityProgress}
            detail={`${number(completedActivities.length)} / ${number(activities.length)}`}
            percent={activityProgressPercent}
            color="bg-blue-500"
          />
        </div>
        <div className="mt-5 flex flex-wrap gap-3 text-xs text-gray-500">
          <span>{copy.postponedReminders}: {number(postponedMeds.length + postponedActivities.length)}</span>
          <span>{copy.completedActivities}: {number(completedActivities.length)}</span>
          <span>{copy.postponedActivities}: {number(postponedActivities.length)}</span>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
          <Share2 className="h-5 w-5 text-blue-600" />
          <h2 className="font-semibold text-gray-900">{copy.sharedWellbeing}</h2>
          <span className="ms-auto rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800">{number(sharedWellbeing.length)}</span>
        </div>
        {sharedWellbeing.length === 0 ? (
          <p className="px-5 py-8 text-sm text-gray-500">{copy.noShared}</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {sharedWellbeing.slice(0, 6).map((entry) => (
              <article key={entry.id} className="px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-gray-900">{entry.mood}</p>
                  <span className="text-xs text-gray-500">{formatDate(entry.timestamp)}</span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{copy.energy}: {entry.energy ? number(Number(entry.energy)) : '—'}/10</p>
                {entry.note && <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">{entry.note}</p>}
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="space-y-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-950">
        <p>{copy.reminderDisclaimer}</p>
        <p>{copy.privacy}</p>
        <p className="text-xs text-blue-800">{copy.smartwatchUnavailable}</p>
      </div>
    </main>
  )
}
