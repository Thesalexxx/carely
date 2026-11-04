export type MedicationStatus = 'pending' | 'acknowledged' | 'postponed';
export type MedicationScheduleStatus = 'active' | 'paused';
export type RecurrencePattern = 'daily' | 'weekly' | 'once';

export interface MedicationReminder {
  id: string;
  name: string;
  dosage: string;
  times: string[];
  recurrence: RecurrencePattern;
  selectedDays?: string[];
  startDate: string;
  endDate?: string;
  status: MedicationScheduleStatus;
  notes?: string;
}

export interface MedicationReminderInstance {
  id: string;
  medicationId: string;
  date: string; // قالب تاریخ: سال-ماه-روز
  time: string;
  status: MedicationStatus;
  acknowledgedAt?: string;
  postponedAt?: string;
}

export type ActivityStatus = 'pending' | 'completed' | 'postponed';

export interface RoutineActivity {
  id: string;
  name: string;
  time: string;
  status: ActivityStatus;
  completedAt?: string;
  postponedAt?: string;
}

export interface WellbeingEntry {
  id: string;
  timestamp: string;
  mood: string;
  energy?: string;
  note?: string;
  shared: boolean;
}

export interface CarelyData {
  medications: MedicationReminder[];
  medicationInstances: MedicationReminderInstance[];
  activities: RoutineActivity[];
  wellbeing: WellbeingEntry[];
}

export interface CareContextType {
  data: CarelyData;
  acknowledgeMedication: (instanceId: string) => void;
  postponeMedication: (instanceId: string) => void;
  addMedication: (med: Omit<MedicationReminder, 'id'>) => void;
  editMedication: (id: string, updates: Partial<MedicationReminder>) => void;
  deleteMedication: (id: string) => void;
  pauseMedication: (id: string) => void;
  reactivateMedication: (id: string) => void;
  completeActivity: (id: string) => void;
  postponeActivity: (id: string) => void;
  submitWellbeing: (entry: Omit<WellbeingEntry, 'id' | 'timestamp'>) => void;
  shareWellbeing: (id: string) => void;
  unshareWellbeing: (id: string) => void;
}

// Vite bakes `import.meta.env.MODE` into the built code at compile time:
//   demo  -> carely_data_demo   (synthetic Persian demo dataset)
//   beta  -> carely_data_beta   (completely empty)
function getAppMode(): string {
  return (import.meta as { env?: { MODE?: string } }).env?.MODE ?? 'demo'
}

export const APP_MODE = getAppMode()
export const IS_DEMO = APP_MODE === 'demo'
export const IS_BETA = APP_MODE === 'beta'

// Separate localStorage keys so demo and beta never share data even though
// they are hosted under the same GitHub Pages origin on different paths.
export const STORAGE_KEY = IS_BETA ? 'carely_data_beta' : 'carely_data_demo'
const DEMO_SEED_VERSION_KEY = 'carely_demo_seed_version'
const DEMO_SEED_VERSION = '5'

// Empty starting state for beta mode (user supplies all their own entries).
export const emptyData: CarelyData = {
  medications: [],
  medicationInstances: [],
  activities: [],
  wellbeing: [],
}

// تاریخ محلی را بدون جابه‌جایی ناخواسته به‌دلیل تبدیل UTC می‌سازد.
function localDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// زمان ساختگی را به ساعت محلی وصل می‌کند تا روز ثبت در تقویم درست بماند.
function demoTimestamp(daysAgo: number, hour: number, minute: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

// زمان ثبت فعالیت امروز را با چند دقیقه اختلاف از زمان برنامه‌ریزی‌شده می‌سازد.
function activityTimestamp(hour: number, minute: number, extraMinutes: number): string {
  const date = new Date();
  date.setHours(hour, minute + extraMinutes, 0, 0);
  const now = new Date();
  return (date > now ? now : date).toISOString();
}

const today = localDateKey();
const dateSeed = Number(today.replace(/-/g, '')) || 20261104;

// مولد شبه‌تصادفی باثبات؛ داده‌ها در طول یک روز ثابت می‌مانند و با تغییر روز تازه می‌شوند.
function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function randomInt(random: () => number, min: number, max: number): number {
  return min + Math.floor(random() * (max - min + 1));
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

// همه داروهای این فهرست شوخی و داده نمایشی‌اند؛ هیچ‌کدام داروی واقعی یا توصیه مصرف نیستند.
const demoMedicationTemplates: Omit<MedicationReminder, 'id' | 'startDate'>[] = [
  {
    name: 'قرص خیالیِ تحمل همسر بعد از چهل سال',
    dosage: 'صرفاً شوخی؛ داروی واقعی نیست',
    times: ['08:15'],
    recurrence: 'daily',
    status: 'active',
    notes: 'برای وقت‌هایی که هر دو مطمئن‌اند حق با خودشان است و هیچ‌کدام هم قرار نیست کوتاه بیاید.',
  },
  {
    name: 'کپسول ساختگیِ فراموش کردن حرف‌های دکتر',
    dosage: 'کاملاً نمایشی و بدون مقدار مصرف',
    times: ['10:40'],
    recurrence: 'weekly',
    selectedDays: ['Sat', 'Mon', 'Wed'],
    status: 'active',
    notes: 'بیمار می‌گوید سیگار را ترک کرده؛ پاکت داخل جیبش فعلاً درخواست حق پاسخ دارد.',
  },
  {
    name: 'شربت خیالیِ بی‌خیالی بعد از دیدن قبض برق',
    dosage: 'اطلاعات ساختگی؛ مصرف واقعی ندارد',
    times: ['18:30'],
    recurrence: 'weekly',
    selectedDays: ['Thu', 'Fri'],
    status: 'active',
    notes: 'برای مواجهه نمایشی با قبض‌هایی که انگار برق کل محله را ما مصرف کرده‌ایم.',
  },
  {
    name: 'قرص نمایشیِ سکوت در دعوای ارث',
    dosage: 'فقط یک اسم بامزه؛ دارو نیست',
    times: ['07:20'],
    recurrence: 'daily',
    status: 'active',
    notes: 'هنوز وصیت‌نامه امضا نشده، ولی جلسه تقسیم اموال از سه ماه پیش شروع شده است.',
  },
  {
    name: 'قطره ساختگیِ کم کردن صدای اخبار و فامیل',
    dosage: 'کاملاً خیالی',
    times: ['09:35'],
    recurrence: 'once',
    status: 'active',
    notes: 'روی هیچ‌کدام اثر نداشته؛ فقط کنترل تلویزیون ناپدید شده است.',
  },
  {
    name: 'کپسول خیالیِ جمع کردن اعصاب بعد از تماس عروس',
    dosage: 'نمایشی؛ بدون دستور مصرف',
    times: ['12:50', '20:10'],
    recurrence: 'daily',
    status: 'active',
    notes: 'تماس با جمله «یه چیزی می‌خواستم بگم» آغاز شده؛ ادامه ماجرا محرمانه است.',
  },
  {
    name: 'قرص ساختگیِ زنده ماندن تا عروسی نوه',
    dosage: 'داده نمایشی؛ داروی واقعی نیست',
    times: ['21:15'],
    recurrence: 'daily',
    status: 'active',
    notes: 'برای تحمل صدای بلندگو، غذای سرد و سخنرانی‌هایی که پایان ندارند.',
  },
  {
    name: 'پماد خیالیِ ترمیم غرور بعد از باخت به نوه',
    dosage: 'کاملاً ساختگی',
    times: ['16:25'],
    recurrence: 'once',
    status: 'paused',
    notes: 'در مسابقه بازی ویدیویی شکست خورده‌ایم؛ ادعا می‌کنیم دسته خراب بوده است.',
  },
  {
    name: 'کپسول نمایشیِ تحمل گروه خانوادگی',
    dosage: 'بدون مقدار مصرف؛ فقط برای دمو',
    times: ['19:45'],
    recurrence: 'weekly',
    selectedDays: ['Tue', 'Fri'],
    status: 'active',
    notes: '۴۶ پیام صبح‌بخیر، ۹ کلیپ بی‌ربط و یک دعوای سیاسی؛ هنوز گروه را ترک نکرده‌ایم.',
  },
  {
    name: 'قرص خیالیِ فراموش کردن رمز کارت بانکی',
    dosage: 'ساختگی؛ هیچ اثر واقعی ندارد',
    times: ['17:10'],
    recurrence: 'daily',
    status: 'active',
    notes: 'رمز را یادمان نیست، ولی رمز همه اعضای خانواده را برای مواقع ضروری حفظیم.',
  },
  {
    name: 'شربت نمایشیِ آرامش قبل از دیدن داماد',
    dosage: 'صرفاً داده نمایشی',
    times: ['13:20'],
    recurrence: 'weekly',
    selectedDays: ['Thu'],
    status: 'active',
    notes: 'قرار است فقط سلام و احوال‌پرسی کنیم؛ بحث قیمت خانه و ارث ممنوع است.',
  },
  {
    name: 'قرص خیالیِ پذیرش اینکه بازنشستگی هم خرج دارد',
    dosage: 'داروی واقعی نیست',
    times: ['08:50'],
    recurrence: 'daily',
    status: 'active',
    notes: 'حقوق بازنشستگی آمد و همان روز برای پرداخت قبض‌ها رفت؛ مراسم خداحافظی کوتاه بود.',
  },
];

// نام نمونه‌ها عمداً طنزآمیز است تا مخاطب بداند با داده ساختگی نسخه نمایشی روبه‌روست.
const demoMedications: MedicationReminder[] = demoMedicationTemplates.map((item, index) => ({
  ...item,
  id: `demo-v5-med-${String(index + 1).padStart(2, '0')}`,
  startDate: today,
}));

const activityNames = [
  'شیشه کشیدن با دوستان و قول دادن که این آخرین بار است',
  'لج‌بازی با همسرم؛ هر دو منتظریم آن یکی اول عذرخواهی کند',
  'رفتن به ختم کسی که هنوز ازش طلبکارم',
  'چک کردن قیمت قبر؛ ظاهراً مردن هم دیگر از توان مالی خارج است',
  'به دکتر گفتم سیگار را ترک کرده‌ام؛ پاکت توی جیبم شهادت دیگری می‌دهد',
  'قهر با بچه‌ها تا وقتی خودشان زنگ بزنند؛ احتمالاً سال بعد',
  'بحث با همسر سر اینکه کدام‌مان بیشتر اعصاب آن یکی را خرد کرده',
  'مخفی کردن پول از همسر؛ او هم پول‌هایش را از من مخفی کرده',
  'مرور وصیت‌نامه و خط زدن بچه‌ای که فقط عیدها زنگ می‌زند',
  'تماس با رفیق قدیمی و مرور خاطراتی که بهتر است در پرونده نیایند',
  'سیگار کشیدن با دوستان و توافق جمعی برای ترک از شنبه',
  'شرط‌بندی با رفقا سر اینکه کدام‌مان زودتر می‌رویم؛ جایزه هنوز پرداخت نشده',
  'رفتن داروخانه و وانمود کردن به اینکه قیمت‌ها کاملاً منطقی‌اند',
  'گفتن «حق با توئه» به همسر؛ صرفاً برای پایان دادن به جلسه',
  'تصاحب کنترل تلویزیون پیش از آنکه همسرم متوجه عملیات شود',
  'زنگ زدن به بچه‌ها فقط برای پرسیدن رمز کارت؛ رابطه عاطفی در مرحله بعد',
  'تماشای اخبار تا فشار خون خودش درخواست مرخصی کند',
  'ویزیت دکتر و ارائه نسخه کاملاً ویرایش‌شده‌ای از عادت‌های بد',
  'قرار با رفقا برای خاطره‌بازی؛ هرکس سهم خودش از حقیقت را حذف می‌کند',
  'سوزاندن ته‌دیگ و انداختن تقصیر گردن عروس',
  'گفتن «من چیزی نمی‌خوام» و بعد ناراحت شدن از اینکه چیزی نخریدند',
  'جواب ندادن به تماس بچه‌ها برای اینکه بفهمند ما هم زندگی داریم',
  'خواندن پیامک بانک و خراب شدن باقی روز',
  'آشتی با همسر؛ یعنی باتری کنترل تمام شده و کسی حوصله بلند شدن ندارد',
  'دیدن عکس‌های جوانی و شکایت رسمی از دوربین و نورپردازی',
  'بحث سیاسی با رفقا و از دست دادن تنها دوست باقی‌مانده',
  'رفتن عروسی و حساب کردن اینکه چند سال تا عروسی بعدی خانواده مانده',
  'پاک کردن سابقه جست‌وجو قبل از اینکه نوه گوشی را بگیرد',
  'پنهان کردن پاکت سیگار از همسر؛ عملیات با شکست اطلاعاتی روبه‌رو شد',
  'بهانه آوردن برای نرفتن مهمانی فامیلی؛ این بار سردرد نقش اول را دارد',
  'نشستن کنار پنجره و قضاوت پارک کردن همسایه‌ها',
  'بررسی اینکه چه کسی در وصیت‌نامه اسمم را اشتباه نوشته است',
  'رفتن ختم و جواب دادن به سؤال «نسبت شما با مرحوم چیست؟» با «طلبکارم»',
  'گفتن به نوه که اینترنت زمان ما بهتر بود؛ مدرک نداریم ولی مطمئنیم',
  'تماس با بانک برای اعتراض به اینکه چرا پولم هنوز مال خودم است ولی خرجش دست آن‌هاست',
  'جلسه خانوادگی برای تقسیم وسایل؛ هنوز خود صاحب وسایل زنده است',
  'تمرین راه رفتن بدون غر زدن؛ رکورد شخصی: هفت قدم',
  'بازجویی از همسر درباره اینکه آخرین شیرینی را چه کسی خورده است',
  'خوابیدن وسط فیلم و بیدار شدن برای نقد پایان‌بندی',
  'رفتن پیش دوست قدیمی؛ هر دو از دردها می‌گوییم و آخرش سر سیاست دعوا می‌کنیم',
  'چک کردن فشار خون بعد از باز کردن قبض گاز',
  'گفتن اینکه حالم عالی است، چون حوصله توضیح دادن ندارم',
  'جلسه محرمانه با رفقا؛ موضوع جلسه: چطور از مهمانی خانوادگی فرار کنیم',
  'تماشای عکس نوه و وانمود کردن به اینکه رمز باز کردن عکس را بلدیم',
  'تماس با فرزند برای احوال‌پرسی؛ بحث به پول و ارث کشید، طبق برنامه',
  'نوشتن فهرست کارهای فردا و انتقال همه‌شان به هفته آینده',
  'مذاکره با زانو برای پایین رفتن از پله؛ زانو درخواست وکیل کرد',
  'رفتن به سوپرمارکت برای یک چیز و برگشتن با همه‌چیز به‌جز همان چیز',
  'قهر با تلویزیون چون مجری حرفم را قطع کرد؛ از صفحه نمایش انتظار ادب داشتم',
  'گفتن «این آخرین سیگار است»؛ جمله‌ای که سال‌هاست تکرار می‌شود',
  'چانه زدن با همسر بر سر اینکه چه کسی باید اول عذرخواهی کند؛ جلسه بدون نتیجه',
  'مرتب کردن مدارک مهم و پیدا کردن قبضی که از سال قبل پنهان شده بود',
  'بررسی اینکه بچه‌ها فقط برای تولد زنگ می‌زنند یا برای رمز پویا هم وقت دارند',
  'رفتن برای پیاده‌روی و برگشتن با سه خبر از زندگی همسایه‌ها',
  'تمرین لبخند در آینه قبل از مهمانی؛ قرار است وانمود کنیم از دیدن همه خوشحالیم',
  'گوش دادن به نصیحت دکتر و تصمیم گرفتن که از فردا جدی بگیریم؛ فردا نامشخص است',
  'یک دورهمی با دوستان و بحث درباره اینکه کدام‌مان بیشتر اشتباه زندگی کرده‌ایم',
  'خاموش کردن گوشی برای فرار از فامیل؛ بعدش نگران شدیم چرا کسی زنگ نمی‌زند',
  'پیدا کردن عینک؛ روی سرم بود، مثل همیشه و مثل تمام امیدهایم',
  'تهیه فهرست کسانی که از من پول قرض گرفته‌اند؛ طولانی‌تر از فهرست دوستانم شد',
];

// فعالیت‌های امروز با ترتیب و زمان‌های متغیر ساخته می‌شوند؛ وضعیت‌ها با ساعت فعلی تناسب دارند.
function createDemoActivities(): RoutineActivity[] {
  const random = createSeededRandom(dateSeed ^ 0x5f3759df);
  const selected = shuffle(activityNames, random).slice(0, 20);
  const usedMinutes = new Set<number>();
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

  const scheduled = selected.map((name, index) => {
    let minuteOfDay = 6 * 60 + 30 + Math.floor(random() * (16 * 60));
    while (usedMinutes.has(minuteOfDay)) {
      minuteOfDay = 6 * 60 + 30 + Math.floor(random() * (16 * 60));
    }
    usedMinutes.add(minuteOfDay);
    return { name, minuteOfDay, index };
  }).sort((a, b) => a.minuteOfDay - b.minuteOfDay);

  return scheduled.map(({ name, minuteOfDay, index }) => {
    const hour = Math.floor(minuteOfDay / 60);
    const minute = minuteOfDay % 60;
    const isPast = minuteOfDay <= nowMinutes;
    const statusRoll = random();
    const status: ActivityStatus = !isPast
      ? 'pending'
      : statusRoll < 0.68
        ? 'completed'
        : statusRoll < 0.84
          ? 'postponed'
          : 'pending';
    const id = `demo-v5-act-${String(index + 1).padStart(2, '0')}`;

    if (status === 'completed') {
      return {
        id,
        name,
        time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
        status,
        completedAt: activityTimestamp(hour, minute, randomInt(random, 3, 35)),
      };
    }
    if (status === 'postponed') {
      return {
        id,
        name,
        time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
        status,
        postponedAt: activityTimestamp(hour, minute, randomInt(random, 2, 25)),
      };
    }
    return {
      id,
      name,
      time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      status,
    };
  });
}

// یادداشت‌های فارسی با لحن متنوع؛ بعضی روزها معمولی و بعضی روزها کمی شیطنت‌آمیزند.
const demoWellbeingNotes = [
  'امروز حالم بد نبود؛ فقط از زنده ماندن با این قیمت‌ها خسته‌ام.',
  'با همسرم دعوا کردیم. هر دو پیروز شدیم: اعصاب هر دو را باختیم.',
  'دکتر پرسید سیگار می‌کشم؟ گفتم نه، فقط روشنش می‌کنم.',
  'با رفقا دور هم بودیم؛ قرار بود شیشه نکشیم. قرارها هم مثل زانوها دوام نیاوردند.',
  'فهمیدم فلانی مرده؛ هنوز طلبش را پس نداده بود. واقعاً وقت‌شناس نبود.',
  'قیمت قبر را پرسیدم. فعلاً زنده ماندن از نظر اقتصادی به‌صرفه‌تر است.',
  'همسرم گفت من را درک نمی‌کنی؛ چهل سال است دارم تمرین می‌کنم، توقعش هم بالاست.',
  'بچه‌ها فقط وقتی زنگ می‌زنند که رمز کارت یا کد پیامک را لازم دارند.',
  'نوه آمد گوشی را درست کرد؛ حالا حتی خودم هم نمی‌توانم واردش شوم.',
  'فشارم را گرفتم؛ عددش از قیمت خانه هم بالاتر بود.',
  'امروز حوصله هیچ‌کس را نداشتم، حتی خودم را.',
  'همه‌چیز از صبح بد پیش رفت؛ خوشبختانه هنوز قبض برق را باز نکرده‌ام.',
  'یک نخ کشیدم و بعد به دکتر قول دادم آخرینش بود. هر دو خندیدیم؛ از سر ناچاری.',
  'همسرم قهر کرد. سکوت خانه عالی بود تا وقتی فهمیدم شام هم در سکوت حذف شده.',
  'در وصیت‌نامه نوشتم کنترل تلویزیون به کسی برسد که کمتر اعصابم را خرد کرده؛ فعلاً وارثی نداریم.',
  'امروز از عروسم تعریف کردم؛ احتمالاً یک چیزی لازم دارد و من هم ساده نیستم.',
  'با پسرم سر ارث بحث کردیم. هنوز نمرده‌ام، ولی تقسیم از مدت‌ها پیش شروع شده.',
  'با دوستان سر اینکه کدام‌مان زودتر می‌رویم شوخی کردیم؛ بعدش برای عوض شدن بحث، قیمت گوشت را حساب کردیم.',
  'امروز خوابیدم تا از مشکلات فرار کنم؛ مشکلات بیدار ماندند و منتظرم بودند.',
  'حالم خوب بود تا تلفن زنگ زد و گفتند «یه سؤال کوچیک دارم».',
  'صدای اخبار را کم کردم؛ خود واقعیت هنوز زیادی بلند بود.',
  'دکتر گفت کمتر عصبی شو. آدرس خانه‌ام را نوشتم؛ گفت پس حق داری.',
  'امروز به خودم افتخار کردم، تا وقتی پیامک قسط عقب‌افتاده رسید.',
  'گفتم دیگر به کسی پول قرض نمی‌دهم؛ برادرم تماس گرفت و قانون را اصلاح کردم.',
  'امروز به همسرم گفتم حق با توست. این اعتراف نباید در پرونده ثبت شود.',
  'بچه‌ها پرسیدند چه لازم داری؛ گفتم هیچ‌چیز. بعد که رفتند از بی‌توجهی‌شان شکایت کردم.',
  'همسایه فوت کرده؛ اولین فکرم این بود که دیگر صدای دریلش را نمی‌شنویم. بعد خجالت کشیدم.',
  'امروز رفتم ختم. همه پرسیدند نسبتت چیست؛ گفتم فعلاً طلبکارم.',
  'با کارمند بانک طوری حرف زدم که خودم هم از خودم ترسیدم.',
  'امروز با دوستان شیشه کشیدیم؛ قرار بود فقط چای بخوریم. برنامه‌ریزی‌مان مثل همیشه افتضاح بود.',
  'از صبح با همسرم لج کردم. الان یادم نیست سر چه بود، ولی عقب‌نشینی هم نمی‌کنم.',
  'دخترم گفت باید بیشتر بیرون بروم. گفتم تو اول بیشتر زنگ بزن، بعد برای من برنامه بریز.',
  'یک ساعت دنبال عینک گشتم؛ روی سرم بود. حافظه‌ام رسماً استعفا داده.',
  'امروز از دکتر دروغ گفتم که رژیم را رعایت می‌کنم. سیب‌زمینی سرخ‌کرده هم شاهد است.',
  'قرار بود فقط یک لیوان بخوریم؛ دوستانم تعریف متفاوتی از «فقط یکی» دارند.',
  'همسرم گفت صدای خر و پفم خانه را می‌لرزاند. گفتم دست‌کم هنوز چیزی در این خانه تحت کنترل من است.',
  'امروز تصمیم گرفتم آدم بهتری باشم؛ تا ساعت ده صبح دوام آوردم.',
  'بچه‌ها درباره فروش خانه حرف زدند. هنوز زنده‌ام، ولی انگار مزاحم نقشه‌اند.',
  'با رفیقم خاطرات جوانی را مرور کردیم؛ نسخه‌ای که تعریف کردیم با واقعیت کمی تفاوت داشت.',
  'حالم متوسط بود. نه آن‌قدر خوب که بیرون بروم، نه آن‌قدر بد که کسی برایم غذا بیاورد.',
  'امروز مهمانی فامیلی بود. سه ساعت لبخند زدم و دو روز زمان لازم دارم به حالت عادی برگردم.',
  'همسرم گفت «هر کاری دوست داری بکن». از تجربه می‌دانم این جمله تله است.',
  'به نوه گفتم ما هم‌سن تو بودیم بهتر زندگی می‌کردیم؛ او هم گوشی‌اش را نشانم داد و بحث تمام شد.',
  'قبض‌ها را پرداخت کردم. برای چند دقیقه احساس کردم آدم ثروتمندی هستم؛ پولی باقی نمانده بود.',
  'امروز از تنهایی شکایت کردم، بعد که دو نفر زنگ زدند جواب ندادم.',
  'یک روز آرام داشتم؛ هیچ‌کس پول نخواست و تلویزیون هم حرف اضافه نزد.',
  'به همسرم گفتم دوستت دارم؛ پرسید چه خرابکاری‌ای کرده‌ای.',
  'امروز به مراسمی رفتم که قرار بود خوشحال‌کننده باشد؛ باز هم بحث ارث شد.',
  'از پله‌ها پایین آمدم و زانوهایم صورت‌جلسه اعتراض تنظیم کردند.',
  'با رفقا درباره ترک سیگار حرف زدیم؛ هر سه هم‌زمان پاکت درآوردیم.',
  'امروز فهمیدم گروه فامیل را نمی‌شود ترک کرد؛ فقط می‌شود نوتیفیکیشنش را کشت.',
  'به بانک زنگ زدم. موسیقی انتظار از خود مکالمه طولانی‌تر و اعصاب‌خردکن‌تر بود.',
  'همسرم گفت تغییر کرده‌ام. گفتم بالاخره یک نفر متوجه شد.',
  'امروز هیچ کار مفیدی نکردم؛ با این حال شب خسته‌ام. استعداد خاصی است.',
  'با بچه‌ها تماس تصویری داشتم. بیشتر مکالمه صرف این شد که بپرسند تصویرم چرا فریز شده.',
  'دکتر گفت استرس نداشته باشم. گفتم لطفاً این را به قبض‌ها و خانواده هم اطلاع بدهید.',
  'امروز از خودم مراقبت کردم؛ یعنی در را به روی مهمان ناخوانده باز نکردم.',
  'خبر فوت یکی از آشناها را شنیدم. آدم یک لحظه ساکت می‌شود و بعد یاد قسط‌هایش می‌افتد.',
  'با همسرم آشتی کردیم؛ نه از روی تفاهم، فقط هر دو گرسنه شده بودیم.',
  'امروز یادم رفت چرا وارد آشپزخانه شدم. برای حفظ آبرو یک چای درست کردم.',
  'دوستم گفت هنوز جوانیم. بعد هر دو برای بلند شدن از مبل از دسته‌اش کمک گرفتیم.',
  'یک نخ کمتر کشیدم و یک ساعت بیشتر غر زدم؛ تراز زندگی برقرار شد.',
  'از بچه‌ها دلخورم، ولی اگر زنگ بزنند اول می‌پرسم چرا این‌قدر دیر کردی.',
  'امروز از زندگی راضی بودم؛ تا وقتی یادم افتاد فردا نوبت آزمایش دارم.',
  'همه گفتند مثبت‌اندیش باش. من هم قبض‌ها را برعکس گرفتم که عددها را نبینم.',
  'برای آینده برنامه ریختم؛ آینده هم ظاهراً برنامه دیگری دارد.',
  'امروز با همسایه بحث کردم و بعد فهمیدم شماره واحد را اشتباه گرفته‌ام.',
  'خوابم خوب بود. حداقل یکی از اعضای خانواده امروز همکاری کرد.',
  'قرار بود پیاده‌روی کنم؛ تا دم در رفتم و همان را فعالیت ورزشی حساب کردم.',
  'به همسرم گفتم دیگر بحث نمی‌کنم. پنج دقیقه بعد جلسه دوم شروع شد.',
  'امروز کمی غمگین بودم. نه دلیل خاصی داشت، نه حوصله توضیحش را داشتم.',
  'دوست قدیمی‌ام زنگ زد. اول فکر کردم پول می‌خواهد، خوشبختانه فقط درد دل داشت.',
  'یک روز دیگر گذشت و من هنوز رمز پویا را از بچه‌ها می‌پرسم.',
  'امروز همه چیز عادی بود؛ همین خودش مشکوک است.',
];

// در بازه‌ای نزدیک به یک سال، تعداد و فاصله روزهای ثبت‌شده به‌شکل متغیر انتخاب می‌شود.
function createDemoWellbeingEntries(): WellbeingEntry[] {
  const random = createSeededRandom(dateSeed ^ 0x9e3779b9);
  const targetCount = randomInt(random, 185, 235);
  const selectedDays = new Set<number>([0]);

  while (selectedDays.size < targetCount) {
    selectedDays.add(randomInt(random, 0, 364));
  }

  const dayOffsets = [...selectedDays].sort((a, b) => b - a);
  let previousNote = -1;

  return dayOffsets.map((daysAgo, index) => {
    const moodRoll = random();
    const mood = moodRoll < 0.51 ? 'Good' : moodRoll < 0.84 ? 'Okay' : 'Poor';
    const energy = mood === 'Good'
      ? (random() < 0.48 ? '10' : random() < 0.72 ? '5' : '2')
      : mood === 'Okay'
        ? (random() < 0.18 ? '10' : random() < 0.83 ? '5' : '2')
        : (random() < 0.72 ? '2' : '5');

    let noteIndex = randomInt(random, 0, demoWellbeingNotes.length - 1);
    if (noteIndex === previousNote) noteIndex = (noteIndex + randomInt(random, 1, demoWellbeingNotes.length - 1)) % demoWellbeingNotes.length;
    previousNote = noteIndex;

    const hour = randomInt(random, 6, 22);
    const minute = randomInt(random, 0, 59);

    return {
      id: `demo-v5-wb-${String(index + 1).padStart(3, '0')}`,
      timestamp: demoTimestamp(daysAgo, hour, minute),
      mood,
      energy,
      note: demoWellbeingNotes[noteIndex],
      shared: random() < 0.36,
    };
  }).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

// داده‌های اولیه فقط شامل اطلاعات ساختگی فارسی برای نمایش نسخه آزمایشی هستند.
const initialData: CarelyData = {
  medications: demoMedications,
  medicationInstances: [],
  activities: createDemoActivities(),
  wellbeing: createDemoWellbeingEntries(),
};

// داده‌های نمونه قبلی با شناسه مخصوص خودشان حذف می‌شوند و داده‌های واقعی باقی می‌مانند.
function mergeById<T extends { id: string }>(existing: T[], demo: T[]): T[] {
  const existingIds = new Set(existing.map((item) => item.id));
  return [...existing, ...demo.filter((item) => !existingIds.has(item.id))];
}

function mergeDemoData(existing: CarelyData): CarelyData {
  return {
    ...existing,
    medications: mergeById(
      existing.medications.filter((item) => !item.id.startsWith('demo-med-') && !item.id.startsWith('demo-v4-med-') && !item.id.startsWith('demo-v5-med-')),
      initialData.medications,
    ),
    medicationInstances: existing.medicationInstances.filter(
      (item) =>
        !item.medicationId.startsWith('demo-med-') &&
        !item.medicationId.startsWith('demo-v4-med-') &&
        !item.medicationId.startsWith('demo-v5-med-'),
    ),
    activities: mergeById(
      existing.activities.filter((item) => !item.id.startsWith('demo-act-') && !item.id.startsWith('demo-v4-act-') && !item.id.startsWith('demo-v5-act-')),
      initialData.activities,
    ),
    wellbeing: mergeById(
      existing.wellbeing.filter((item) => !item.id.startsWith('demo-wb-') && !item.id.startsWith('demo-v4-wb-') && !item.id.startsWith('demo-v5-wb-')),
      initialData.wellbeing,
    ),
  };
}

export function loadInitialData(): CarelyData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Populate synthetic demo data only in demo mode, and only on first visit.
      // Beta mode always starts empty; user-created entries persist afterwards.
      if (IS_DEMO) {
        localStorage.setItem(DEMO_SEED_VERSION_KEY, DEMO_SEED_VERSION);
        return initialData;
      }
      return emptyData;
    }

    const parsed = JSON.parse(raw) as CarelyData;
    if (
      !parsed ||
      !Array.isArray(parsed.medications) ||
      !Array.isArray(parsed.medicationInstances) ||
      !Array.isArray(parsed.activities) ||
      !Array.isArray(parsed.wellbeing)
    ) {
      if (IS_DEMO) {
        localStorage.setItem(DEMO_SEED_VERSION_KEY, DEMO_SEED_VERSION);
        return initialData;
      }
      return emptyData;
    }

    // Seed migration logic is specific to demo mode. Beta data is never seeded.
    if (IS_DEMO) {
      const seededVersion = localStorage.getItem(DEMO_SEED_VERSION_KEY);
      if (seededVersion !== DEMO_SEED_VERSION) {
        const merged = mergeDemoData(parsed);
        localStorage.setItem(DEMO_SEED_VERSION_KEY, DEMO_SEED_VERSION);
        return merged;
      }
    }

    return parsed;
  } catch {
    // اگر حافظه مرورگر در دسترس نباشد، داده‌های نمونه برای اجرای برنامه استفاده می‌شوند.
    return IS_DEMO ? initialData : emptyData;
  }
}

// Restore the original synthetic demo dataset. Demo mode only — beta user data
// is never touched by this operation.
export function resetDemoData(): void {
  if (!IS_DEMO) return;
  try {
    localStorage.setItem(DEMO_SEED_VERSION_KEY, DEMO_SEED_VERSION);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  } catch {
    // ignore
  }
}

export function saveData(data: CarelyData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ممکن است حافظه مرورگر در دسترس نباشد یا فضای ذخیره‌سازی آن پر شده باشد.
  }
}
