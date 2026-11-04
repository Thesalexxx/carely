import { useMemo, useRef, useState } from 'react'
import {
  Wind,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock3,
  Leaf,
  Sparkles,
} from 'lucide-react'
import { BreathingBubble } from '@eirini/react-breathing-bubble'
import '@eirini/react-breathing-bubble/styles.css'
import { useLang } from '../../context/LanguageContext'

type PatternId = 'gentle' | 'box' | '478'
type Session = {
  id: string
  completedAt: string
  pattern: PatternId
  cycles: number
  durationSeconds: number
}

type Pattern = {
  id: PatternId
  title: string
  description: string
  inhale: number
  hold: number
  exhale: number
  pause: number
}

const SESSION_STORAGE_KEY = 'carely_meditation_sessions'

const patterns: Pattern[] = [
  {
    id: 'gentle',
    title: 'Gentle breathing',
    description: 'A comfortable rhythm without holding your breath.',
    inhale: 4,
    hold: 0,
    exhale: 6,
    pause: 0,
  },
  {
    id: 'box',
    title: 'Box breathing',
    description: 'Four even phases: inhale, hold, exhale, pause.',
    inhale: 4,
    hold: 4,
    exhale: 4,
    pause: 4,
  },
  {
    id: '478',
    title: '4–7–8 breathing',
    description: 'A slower pattern with a longer, optional breath hold.',
    inhale: 4,
    hold: 7,
    exhale: 8,
    pause: 0,
  },
]

const translations = {
  en: {
    title: 'A moment for yourself',
    subtitle: 'A quiet space to slow down, breathe, and reset.',
    demo: 'Guided breathing demonstration',
    demoText: 'This is a relaxation exercise, not medical treatment or medical advice. Breathe naturally and stop if you feel uncomfortable, dizzy, or short of breath.',
    choosePattern: 'Choose a breathing rhythm',
    gentle: 'Gentle breathing',
    gentleDescription: 'A comfortable rhythm without holding your breath.',
    box: 'Box breathing',
    boxDescription: 'Inhale, hold, exhale, and pause for equal counts.',
    fourSevenEight: '4–7–8 breathing',
    fourSevenEightDescription: 'A slower pattern with a longer breath hold. Skip it if holding feels uncomfortable.',
    duration: 'Session length',
    cycles: 'cycles',
    estimated: 'Approximate time',
    start: 'Start session',
    pause: 'Pause',
    resume: 'Resume',
    stop: 'End session',
    restart: 'Start again',
    getReady: 'Get comfortable',
    during: 'Follow the breathing bubble and its instructions.',
    completed: 'Nicely done. You completed your breathing session.',
    completedSessions: 'Completed sessions',
    totalMinutes: 'Total minutes',
    recent: 'Recent sessions',
    noSessions: 'Your completed sessions will appear here.',
    today: 'Today',
    breathIn: 'Breathe in',
    hold: 'Hold gently',
    breatheOut: 'Breathe out',
    prepare: 'Get ready…',
    cycleProgress: (current: number, total: number) => `Cycle ${current} of ${total}`,
    min: 'min',
    minShort: 'm',
    sec: 'sec',
    gentleTip: 'There is no need to take very deep breaths. Keep the breath soft and comfortable.',
    privacy: 'Your session history is saved only in this browser.',
  },
  fa: {
    title: 'لحظه‌ای برای خودت',
    subtitle: 'فضایی آرام برای مکث، تنفس و تجدید انرژی.',
    demo: 'تمرین تنفس هدایت‌شده',
    demoText: 'این تمرین برای آرام‌سازی است و جایگزین درمان یا توصیه پزشکی نیست. طبیعی نفس بکشید و اگر احساس ناراحتی، سرگیجه یا تنگی نفس داشتید، تمرین را متوقف کنید.',
    choosePattern: 'الگوی تنفس را انتخاب کنید',
    gentle: 'تنفس آرام',
    gentleDescription: 'ریتمی ملایم و راحت، بدون حبس نفس.',
    box: 'تنفس مربعی',
    boxDescription: 'دم، مکث، بازدم و مکث با زمان‌های برابر.',
    fourSevenEight: 'تنفس ۴–۷–۸',
    fourSevenEightDescription: 'الگویی آهسته‌تر با مکث طولانی‌تر. اگر مکث برایتان ناخوشایند است، آن را انتخاب نکنید.',
    duration: 'مدت تمرین',
    cycles: 'چرخه',
    estimated: 'زمان تقریبی',
    start: 'شروع تمرین',
    pause: 'مکث',
    resume: 'ادامه',
    stop: 'پایان تمرین',
    restart: 'شروع دوباره',
    getReady: 'در وضعیت راحتی قرار بگیرید',
    during: 'به حرکت حباب و راهنمای تنفس توجه کنید.',
    completed: 'آفرین! تمرین تنفس را به پایان رساندید.',
    completedSessions: 'تعداد تمرین‌ها',
    totalMinutes: 'مجموع دقایق',
    recent: 'تمرین‌های اخیر',
    noSessions: 'تمرین‌های تکمیل‌شده شما اینجا نمایش داده می‌شوند.',
    today: 'امروز',
    breathIn: 'دم',
    hold: 'مکث آرام',
    breatheOut: 'بازدم',
    prepare: 'آماده شوید…',
    cycleProgress: (current: number, total: number) => `چرخه ${current} از ${total}`,
    min: 'دقیقه',
    minShort: 'د',
    sec: 'ثانیه',
    gentleTip: 'نیازی به نفس‌های خیلی عمیق نیست؛ آرام و راحت نفس بکشید.',
    privacy: 'تاریخچه تمرین فقط در همین مرورگر ذخیره می‌شود.',
  },
} as const

function loadSessions(): Session[] {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is Session =>
      Boolean(
        item &&
        typeof item.id === 'string' &&
        typeof item.completedAt === 'string' &&
        (item.pattern === 'gentle' || item.pattern === 'box' || item.pattern === '478') &&
        typeof item.cycles === 'number' &&
        typeof item.durationSeconds === 'number',
      ),
    )
  } catch {
    return []
  }
}

function saveSessions(sessions: Session[]) {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessions.slice(0, 30)))
  } catch {
    // ذخیره تاریخچه در صورت در دسترس نبودن localStorage نادیده گرفته می‌شود.
  }
}

function formatDuration(seconds: number, fa: boolean, labels: typeof translations.en | typeof translations.fa) {
  const minutes = Math.floor(seconds / 60)
  const remaining = seconds % 60
  if (minutes === 0) return `${seconds} ${labels.sec}`
  if (remaining === 0) return `${minutes} ${labels.min}`
  return fa
    ? `${minutes} ${labels.min} و ${remaining} ${labels.sec}`
    : `${minutes} ${labels.min} ${remaining} ${labels.sec}`
}

export const OlderAdultMeditation = () => {
  const { lang, isRTL } = useLang()
  const fa = lang === 'fa'
  const copy = translations[fa ? 'fa' : 'en']

  const [selectedPattern, setSelectedPattern] = useState<PatternId>('gentle')
  const [selectedMinutes, setSelectedMinutes] = useState<3 | 5 | 10>(3)
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [sessionKey, setSessionKey] = useState(0)
  const [sessions, setSessions] = useState<Session[]>(loadSessions)
  const startedAtRef = useRef<number | null>(null)
  const savedCurrentSessionRef = useRef(false)

  const pattern = patterns.find((item) => item.id === selectedPattern) ?? patterns[0]
  const cycleSeconds = pattern.inhale + pattern.hold + pattern.exhale + pattern.pause
  const cycles = Math.max(1, Math.floor((selectedMinutes * 60) / cycleSeconds))
  const estimatedSeconds = cycles * cycleSeconds
  const totalMinutes = Math.floor(sessions.reduce((sum, item) => sum + item.durationSeconds, 0) / 60)

  const patternLabels = useMemo(() => ({
    gentle: { title: copy.gentle, description: copy.gentleDescription },
    box: { title: copy.box, description: copy.boxDescription },
    '478': { title: copy.fourSevenEight, description: copy.fourSevenEightDescription },
  }), [copy])

  const startSession = () => {
    startedAtRef.current = Date.now()
    savedCurrentSessionRef.current = false
    setIsComplete(false)
    setIsPaused(false)
    setSessionKey((key) => key + 1)
    setIsActive(true)
  }

  const finishSession = () => {
    if (savedCurrentSessionRef.current) return
    savedCurrentSessionRef.current = true
    const elapsed = startedAtRef.current ? Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000)) : estimatedSeconds
    const entry: Session = {
      id: `meditation-${Date.now()}`,
      completedAt: new Date().toISOString(),
      pattern: selectedPattern,
      cycles,
      durationSeconds: Math.min(elapsed, estimatedSeconds + 10),
    }
    setSessions((current) => {
      const updated = [entry, ...current].slice(0, 30)
      saveSessions(updated)
      return updated
    })
    setIsActive(false)
    setIsPaused(false)
    setIsComplete(true)
  }

  const stopSession = () => {
    setIsActive(false)
    setIsPaused(false)
    startedAtRef.current = null
  }

  const recentSessions = sessions.slice(0, 5)
  const locale = fa ? 'fa-IR' : 'en-US'

  return (
    <main dir={isRTL ? 'rtl' : 'ltr'} className="mx-auto w-full max-w-6xl space-y-7 pb-10">
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-emerald-950 px-6 py-8 text-white shadow-lg sm:px-9 sm:py-10">
        <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full bg-teal-300/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="relative max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-emerald-100">
            <Leaf className="h-4 w-4" />
            {copy.demo}
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{copy.title}</h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-slate-200 sm:text-base">{copy.subtitle}</p>
        </div>
        <Sparkles className="absolute bottom-8 end-8 h-10 w-10 text-emerald-200/50" />
      </header>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
        {copy.demoText}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-5 shadow-sm sm:p-7">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-500">{copy.demo}</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                {isComplete ? copy.completed : isActive ? copy.during : copy.getReady}
              </h2>
            </div>
            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-800">
              <Wind className="h-6 w-6" />
            </div>
          </div>

          <div className="flex min-h-[340px] items-center justify-center overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_center,_#d1fae5_0%,_#ecfdf5_35%,_#f8fafc_75%)] px-2 py-6">
            {isActive ? (
              <BreathingBubble
                key={`${sessionKey}-${selectedPattern}`}
                inhale={pattern.inhale}
                hold={pattern.hold}
                exhale={pattern.exhale}
                repeats={cycles}
                countdown
                countdownText={copy.prepare}
                inhaleText={copy.breathIn}
                holdText={copy.hold}
                exhaleText={copy.breatheOut}
                bubbleColor="#0f766e"
                progressColor="#0f766e"
                progressLabel={copy.cycleProgress}
                paused={isPaused}
                size={280}
                float
                rotate={false}
                showProgress
                onComplete={finishSession}
                className="max-w-full"
              />
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="relative flex h-64 w-64 items-center justify-center rounded-full border border-emerald-200/70 bg-gradient-to-br from-teal-100 via-emerald-200 to-cyan-100 shadow-[0_20px_70px_rgba(13,148,136,0.18)]">
                  <div className="absolute inset-5 rounded-full border border-white/70" />
                  <div className="absolute inset-10 rounded-full border border-white/60" />
                  <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-emerald-700 text-white shadow-xl">
                    <Wind className="h-12 w-12" />
                  </div>
                </div>
                <p className="mt-5 max-w-sm text-sm text-slate-600">{isComplete ? copy.completed : copy.gentleTip}</p>
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {!isActive ? (
              <button type="button" onClick={startSession} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2">
                {isComplete ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isComplete ? copy.restart : copy.start}
              </button>
            ) : (
              <>
                <button type="button" onClick={() => setIsPaused((value) => !value)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800">
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  {isPaused ? copy.resume : copy.pause}
                </button>
                <button type="button" onClick={stopSession} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  {copy.stop}
                </button>
              </>
            )}
          </div>
        </div>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">{copy.choosePattern}</h2>
            <div className="space-y-3">
              {patterns.map((item) => {
                const selected = selectedPattern === item.id
                const label = patternLabels[item.id]
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={isActive}
                    onClick={() => { setSelectedPattern(item.id); setIsComplete(false) }}
                    aria-pressed={selected}
                    className={`w-full rounded-xl border p-4 text-start transition focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-60 ${selected ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-200' : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{label.title}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-600">{label.description}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-medium ${selected ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        {item.inhale}-{item.hold}-{item.exhale}{item.pause ? `-${item.pause}` : ''}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">{copy.duration}</h2>
            <div className="grid grid-cols-3 gap-2">
              {([3, 5, 10] as const).map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  disabled={isActive}
                  onClick={() => { setSelectedMinutes(minutes); setIsComplete(false) }}
                  aria-pressed={selectedMinutes === minutes}
                  className={`min-h-11 rounded-lg border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${selectedMinutes === minutes ? 'border-emerald-600 bg-emerald-700 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                >
                  {minutes} {copy.minShort}
                </button>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">{copy.cycles}</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{cycles}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">{copy.estimated}</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{formatDuration(estimatedSeconds, fa, copy)}</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <div className="flex items-start gap-3">
              <Leaf className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
              <p className="text-sm leading-6 text-emerald-950">{copy.gentleTip}</p>
            </div>
          </section>
        </aside>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-800"><CheckCircle2 className="h-5 w-5" /></div>
            <div>
              <p className="text-sm text-slate-500">{copy.completedSessions}</p>
              <p className="text-2xl font-bold text-slate-900">{sessions.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-100 p-3 text-indigo-800"><Clock3 className="h-5 w-5" /></div>
            <div>
              <p className="text-sm text-slate-500">{copy.totalMinutes}</p>
              <p className="text-2xl font-bold text-slate-900">{totalMinutes}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900">{copy.recent}</h2>
          <span className="text-xs text-slate-500">{copy.privacy}</span>
        </div>
        {recentSessions.length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">{copy.noSessions}</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentSessions.map((session) => (
              <div key={session.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="font-medium text-slate-800">{patternLabels[session.pattern].title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(session.completedAt))}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {session.cycles} {copy.cycles} · {formatDuration(session.durationSeconds, fa, copy)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
