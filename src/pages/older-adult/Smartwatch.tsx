import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Liveline } from 'liveline'
import type { LivelinePoint } from 'liveline'
import {
  Activity,
  Battery,
  Bluetooth,
  Clock3,
  Droplets,
  Footprints,
  HeartPulse,
  Info,
  Moon,
  RefreshCw,
  Thermometer,
  Watch,
  Wind,
  Wifi,
} from 'lucide-react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useLang } from '../../context/LanguageContext'
import { cn } from '../../lib/utils'

type Metrics = {
  heartRate: number
  systolic: number
  diastolic: number
  glucose: number
  oxygen: number
  respiration: number
  temperature: number
  steps: number
  sleepMinutes: number
  battery: number
}

type TrendPoint = {
  time: string
  systolic: number
  diastolic: number
  glucose: number
  oxygen: number
}

type TrendKey = 'pressure' | 'glucose' | 'oxygen'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const randomBetween = (min: number, max: number) => min + Math.random() * (max - min)

function createInitialMetrics(): Metrics {
  return {
    heartRate: 72,
    systolic: 119,
    diastolic: 77,
    glucose: 108,
    oxygen: 98,
    respiration: 15,
    temperature: 36.7,
    steps: 4218,
    sleepMinutes: 452,
    battery: 84,
  }
}

function evolveMetrics(previous: Metrics): Metrics {
  return {
    heartRate: Math.round(clamp(previous.heartRate + randomBetween(-3, 3), 62, 91)),
    systolic: Math.round(clamp(previous.systolic + randomBetween(-2, 2), 108, 132)),
    diastolic: Math.round(clamp(previous.diastolic + randomBetween(-2, 2), 66, 86)),
    glucose: Math.round(clamp(previous.glucose + randomBetween(-3, 3), 88, 145)),
    oxygen: Math.round(clamp(previous.oxygen + randomBetween(-1, 1), 95, 99)),
    respiration: Math.round(clamp(previous.respiration + randomBetween(-1, 1), 12, 19)),
    temperature: Math.round(clamp(previous.temperature + randomBetween(-0.1, 0.1), 36.3, 37.2) * 10) / 10,
    steps: previous.steps + Math.round(randomBetween(0, 5)),
    sleepMinutes: previous.sleepMinutes,
    battery: Math.max(1, previous.battery - (Math.random() < 0.08 ? 1 : 0)),
  }
}

// تولید یک موج ECG ساختگی برای نمایش حرکت زنده نمودار؛ این سیگنال پزشکی واقعی نیست.
function ecgSample(timeSeconds: number, heartRate: number): number {
  const period = 60 / Math.max(1, heartRate)
  const phase = ((timeSeconds % period) + period) % period / period
  const gaussian = (x: number, center: number, width: number) =>
    Math.exp(-0.5 * ((x - center) / width) ** 2)

  const p = 0.12 * gaussian(phase, 0.19, 0.025)
  const q = -0.16 * gaussian(phase, 0.32, 0.012)
  const r = 1.05 * gaussian(phase, 0.345, 0.009)
  const s = -0.24 * gaussian(phase, 0.37, 0.014)
  const t = 0.28 * gaussian(phase, 0.64, 0.055)
  return p + q + r + s + t + randomBetween(-0.018, 0.018)
}

function createEcgHistory(heartRate: number): LivelinePoint[] {
  const now = Date.now() / 1000
  return Array.from({ length: 140 }, (_, index) => {
    const time = now - (139 - index) * 0.08
    return { time, value: ecgSample(time, heartRate) }
  })
}

function createTrendHistory(locale: string): TrendPoint[] {
  const now = new Date()
  return Array.from({ length: 12 }, (_, index) => {
    const time = new Date(now.getTime() - (11 - index) * 2 * 60 * 60 * 1000)
    return {
      time: time.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }),
      systolic: Math.round(randomBetween(112, 127)),
      diastolic: Math.round(randomBetween(70, 82)),
      glucose: Math.round(randomBetween(96, 125)),
      oxygen: Math.round(randomBetween(96, 99)),
    }
  })
}

function MetricCard({
  icon,
  title,
  value,
  unit,
  detail,
  iconClass,
}: {
  icon: ReactNode
  title: string
  value: string
  unit?: string
  detail?: string
  iconClass: string
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-1 flex flex-wrap items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-gray-900">{value}</span>
            {unit && <span className="text-xs text-gray-500">{unit}</span>}
          </p>
          {detail && <p className="mt-1 text-xs text-gray-400">{detail}</p>}
        </div>
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', iconClass)}>
          {icon}
        </div>
      </div>
    </section>
  )
}

export const OlderAdultSmartwatch = () => {
  const { isRTL } = useLang()
  const isPersian = isRTL
  const locale = isPersian ? 'fa-IR' : 'en-US'
  const numberFormat = useMemo(() => new Intl.NumberFormat(locale), [locale])

  const copy = isPersian
    ? {
        title: 'اتصال ساعت هوشمند',
        subtitle: 'نمایش آزمایشی اطلاعات و شاخص‌های ساعت هوشمند.',
        connect: 'اتصال دستگاه نمایشی',
        disconnect: 'قطع اتصال',
        connecting: 'در حال اتصال...',
        connected: 'متصل',
        disconnected: 'متصل نیست',
        found: 'ساعت نمایشی پیدا شد',
        device: 'Carely Watch ـ نسخه نمایشی',
        demoTitle: 'حالت کاملاً نمایشی',
        demoText: 'این صفحه به هیچ ساعت یا حسگر واقعی متصل نیست. تمام اعداد، نمودارها و سیگنال ضربان قلب به‌صورت ساختگی تولید می‌شوند و نباید برای ارزیابی سلامت یا تصمیم پزشکی استفاده شوند.',
        liveTitle: 'نمای زنده ضربان قلب',
        liveSubtitle: 'موج متحرک ساختگی برای نمایش رابط کاربری',
        live: 'نمایش زنده',
        heartRate: 'ضربان قلب',
        pressure: 'فشار خون',
        glucose: 'قند خون',
        oxygen: 'اشباع اکسیژن',
        respiration: 'تعداد تنفس',
        temperature: 'دمای بدن',
        steps: 'تعداد قدم‌ها',
        sleep: 'مدت خواب',
        battery: 'باتری ساعت',
        bpm: 'ضربه در دقیقه',
        mmhg: 'میلی‌متر جیوه',
        mgdl: 'میلی‌گرم بر دسی‌لیتر',
        percent: 'درصد',
        breaths: 'تنفس در دقیقه',
        celsius: 'درجه سانتی‌گراد',
        hours: 'ساعت',
        lastSync: 'آخرین به‌روزرسانی نمایشی',
        refresh: 'تولید داده جدید',
        trends: 'روند شاخص‌ها',
        trendsSubtitle: 'تاریخچه ساختگی ۲۴ ساعت گذشته',
        bloodPressureTrend: 'فشار خون',
        glucoseTrend: 'قند خون',
        oxygenTrend: 'اکسیژن خون',
        systolic: 'سیستولیک',
        diastolic: 'دیاستولیک',
        noRealData: 'بدون داده واقعی',
        sleepDetail: 'مدت خواب شب گذشته (نمونه)',
        batteryDetail: 'شارژ باقی‌مانده (نمونه)',
      }
    : {
        title: 'Connect Smartwatch',
        subtitle: 'A simulated dashboard of smartwatch-style health metrics.',
        connect: 'Connect demo device',
        disconnect: 'Disconnect',
        connecting: 'Connecting...',
        connected: 'Connected',
        disconnected: 'Not connected',
        found: 'Demo watch found',
        device: 'Carely Watch — Demo',
        demoTitle: 'Simulation mode',
        demoText: 'This page is not connected to a physical watch or sensor. All values, charts and heartbeat signals are generated synthetically. Do not use them for health assessment or medical decisions.',
        liveTitle: 'Live heart-rate waveform',
        liveSubtitle: 'A simulated animated signal for interface demonstration',
        live: 'Live simulation',
        heartRate: 'Heart rate',
        pressure: 'Blood pressure',
        glucose: 'Blood glucose',
        oxygen: 'Blood oxygen',
        respiration: 'Respiratory rate',
        temperature: 'Body temperature',
        steps: 'Steps',
        sleep: 'Sleep',
        battery: 'Watch battery',
        bpm: 'bpm',
        mmhg: 'mmHg',
        mgdl: 'mg/dL',
        percent: '%',
        breaths: 'breaths/min',
        celsius: '°C',
        hours: 'hours',
        lastSync: 'Last simulated update',
        refresh: 'Generate new readings',
        trends: 'Metric trends',
        trendsSubtitle: 'Synthetic history for the last 24 hours',
        bloodPressureTrend: 'Blood pressure',
        glucoseTrend: 'Blood glucose',
        oxygenTrend: 'Blood oxygen',
        systolic: 'Systolic',
        diastolic: 'Diastolic',
        noRealData: 'No real data',
        sleepDetail: 'Previous night (sample)',
        batteryDetail: 'Remaining (sample)',
      }

  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [deviceName, setDeviceName] = useState('')
  const [metrics, setMetrics] = useState<Metrics>(createInitialMetrics)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [trendKey, setTrendKey] = useState<TrendKey>('pressure')
  const [trendData, setTrendData] = useState<TrendPoint[]>(() => createTrendHistory(locale))
  const [ecgData, setEcgData] = useState<LivelinePoint[]>(() => createEcgHistory(72))
  const [ecgValue, setEcgValue] = useState(0)
  const connectingTimeout = useRef<number | null>(null)

  useEffect(() => () => {
    if (connectingTimeout.current !== null) window.clearTimeout(connectingTimeout.current)
  }, [])

  useEffect(() => {
    if (!isConnected) return undefined

    const waveformTimer = window.setInterval(() => {
      const time = Date.now() / 1000
      const value = ecgSample(time, metrics.heartRate)
      setEcgValue(value)
      setEcgData((current) => [...current.slice(-139), { time, value }])
    }, 100)

    const metricsTimer = window.setInterval(() => {
      setMetrics((current) => evolveMetrics(current))
      setLastSync(new Date())
    }, 5000)

    return () => {
      window.clearInterval(waveformTimer)
      window.clearInterval(metricsTimer)
    }
  }, [isConnected, metrics.heartRate])

  useEffect(() => {
    if (!isConnected) return
    setTrendData((current) => {
      const nextTime = new Date().toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
      const nextPoint: TrendPoint = {
        time: nextTime,
        systolic: metrics.systolic,
        diastolic: metrics.diastolic,
        glucose: metrics.glucose,
        oxygen: metrics.oxygen,
      }
      return [...current.slice(-10), nextPoint]
    })
  }, [isConnected, metrics, locale])

  const handleConnect = useCallback(() => {
    if (isConnected) {
      setIsConnected(false)
      setIsConnecting(false)
      setDeviceName('')
      setLastSync(null)
      if (connectingTimeout.current !== null) window.clearTimeout(connectingTimeout.current)
      return
    }

    setIsConnecting(true)
    connectingTimeout.current = window.setTimeout(() => {
      setMetrics(createInitialMetrics())
      setEcgData(createEcgHistory(72))
      setDeviceName(copy.device)
      setLastSync(new Date())
      setIsConnecting(false)
      setIsConnected(true)
    }, 1200)
  }, [copy.device, isConnected])

  const handleRefresh = () => {
    setMetrics((current) => evolveMetrics(current))
    setLastSync(new Date())
  }

  const formatted = (value: number) => numberFormat.format(value)
  const formatSleep = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const remainder = minutes % 60
    return isPersian
      ? `${formatted(hours)} ساعت و ${formatted(remainder)} دقیقه`
      : `${hours}h ${remainder}m`
  }

  const trendTabs: { key: TrendKey; label: string }[] = [
    { key: 'pressure', label: copy.bloodPressureTrend },
    { key: 'glucose', label: copy.glucoseTrend },
    { key: 'oxygen', label: copy.oxygenTrend },
  ]

  const trendUnit = trendKey === 'pressure' ? copy.mmhg : trendKey === 'glucose' ? copy.mgdl : copy.percent

  return (
    <main dir={isRTL ? 'rtl' : 'ltr'} className="mx-auto w-full max-w-6xl space-y-6 pb-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">{copy.title}</h1>
          <p className="mt-1 text-sm text-gray-600">{copy.subtitle}</p>
        </div>
      </header>

      <div role="note" className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
        <Info className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">{copy.demoTitle}</p>
          <p className="mt-1 text-sm leading-6">{copy.demoText}</p>
        </div>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
              <Watch className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{isConnected ? deviceName : copy.disconnected}</h2>
              <p className="mt-0.5 text-sm text-gray-500">{isConnected ? copy.found : copy.noRealData}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className={cn(
              'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold',
              isConnected ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : isConnecting ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-gray-200 bg-gray-50 text-gray-600',
            )}>
              <span className={cn('h-2 w-2 rounded-full', isConnected ? 'animate-pulse bg-emerald-500' : isConnecting ? 'animate-pulse bg-amber-500' : 'bg-gray-400')} />
              {isConnected ? copy.connected : isConnecting ? copy.connecting : copy.disconnected}
            </span>
            <button
              type="button"
              onClick={handleConnect}
              disabled={isConnecting}
              className={cn(
                'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60',
                isConnected ? 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50' : 'bg-primary-600 text-white shadow-sm hover:bg-primary-700',
              )}
            >
              {isConnecting ? <RefreshCw className="h-4 w-4 animate-spin" /> : isConnected ? <Wifi className="h-4 w-4" /> : <Bluetooth className="h-4 w-4" />}
              {isConnecting ? copy.connecting : isConnected ? copy.disconnect : copy.connect}
            </button>
          </div>
        </div>
      </section>

      {isConnected && (
        <>
          <section className="rounded-2xl border border-gray-800 bg-slate-950 p-4 text-white shadow-sm sm:p-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <HeartPulse className="h-5 w-5 text-rose-400" />
                  <h2 className="text-lg font-semibold">{copy.liveTitle}</h2>
                </div>
                <p className="mt-1 text-sm text-slate-400">{copy.liveSubtitle}</p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-rose-900/70 bg-rose-950/60 px-3 py-1.5 text-xs font-semibold text-rose-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-rose-400" />
                {copy.live}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_180px]">
              <div className="h-56 min-w-0 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70 p-2" dir="ltr">
                <Liveline
                  data={ecgData}
                  value={ecgValue}
                  color="#fb7185"
                  theme="dark"
                  grid
                  badge={false}
                  fill={false}
                  pulse
                  lineWidth={2.5}
                  scrub={false}
                  momentum={false}
                />
              </div>
              <div className="flex flex-row items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 p-4 md:flex-col md:items-start md:justify-center">
                <div>
                  <p className="text-sm text-slate-400">{copy.heartRate}</p>
                  <p className="mt-1 text-4xl font-bold tracking-tight text-white">{formatted(metrics.heartRate)}</p>
                  <p className="text-xs text-slate-400">{copy.bpm}</p>
                </div>
                <HeartPulse className="h-10 w-10 animate-pulse text-rose-400" />
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400">{copy.demoText}</p>
          </section>

          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard icon={<HeartPulse className="h-5 w-5" />} title={copy.heartRate} value={formatted(metrics.heartRate)} unit={copy.bpm} detail={copy.live} iconClass="bg-rose-50 text-rose-600" />
            <MetricCard icon={<Activity className="h-5 w-5" />} title={copy.pressure} value={`${formatted(metrics.systolic)}/${formatted(metrics.diastolic)}`} unit={copy.mmhg} detail={copy.noRealData} iconClass="bg-violet-50 text-violet-600" />
            <MetricCard icon={<Droplets className="h-5 w-5" />} title={copy.glucose} value={formatted(metrics.glucose)} unit={copy.mgdl} detail={copy.noRealData} iconClass="bg-amber-50 text-amber-600" />
            <MetricCard icon={<Wind className="h-5 w-5" />} title={copy.oxygen} value={formatted(metrics.oxygen)} unit={copy.percent} detail={copy.noRealData} iconClass="bg-sky-50 text-sky-600" />
            <MetricCard icon={<Activity className="h-5 w-5" />} title={copy.respiration} value={formatted(metrics.respiration)} unit={copy.breaths} iconClass="bg-teal-50 text-teal-600" />
            <MetricCard icon={<Thermometer className="h-5 w-5" />} title={copy.temperature} value={formatted(metrics.temperature)} unit={copy.celsius} iconClass="bg-orange-50 text-orange-600" />
            <MetricCard icon={<Footprints className="h-5 w-5" />} title={copy.steps} value={formatted(metrics.steps)} iconClass="bg-indigo-50 text-indigo-600" />
            <MetricCard icon={<Moon className="h-5 w-5" />} title={copy.sleep} value={formatSleep(metrics.sleepMinutes)} detail={copy.sleepDetail} iconClass="bg-purple-50 text-purple-600" />
            <MetricCard icon={<Battery className="h-5 w-5" />} title={copy.battery} value={`${formatted(metrics.battery)}${copy.percent}`} detail={copy.batteryDetail} iconClass="bg-green-50 text-green-600" />
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{copy.trends}</h2>
                <p className="mt-1 text-sm text-gray-500">{copy.trendsSubtitle}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {trendTabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setTrendKey(tab.key)}
                    aria-pressed={trendKey === tab.key}
                    className={cn(
                      'min-h-9 rounded-lg border px-3 py-1.5 text-sm font-medium transition',
                      trendKey === tab.key ? 'border-primary-200 bg-primary-50 text-primary-800' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 h-64 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trendData} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#6b7280' }} minTickGap={22} />
                  <YAxis width={42} tick={{ fontSize: 11, fill: '#6b7280' }} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, borderColor: '#e5e7eb', fontSize: 12 }}
                    labelStyle={{ color: '#374151', fontWeight: 600 }}
                    formatter={(value, name) => [typeof value === 'number' ? `${formatted(value)} ${trendUnit}` : value, name === 'systolic' ? copy.systolic : name === 'diastolic' ? copy.diastolic : trendKey === 'glucose' ? copy.glucose : copy.oxygen]}
                  />
                  {trendKey === 'pressure' ? (
                    <>
                      <Area type="monotone" dataKey="systolic" fill="#8b5cf6" fillOpacity={0.08} stroke="none" isAnimationActive animationDuration={700} />
                      <Line type="monotone" dataKey="systolic" name={copy.systolic} stroke="#8b5cf6" strokeWidth={2.5} dot={false} isAnimationActive animationDuration={700} />
                      <Line type="monotone" dataKey="diastolic" name={copy.diastolic} stroke="#06b6d4" strokeWidth={2.5} dot={false} isAnimationActive animationDuration={700} />
                    </>
                  ) : trendKey === 'glucose' ? (
                    <Area type="monotone" dataKey="glucose" name={copy.glucose} stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.14} strokeWidth={2.5} dot={false} isAnimationActive animationDuration={700} />
                  ) : (
                    <Area type="monotone" dataKey="oxygen" name={copy.oxygen} stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.14} strokeWidth={2.5} dot={false} isAnimationActive animationDuration={700} />
                  )}
                  {trendKey === 'pressure' && <Legend wrapperStyle={{ fontSize: 12 }} />}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock3 className="h-4 w-4 shrink-0" />
              <span>{copy.lastSync}: {lastSync ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'medium' }).format(lastSync) : '—'}</span>
            </div>
            <button type="button" onClick={handleRefresh} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <RefreshCw className="h-4 w-4" />
              {copy.refresh}
            </button>
          </section>
        </>
      )}
    </main>
  )
}
