import { useMemo, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Clock3,
  ListFilter,
  RotateCcw,
} from 'lucide-react'
import { useCare } from '../../context/CareContext'
import { useLang } from '../../context/LanguageContext'

type ActivityFilter = 'all' | 'pending' | 'completed' | 'postponed'

type ActivityStatus = 'pending' | 'completed' | 'postponed'

function formatLocalTime(value?: string, locale = 'en-US'): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(date)
}

function normalizeStatus(status?: string): ActivityStatus {
  if (status === 'completed' || status === 'postponed') return status
  return 'pending'
}

export const OlderAdultRoutine = () => {
  const { data, completeActivity, postponeActivity } = useCare()
  const { lang, isRTL } = useLang()
  const isPersian = lang === 'fa'

  const copy = {
    en: {
      title: 'Daily routine',
      subtitle: 'A clear view of the activities in your routine.',
      today: 'Today',
      overview: 'Your progress',
      total: 'Scheduled',
      completed: 'Completed',
      pending: 'To do',
      postponed: 'Postponed',
      schedule: "Today's activities",
      filter: 'Show',
      all: 'All',
      noActivities: 'No activities in your routine yet',
      noActivitiesHint: 'Activities added to your routine will appear here.',
      noFiltered: 'No activities match this filter.',
      complete: 'Mark complete',
      postpone: 'Postpone',
      completedAt: 'Completed at',
      postponedAt: 'Postponed at',
      noTime: 'Time not set',
      progressText: '{done} of {total} completed',
      sharedState: 'Your Routine and My Day use the same activity list. Changes here appear in My Day automatically.',
    },
    fa: {
      title: 'برنامه روزانه',
      subtitle: 'نمایی روشن از فعالیت‌های برنامه روزانه شما.',
      today: 'امروز',
      overview: 'پیشرفت شما',
      total: 'برنامه‌ریزی‌شده',
      completed: 'انجام‌شده',
      pending: 'در انتظار انجام',
      postponed: 'به تعویق افتاده',
      schedule: 'فعالیت‌های امروز',
      filter: 'نمایش',
      all: 'همه',
      noActivities: 'هنوز فعالیتی در برنامه شما نیست',
      noActivitiesHint: 'فعالیت‌هایی که به برنامه روزانه اضافه شوند، اینجا نمایش داده می‌شوند.',
      noFiltered: 'فعالیتی با این فیلتر پیدا نشد.',
      complete: 'علامت‌گذاری به‌عنوان انجام‌شده',
      postpone: 'به تعویق انداختن',
      completedAt: 'زمان انجام',
      postponedAt: 'زمان تعویق',
      noTime: 'زمان مشخص نشده',
      progressText: '{done} مورد از {total} مورد انجام شده است',
      sharedState: 'صفحه‌های «برنامه روزانه» و «روز من» از یک فهرست فعالیت استفاده می‌کنند. تغییرات اینجا به‌طور خودکار در صفحه «روز من» دیده می‌شود.',
    },
  }[lang]

  const locale = isPersian ? 'fa-IR' : 'en-US'
  const activities = Array.isArray(data?.activities) ? data.activities : []
  const [filter, setFilter] = useState<ActivityFilter>('all')

  const counts = useMemo(() => {
    const completed = activities.filter((activity) => normalizeStatus(activity.status) === 'completed').length
    const postponed = activities.filter((activity) => normalizeStatus(activity.status) === 'postponed').length
    const pending = activities.length - completed - postponed
    return { completed, postponed, pending, total: activities.length }
  }, [activities])

  const progress = counts.total ? Math.round((counts.completed / counts.total) * 100) : 0

  const visibleActivities = useMemo(() => {
    return [...activities]
      .filter((activity) => filter === 'all' || normalizeStatus(activity.status) === filter)
      .sort((a, b) => String(a.time ?? '').localeCompare(String(b.time ?? '')))
  }, [activities, filter])

  const todayLabel = new Intl.DateTimeFormat(locale, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  }).format(new Date())

  const filters: { value: ActivityFilter; label: string; count: number }[] = [
    { value: 'all', label: copy.all, count: counts.total },
    { value: 'pending', label: copy.pending, count: counts.pending },
    { value: 'completed', label: copy.completed, count: counts.completed },
    { value: 'postponed', label: copy.postponed, count: counts.postponed },
  ]

  const statusLabel = (status: ActivityStatus) =>
    status === 'completed' ? copy.completed : status === 'postponed' ? copy.postponed : copy.pending

  const statusClass = (status: ActivityStatus) =>
    status === 'completed'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : status === 'postponed'
        ? 'border-amber-200 bg-amber-50 text-amber-800'
        : 'border-sky-200 bg-sky-50 text-sky-800'

  return (
    <main dir={isRTL ? 'rtl' : 'ltr'} className="mx-auto w-full max-w-5xl space-y-6 pb-8">
      <header>
        <p className="text-sm font-medium text-primary-700">{copy.today} · {todayLabel}</p>
        <h1 className="mt-1 text-3xl font-heading font-bold text-gray-900">{copy.title}</h1>
        <p className="mt-1 text-sm text-gray-600">{copy.subtitle}</p>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{copy.overview}</h2>
            <p className="mt-1 text-sm text-gray-500">{copy.progressText.replace('{done}', String(counts.completed)).replace('{total}', String(counts.total))}</p>
          </div>
          <span className="text-3xl font-bold tabular-nums text-gray-900">{progress}%</span>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-100" role="progressbar" aria-label={copy.overview} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
          <div className="h-full rounded-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-4">
          <div className="rounded-xl bg-emerald-50 p-3">
            <div className="flex items-center gap-2 text-emerald-700"><CheckCircle2 className="h-4 w-4" /><span className="text-xs font-medium sm:text-sm">{copy.completed}</span></div>
            <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-900">{counts.completed}</p>
          </div>
          <div className="rounded-xl bg-sky-50 p-3">
            <div className="flex items-center gap-2 text-sky-700"><Circle className="h-4 w-4" /><span className="text-xs font-medium sm:text-sm">{copy.pending}</span></div>
            <p className="mt-1 text-2xl font-bold tabular-nums text-sky-900">{counts.pending}</p>
          </div>
          <div className="rounded-xl bg-amber-50 p-3">
            <div className="flex items-center gap-2 text-amber-700"><AlertCircle className="h-4 w-4" /><span className="text-xs font-medium sm:text-sm">{copy.postponed}</span></div>
            <p className="mt-1 text-2xl font-bold tabular-nums text-amber-900">{counts.postponed}</p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{copy.schedule}</h2>
              <p className="mt-1 text-sm text-gray-500">{todayLabel}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500"><ListFilter className="h-4 w-4" /><span>{copy.filter}</span></div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={copy.filter}>
            {filters.map((item) => (
              <button key={item.value} type="button" aria-pressed={filter === item.value} onClick={() => setFilter(item.value)}
                className={`inline-flex min-h-9 items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition ${filter === item.value ? 'border-primary-300 bg-primary-50 text-primary-800' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}>
                {item.label}<span className="rounded-full bg-black/5 px-1.5 py-0.5 text-xs tabular-nums">{item.count}</span>
              </button>
            ))}
          </div>
        </div>

        {activities.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500"><Clock3 className="h-5 w-5" /></div>
            <h3 className="mt-3 font-semibold text-gray-900">{copy.noActivities}</h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">{copy.noActivitiesHint}</p>
          </div>
        ) : visibleActivities.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-gray-500">{copy.noFiltered}</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {visibleActivities.map((activity) => {
              const status = normalizeStatus(activity.status)
              const completedAt = formatLocalTime(activity.completedAt, locale)
              const postponedAt = formatLocalTime(activity.postponedAt, locale)
              return (
                <li key={activity.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${status === 'completed' ? 'bg-emerald-100 text-emerald-700' : status === 'postponed' ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'}`}>
                      {status === 'completed' ? <CheckCircle2 className="h-5 w-5" /> : status === 'postponed' ? <RotateCcw className="h-5 w-5" /> : <Clock3 className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className={`font-semibold ${status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{activity.name}</h3>
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${statusClass(status)}`}>{statusLabel(status)}</span>
                      </div>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500"><Clock3 className="h-3.5 w-3.5" />{activity.time || (isPersian ? 'زمان مشخص نشده' : 'Time not set')}</p>
                      {completedAt && status === 'completed' && <p className="mt-1 text-xs text-emerald-700">{copy.completedAt}: {completedAt}</p>}
                      {postponedAt && status === 'postponed' && <p className="mt-1 text-xs text-amber-700">{copy.postponedAt}: {postponedAt}</p>}
                    </div>
                  </div>
                  {status === 'pending' && (
                    <div className="flex shrink-0 gap-2 sm:ps-3">
                      <button type="button" onClick={() => completeActivity(activity.id)} className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 sm:flex-none">
                        <CheckCircle2 className="h-4 w-4" />{copy.complete}
                      </button>
                      <button type="button" onClick={() => postponeActivity(activity.id)} className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 sm:flex-none">
                        <RotateCcw className="h-4 w-4" />{copy.postpone}
                      </button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <p className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">{copy.sharedState}</p>
    </main>
  )
}
