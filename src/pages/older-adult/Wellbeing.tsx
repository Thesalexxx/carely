import { cloneElement, useMemo, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { ActivityCalendar } from 'react-activity-calendar'
import 'react-activity-calendar/tooltips.css'
import { Battery, CalendarDays, Heart, Lock, Share2, Smile } from 'lucide-react'
import { useCare } from '../../context/CareContext'
import { useLang } from '../../context/LanguageContext'

type Mood = 'Good' | 'Okay' | 'Poor'
type Energy = '10' | '5' | '2'

type WellbeingEntry = {
  id: string
  mood: string
  energy?: string
  note?: string
  shared: boolean
  timestamp: string
}

const MOOD_LEVEL: Record<string, number> = {
  good: 3,
  happy: 3,
  okay: 2,
  neutral: 2,
  poor: 1,
  bad: 1,
}

const localDateKey = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const dateKeyFromTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp)
  return Number.isNaN(date.getTime()) ? '' : localDateKey(date)
}

export const OlderAdultWellbeing = () => {
  const { data, submitWellbeing, shareWellbeing, unshareWellbeing } = useCare()
  const { lang, isRTL } = useLang()
  const isPersian = lang === 'fa'

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [shareWithCaregiver, setShareWithCaregiver] = useState(false)
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null)
  const [selectedEnergy, setSelectedEnergy] = useState<Energy | null>(null)
  const [note, setNote] = useState('')
  const [formError, setFormError] = useState('')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const copy = {
    en: {
      title: 'Wellbeing',
      subtitle: 'A simple way to record how you feel.',
      newCheckIn: 'New check-in',
      chooseMood: 'How are you feeling today?',
      chooseEnergy: 'How is your energy?',
      good: 'Good',
      okay: 'Okay',
      poor: 'Poor',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      note: 'Note (optional)',
      notePlaceholder: 'Add a note about your day...',
      shareLabel: 'Share this check-in with my caregiver',
      privacy: 'Your check-ins are private unless you choose to share them.',
      save: 'Save check-in',
      saving: 'Saving…',
      cancelSelection: 'Clear selection',
      history: 'Mood history',
      historyHint: 'Select a day to see its entries. The calendar shows the latest mood recorded on each day.',
      noHistory: 'No mood entries yet. Your saved check-ins will appear here.',
      privateEntries: 'Private entries',
      sharedEntries: 'Shared with caregiver',
      private: 'Private',
      shared: 'Shared',
      share: 'Share',
      unshare: 'Make private',
      entries: 'Entries',
      sharedCount: 'Shared entries',
      latestMood: 'Latest mood',
      noMood: 'No entry',
      dayDetails: 'Selected day',
      noEntryForDay: 'There is no mood entry for this day.',
      noNote: 'No note',
      energy: 'Energy',
      recordedAt: 'Recorded',
      errorRequired: 'Choose a mood and energy level before saving.',
      errorSave: 'The check-in could not be saved. Please try again.',
      poorLegend: 'Poor',
      okayLegend: 'Okay',
      goodLegend: 'Good',
      noEntryLegend: 'No entry',
      trackedDays: '{{count}} days tracked in {{year}}',
    },
    fa: {
      title: 'حال عمومی',
      subtitle: 'احساس و حال روزانه‌تان را به‌سادگی ثبت کنید.',
      newCheckIn: 'ثبت وضعیت جدید',
      chooseMood: 'امروز چه احساسی دارید؟',
      chooseEnergy: 'میزان انرژی شما چقدر است؟',
      good: 'خوب',
      okay: 'معمولی',
      poor: 'نامساعد',
      high: 'زیاد',
      medium: 'متوسط',
      low: 'کم',
      note: 'یادداشت (اختیاری)',
      notePlaceholder: 'چیزی درباره امروزتان بنویسید…',
      shareLabel: 'این ثبت وضعیت را با مراقبم به اشتراک بگذار',
      privacy: 'ثبت‌های شما خصوصی هستند، مگر اینکه خودتان آن‌ها را به اشتراک بگذارید.',
      save: 'ذخیره وضعیت',
      saving: 'در حال ذخیره…',
      cancelSelection: 'پاک کردن انتخاب',
      history: 'تاریخچه حال روحی',
      historyHint: 'برای دیدن ثبت‌های هر روز، آن روز را انتخاب کنید. رنگ تقویم آخرین حال ثبت‌شده در هر روز را نشان می‌دهد.',
      noHistory: 'هنوز وضعیتی ثبت نشده است. ثبت‌های شما در این قسمت نمایش داده می‌شوند.',
      privateEntries: 'ثبت‌های خصوصی',
      sharedEntries: 'به‌اشتراک‌گذاشته‌شده با مراقب',
      private: 'خصوصی',
      shared: 'به‌اشتراک‌گذاشته‌شده',
      share: 'اشتراک‌گذاری',
      unshare: 'خصوصی کردن',
      entries: 'تعداد ثبت‌ها',
      sharedCount: 'ثبت‌های مشترک',
      latestMood: 'آخرین وضعیت',
      noMood: 'بدون ثبت',
      dayDetails: 'روز انتخاب‌شده',
      noEntryForDay: 'برای این روز وضعیتی ثبت نشده است.',
      noNote: 'بدون یادداشت',
      energy: 'انرژی',
      recordedAt: 'زمان ثبت',
      errorRequired: 'پیش از ذخیره، حال روحی و میزان انرژی را انتخاب کنید.',
      errorSave: 'ذخیره وضعیت انجام نشد. دوباره تلاش کنید.',
      poorLegend: 'نامساعد',
      okayLegend: 'معمولی',
      goodLegend: 'خوب',
      noEntryLegend: 'بدون ثبت',
      trackedDays: '{{count}} روز ثبت‌شده در سال {{year}}',
    },
  }[lang]

  const entries = useMemo(
    () => ([...(data.wellbeing ?? [])] as WellbeingEntry[]).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    ),
    [data.wellbeing],
  )

  const privateEntries = entries.filter((entry) => !entry.shared)
  const sharedEntries = entries.filter((entry) => entry.shared)
  const latestEntry = entries[0]

  const latestEntryByDay = useMemo(() => {
    const byDay = new Map<string, WellbeingEntry>()
    for (const entry of [...entries].reverse()) {
      const key = dateKeyFromTimestamp(entry.timestamp)
      if (key) byDay.set(key, entry)
    }
    return byDay
  }, [entries])

  // react-activity-calendar is a prebuilt, MIT-licensed calendar heatmap.
  // Give it a complete rolling year so days without a check-in are visible too.
  const calendarData = useMemo(() => {
    const end = new Date()
    end.setHours(12, 0, 0, 0)
    const start = new Date(end)
    start.setDate(start.getDate() - 364)

    return Array.from({ length: 365 }, (_, index) => {
      const day = new Date(start)
      day.setDate(start.getDate() + index)
      const date = localDateKey(day)
      const entry = latestEntryByDay.get(date)
      const moodKey = entry?.mood.trim().toLowerCase() ?? ''

      return {
        date,
        count: entry ? 1 : 0,
        level: entry ? (MOOD_LEVEL[moodKey] ?? 2) : 0,
      }
    })
  }, [latestEntryByDay])

  const moodLabel = (mood: string): string => {
    const normalized = mood.trim().toLowerCase()
    if (normalized === 'good' || normalized === 'happy') return copy.good
    if (normalized === 'okay' || normalized === 'neutral') return copy.okay
    if (normalized === 'poor' || normalized === 'bad') return copy.poor
    return mood
  }

  const energyLabel = (energy?: string): string => {
    if (energy === '10') return copy.high
    if (energy === '5') return copy.medium
    if (energy === '2') return copy.low
    return energy || '—'
  }

  const formatDate = (date: Date): string =>
    new Intl.DateTimeFormat(isPersian ? 'fa-IR' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date)

  const formatCalendarDate = (dateKey: string): string => {
    const [year, month, day] = dateKey.split('-').map(Number)
    return new Intl.DateTimeFormat(isPersian ? 'fa-IR' : 'en-US', {
      dateStyle: 'full',
    }).format(new Date(year, month - 1, day, 12))
  }

  const moodForLevel = (level: number): string => {
    if (level === 1) return copy.poorLegend
    if (level === 2) return copy.okayLegend
    if (level === 3) return copy.goodLegend
    return copy.noEntryLegend
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError('')

    if (!selectedMood || !selectedEnergy) {
      setFormError(copy.errorRequired)
      return
    }

    setIsSubmitting(true)
    try {
      await Promise.resolve(
        submitWellbeing({
          mood: selectedMood,
          energy: selectedEnergy,
          note: note.trim() || undefined,
          shared: shareWithCaregiver,
        }),
      )
      setSelectedMood(null)
      setSelectedEnergy(null)
      setNote('')
      setShareWithCaregiver(false)
      setSelectedDate(localDateKey(new Date()))
    } catch {
      setFormError(copy.errorSave)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedDayEntries = selectedDate
    ? entries.filter((entry) => dateKeyFromTimestamp(entry.timestamp) === selectedDate)
    : []

  const calendarLabels = isPersian
    ? {
        months: ['ژانویه', 'فوریه', 'مارس', 'آوریل', 'مه', 'ژوئن', 'ژوئیه', 'اوت', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'],
        weekdays: ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'],
        totalCount: copy.trackedDays,
        legend: { less: copy.noEntryLegend, more: copy.goodLegend },
      }
    : {
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        totalCount: copy.trackedDays,
        legend: { less: copy.noEntryLegend, more: copy.goodLegend },
      }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <header>
        <h1 className="text-3xl font-heading font-bold text-gray-900">{copy.title}</h1>
        <p className="mt-1 text-sm text-gray-600">{copy.subtitle}</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-rose-50 p-2 text-rose-600"><Heart className="h-5 w-5" /></div>
            <div>
              <p className="text-sm text-gray-500">{copy.entries}</p>
              <p className="text-2xl font-semibold text-gray-900">{entries.length}</p>
            </div>
          </div>
        </section>
        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600"><Smile className="h-5 w-5" /></div>
            <div className="min-w-0">
              <p className="text-sm text-gray-500">{copy.latestMood}</p>
              <p className="truncate text-xl font-semibold text-gray-900">{latestEntry ? moodLabel(latestEntry.mood) : '—'}</p>
            </div>
          </div>
        </section>
        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600"><Share2 className="h-5 w-5" /></div>
            <div>
              <p className="text-sm text-gray-500">{copy.sharedCount}</p>
              <p className="text-2xl font-semibold text-gray-900">{sharedEntries.length}</p>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{copy.history}</h2>
            <p className="text-sm text-gray-500">{copy.historyHint}</p>
          </div>
        </div>

        <div className="overflow-x-auto pb-2" dir="ltr">
          <ActivityCalendar
            data={calendarData}
            minLevel={0}
            maxLevel={3}
            weekStart={6}
            blockSize={12}
            blockMargin={4}
            fontSize={12}
            showWeekdayLabels
            showColorLegend={false}
            showTotalCount
            labels={calendarLabels}
            theme={{
              light: ['#f1f5f9', '#f97316', '#facc15', '#22c55e'],
              dark: ['#334155', '#c2410c', '#a16207', '#15803d'],
            }}
            tooltips={{
              activity: {
                text: (activity) => `${activity.date}: ${moodForLevel(activity.level)}`,
              },
            }}
            renderBlock={(block, activity) =>
              cloneElement(block, {
                role: 'button',
                tabIndex: 0,
                'aria-label': `${activity.date}: ${moodForLevel(activity.level)}`,
                onClick: () => setSelectedDate(activity.date),
                onKeyDown: (event: KeyboardEvent<SVGRectElement>) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    setSelectedDate(activity.date)
                  }
                },
                style: { ...block.props.style, cursor: 'pointer' },
              })
            }
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-600">
          {[
            { label: copy.noEntryLegend, color: '#f1f5f9' },
            { label: copy.poorLegend, color: '#f97316' },
            { label: copy.okayLegend, color: '#facc15' },
            { label: copy.goodLegend, color: '#22c55e' },
          ].map((item) => (
            <span key={item.label} className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm border border-black/5" style={{ backgroundColor: item.color }} />
              {item.label}
            </span>
          ))}
        </div>

        {selectedDate && (
          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold text-gray-900">{copy.dayDetails}: {formatCalendarDate(selectedDate)}</h3>
              <button type="button" onClick={() => setSelectedDate(null)} className="text-sm font-medium text-primary-700 hover:underline">
                {copy.cancelSelection}
              </button>
            </div>
            {selectedDayEntries.length === 0 ? (
              <p className="text-sm text-gray-500">{copy.noEntryForDay}</p>
            ) : (
              <div className="space-y-3">
                {selectedDayEntries.map((entry) => (
                  <div key={entry.id} className="rounded-lg border border-gray-200 bg-white p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-gray-900">{moodLabel(entry.mood)}</span>
                      <span className="text-xs text-gray-500">{formatDate(new Date(entry.timestamp))}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{copy.energy}: {energyLabel(entry.energy)}</p>
                    {entry.note && <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{entry.note}</p>}
                    <span className="mt-2 inline-flex items-center gap-1 text-xs text-gray-500">
                      {entry.shared ? <Share2 className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                      {entry.shared ? copy.shared : copy.private}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">{copy.newCheckIn}</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <fieldset>
              <legend className="mb-3 text-sm font-medium text-gray-800">{copy.chooseMood}</legend>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: 'Good' as const, label: copy.good, emoji: '😊', color: 'border-emerald-300 bg-emerald-50 text-emerald-800' },
                  { value: 'Okay' as const, label: copy.okay, emoji: '😐', color: 'border-amber-300 bg-amber-50 text-amber-800' },
                  { value: 'Poor' as const, label: copy.poor, emoji: '😟', color: 'border-orange-300 bg-orange-50 text-orange-800' },
                ]).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selectedMood === option.value}
                    onClick={() => { setSelectedMood(option.value); setFormError('') }}
                    className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border-2 p-3 transition ${selectedMood === option.value ? option.color : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <span className="text-3xl" aria-hidden="true">{option.emoji}</span>
                    <span className="text-sm font-semibold">{option.label}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-3 text-sm font-medium text-gray-800">{copy.chooseEnergy}</legend>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: '10' as const, label: copy.high },
                  { value: '5' as const, label: copy.medium },
                  { value: '2' as const, label: copy.low },
                ]).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selectedEnergy === option.value}
                    onClick={() => { setSelectedEnergy(option.value); setFormError('') }}
                    className={`rounded-xl border-2 px-3 py-3 text-sm font-medium transition ${selectedEnergy === option.value ? 'border-blue-300 bg-blue-50 text-blue-800' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <span className="flex items-center justify-center gap-2"><Battery className="h-4 w-4" />{option.label}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor="wellbeing-note" className="mb-2 block text-sm font-medium text-gray-800">{copy.note}</label>
              <textarea
                id="wellbeing-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder={copy.notePlaceholder}
                rows={3}
                dir={isRTL ? 'rtl' : 'ltr'}
                className="w-full resize-y rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </div>

            <div className="rounded-xl bg-gray-50 p-3">
              <label htmlFor="share-wellbeing" className="flex cursor-pointer items-start gap-3 text-sm text-gray-800">
                <input
                  id="share-wellbeing"
                  type="checkbox"
                  checked={shareWithCaregiver}
                  onChange={(event) => setShareWithCaregiver(event.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span>{copy.shareLabel}</span>
              </label>
              <p className="mt-2 text-xs text-gray-500">{copy.privacy}</p>
            </div>

            {formError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{formError}</p>}

            <button
              type="submit"
              disabled={isSubmitting || !selectedMood || !selectedEnergy}
              className="w-full rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? copy.saving : copy.save}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">{copy.history}</h2>
          {entries.length === 0 ? (
            <div className="rounded-xl bg-gray-50 p-6 text-center text-sm text-gray-500">{copy.noHistory}</div>
          ) : (
            <div className="max-h-[34rem] space-y-5 overflow-y-auto pr-1">
              {[{ title: copy.privateEntries, items: privateEntries, shared: false }, { title: copy.sharedEntries, items: sharedEntries, shared: true }]
                .filter((group) => group.items.length > 0)
                .map((group) => (
                  <div key={group.title}>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{group.title} ({group.items.length})</h3>
                    <div className="space-y-2">
                      {group.items.map((entry) => (
                        <article key={entry.id} className="rounded-xl border border-gray-200 p-3">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900">{moodLabel(entry.mood)}</p>
                              <p className="mt-1 text-sm text-gray-600">{copy.energy}: {energyLabel(entry.energy)}</p>
                              {entry.note && <p className="mt-2 whitespace-pre-wrap break-words text-sm text-gray-700">{entry.note}</p>}
                              <p className="mt-2 text-xs text-gray-500">{formatDate(new Date(entry.timestamp))}</p>
                            </div>
                            <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs ${group.shared ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                              {group.shared ? <Share2 className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                              {group.shared ? copy.shared : copy.private}
                            </span>
                          </div>
                          <div className="mt-3 flex justify-end">
                            {group.shared ? (
                              <button type="button" onClick={() => unshareWellbeing(entry.id)} className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100">
                                {copy.unshare}
                              </button>
                            ) : (
                              <button type="button" onClick={() => shareWellbeing(entry.id)} className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-primary-700 hover:bg-primary-50">
                                <Share2 className="h-3 w-3" />{copy.share}
                              </button>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
