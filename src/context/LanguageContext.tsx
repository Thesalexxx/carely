import { createContext, useContext, useCallback, useState, ReactNode, useEffect } from 'react';

export type Lang = 'en' | 'fa';

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  isRTL: boolean;
}

const translations: Record<string, Record<Lang, string>> = {
  // Brand
  appName: { en: 'Carely', fa: 'Carely' },
  // Role names
  olderAdult: { en: 'Older Adult', fa: 'سالمند' },
  caregiver: { en: 'Caregiver', fa: 'مراقب' },
  // Navigation
  myDay: { en: 'My Day', fa: 'روز من' },
  viewCalendar: { en: 'View Calendar', fa: 'مشاهده تقویم' },
  medications: { en: 'Medications', fa: 'داروها' },
  medicationCalendar: { en: 'Medication Calendar', fa: 'تقویم داروها' },
  wellbeing: { en: 'Wellbeing', fa: 'حال عمومی' },
  wellbeingCheckIn: { en: 'Wellbeing Check-in', fa: 'ثبت وضعیت' },
  dailyRoutine: { en: 'Daily Routine', fa: 'برنامه روزانه' },
  medicationsAwaiting: { en: 'Medications Awaiting', fa: 'داروها در انتظار' },
  completedToday: { en: 'Completed Today', fa: 'انجام شده امروز' },
  routinesToday: { en: 'Routines Today', fa: 'روتين‌های امروز' },
  alerts: { en: 'Alerts', fa: 'هشدارها' },
  caregiverOverview: { en: 'Caregiver Overview', fa: 'نما کلی مراقب' },
  sharedActivities: { en: 'Shared Activities', fa: 'فعالیت‌های مشترک' },
  pendingActions: { en: 'Pending Actions', fa: 'اقدامات در انتظار' },
  missedTasks: { en: 'Missed Tasks', fa: 'کارهای انجام‌نشده' },
  sharedWithCaregiver: { en: 'Shared with Caregiver', fa: 'به‌اشتراک‌گذاشته‌شده با مراقب' },
  sharedCheckIns: { en: 'Shared Check-ins', fa: 'ثبت وضعیت‌های مشترک' },
  monitoring: { en: 'Monitoring', fa: 'نظارت' },
  activitiesPending: { en: 'Activities Pending', fa: 'فعالیت‌های در انتظار' },
  // Medications
  todaysMedications: { en: "Today's Medications", fa: 'داروهای امروز' },
  dailyRoutineTitle: { en: 'Daily Routine', fa: 'برنامه روزانه' },
  dueToday: { en: 'Due Today', fa: 'سررسد امروز' },
  acknowledged: { en: 'Acknowledged', fa: 'تاییدشده' },
  acknowledge: { en: 'Acknowledge', fa: 'تأیید دریافت یادآور' },
  postpone: { en: 'Postpone', fa: 'به تعویق افتاد' },
  markDone: { en: 'Mark Done', fa: 'انجام‌شده' },
  awaitingResponse: { en: 'Awaiting response', fa: 'در انتظار پاسخ' },
  reminderAcknowledged: { en: 'Reminder acknowledged', fa: 'دریافت یادآور تایید شد' },
  reminderPostponed: { en: 'Reminder postponed', fa: 'یادآور به تعویق افتاد' },
  medicationStatus: { en: 'Medication Status', fa: 'وضعیت داروها' },
  todaysMedicationSchedule: { en: "Today's Medication Schedule", fa: 'برنامه داروهای امروز' },
  medicationDetails: { en: 'Medication Details', fa: 'جزئیات داروها' },
  medicationsRequiringAttention: { en: 'Medications Requiring Attention', fa: 'داروهایی که نیاز به توجه دارند' },
  viewDetails: { en: 'View Details', fa: 'مشاهده جزئیات' },
  setReminder: { en: 'Set Reminder', fa: 'تنظیم یادآور' },
  // Wellbeing
  quickCheckIn: { en: 'Quick Check-in', fa: 'ثبت وضعیت سریع' },
  recentCheckIns: { en: 'Recent Check-ins', fa: 'ثبت وضعیت‌های اخیر' },
  submitCheckIn: { en: 'Submit Check-in', fa: 'ثبت وضعیت' },
  saving: { en: 'Saving...', fa: 'ذخیره‌سازی...' },
  shareWithCaregiver: { en: 'Share this check-in with caregiver', fa: 'اشتراک‌گذاری این وضعیت با مراقب' },
  privateByDefault: { en: 'Check-ins are private by default. Only shared check-ins are visible to your caregiver.', fa: 'ثبت وضعیت‌ها به صورت پیش‌فرض خصوصی است. فقط ثبت وضعیت‌هایی که به‌تراز گذاشته شده‌اند، برای مراقب شما قابل مشاهده است.' },
  noCheckIns: { en: 'No check-ins recorded yet.', fa: 'هنوز هیچ ثبت وضعیتی ثبت نشده است.' },
  shared: { en: 'Shared', fa: 'به‌اشتراک‌گذاشته‌شده' },
  private: { en: 'Private', fa: 'خصوصی' },
  share: { en: 'Share', fa: 'اشتراک‌گذاری' },
  unshare: { en: 'Unshare', fa: 'لغو اشتراک' },
  noSharedCheckIns: { en: 'No shared wellbeing check-ins.', fa: 'هیچ ثبت وضعیت به‌اشتراک‌گذارشده‌ای وجود ندارد.' },
  painLevel: { en: 'Pain Level', fa: 'سطح درد' },
  mood: { en: 'Mood', fa: 'مزاج' },
  energy: { en: 'Energy', fa: 'انرژی' },
  sleep: { en: 'Sleep', fa: 'خواب' },
  // Caregiver overview
  caregiverOverviewDescription: { en: "Mary's activity at a glance.", fa: "فعالیت مریم به یک نگاه." },
  medicationFallback: { en: 'Medication', fa: 'دارو' },
  sharedEntriesShort: { en: 'shared entries', fa: 'ثبت مشترک' },
  caregiverSharedState: { en: "Mary's activity is shared between Routine, My Day, and this dashboard on this device.", fa: "فعالیت مریم در صفحات «برنامه روزانه»، «روز من» و این داشبورد در همین دستگاه مشترک است." },
  monitoringDescription: { en: "Real-time view of Mary's medication reminders, activities, and wellbeing entries.", fa: "نمای لحظه‌ای از یادآورهای دارویی، فعالیت‌ها و ثبت‌های وضعیت مریم." },
  caregiverMonitoringSharedState: { en: "All data comes from Mary's activity on this device. Changes she makes in Routine or My Day appear here automatically.", fa: "تمام داده‌ها از فعالیت مریم در این دستگاه می‌آیند. تغییراتی که در صفحات «برنامه روزانه» یا «روز من» ایجاد می‌کند، به طور خودکار اینجا ظاهر می‌شوند." },
  // Caregiver monitoring
  // Routine
  dailyProgress: { en: 'Daily Progress', fa: 'پیشرفت روزانه' },
  weekView: { en: 'Week View', fa: 'نمای هفته' },
  schedule: { en: 'Schedule', fa: 'برنامه' },
  complete: { en: 'Complete', fa: 'انجام‌شده' },
  completed: { en: 'Completed', fa: 'انجام‌شده' },
  postponed: { en: 'Postponed', fa: 'به تعویق افتاده' },
  weeklyOverview: { en: 'Weekly Overview', fa: 'بررسی هفتگی' },
  // Caregiver dashboard
  sharedActivitiesOverview: { en: 'Shared Activities Overview', fa: 'نما کلی فعالیت‌های مشترک' },
  wellbeingSharedByMary: { en: 'Wellbeing Shared by Mary', fa: 'حال عمومی به‌اشتراک‌گذاشته‌شده توسط مریم' },
  noSharedWellbeing: { en: "No shared wellbeing check-ins. Mary's check-ins are private by default.", fa: 'هیچ ثبت وضعیت به‌اشتراک‌گذارشده‌ای وجود ندارد. ثبت وضعیت‌های مریم به صورت پیش‌فرض خصوصی است.' },
  trendsInsights: { en: 'Trends & Insights', fa: 'روندها و بیناگیری‌ها' },
  complianceRate: { en: 'Compliance Rate', fa: 'نرخ پیروی' },
  averageDelay: { en: 'Average Delay', fa: 'تاخیر میانگین' },
  issuesThisWeek: { en: 'Issues This Week', fa: 'مشکلات این هفته' },
  activityStatus: { en: 'Activity Status', fa: 'وضعیت فعالیت‌ها' },
  postponedItems: { en: 'Postponed Items', fa: 'موارد به تعویق افتاده' },
  noPostponedItems: { en: 'No postponed items.', fa: 'هیچ مورد به تعویق افتاده‌ای وجود ندارد.' },
  statusPending: { en: 'Pending', fa: 'در انتظار' },
  // Common
  notifications: { en: 'Notifications', fa: 'اعلانات' },
  needHelp: { en: 'Need Help?', fa: 'نیاز به کمک؟' },
  contactCaregiver: { en: 'Contact caregiver if you need assistance', fa: 'در صورت نیاز به کمک، با مراقب تماس بگیرید' },
  language: { en: 'Language', fa: 'زبان' },
  english: { en: 'English', fa: 'انگلیسی' },
  persian: { en: 'Persian', fa: 'فارسی' },
  // Placeholder-aware strings (with vars)
  maryTook: { en: 'Mary acknowledged {count} reminders', fa: 'مریم {count} یادآور را تأیید کرد' },
  scheduledFor: { en: 'Scheduled for {time}', fa: 'برنامه‌ریزی شده برای {time}' },
  compliance: { en: '{pct}% compliance', fa: '{pct}% پیروی' },
  completedCount: { en: '{done}/{total} completed', fa: '{done}/{total} انجام‌شده' },
  dailyActivities: { en: 'Daily Activities', fa: 'فعالیت‌های روزانه' },
  medicationTimes: { en: 'Medication Times', fa: 'اوقات داروها' },
  energyHigh: { en: 'Energy: High', fa: 'انرژی: زیاد' },
  energyMedium: { en: 'Energy: Medium', fa: 'انرژی: متوسط' },
  energyLow: { en: 'Energy: Low', fa: 'انرژی: پایین' },
  progress: { en: '{pct}% complete', fa: '{pct}% تکمیل شده' },
  completedAt: { en: 'Completed at {time}', fa: 'انجام‌شده در {time}' },
  postponedAt: { en: 'Postponed at {time}', fa: 'به تعویق افتاده در {time}' },
  // Medication management
  addMedication: { en: 'Add Medication', fa: 'افزودن دارو' },
  editMedication: { en: 'Edit Medication', fa: 'ویرایش دارو' },
  deleteMedication: { en: 'Delete Medication', fa: 'حذف دارو' },
  pauseMedication: { en: 'Pause', fa: 'متوقف کردن' },
  reactivateMedication: { en: 'Reactivate', fa: 'فعال‌سازی دوباره' },
  medicationName: { en: 'Medication Name', fa: 'نام دارو' },
  medicationNameRequired: { en: 'Medication name is required', fa: 'نام دارو الزامی است' },
  dosage: { en: 'Dosage', fa: 'مقدار مصرف' },
  reminderTime: { en: 'Reminder Time', fa: 'زمان یادآور' },
  reminderTimeRequired: { en: 'At least one reminder time is required', fa: 'حداقل یک زمان یادآور الزامی است' },
  addTime: { en: 'Add Time', fa: 'افزودن زمان' },
  recurrence: { en: 'Recurrence', fa: 'تکرار' },
  recurrenceDaily: { en: 'Every Day', fa: 'هر روز' },
  recurrenceWeekly: { en: 'Selected Days', fa: 'روزهای انتخاب شده' },
  recurrenceOnce: { en: 'One Time', fa: 'یکباره' },
  selectedDays: { en: 'Selected Days', fa: 'روزهای انتخاب شده' },
  startDate: { en: 'Start Date', fa: 'تاریخ شروع' },
  endDate: { en: 'End Date (optional)', fa: 'تاریخ پایان (اختیاری)' },
  endDateBeforeStartDate: { en: 'End date cannot be before start date', fa: 'تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد' },
  notes: { en: 'Notes', fa: 'یادداشت' },
  saveMedication: { en: 'Save Medication', fa: 'ذخیره دارو' },
  saveChanges: { en: 'Save Changes', fa: 'ذخیره تغییرات' },
  cancel: { en: 'Cancel', fa: 'لغو' },
  confirmDeleteMedication: { en: 'Are you sure you want to delete this medication?', fa: 'آیا از حذف این دارو مطمئن هستید؟' },
  medicationSaved: { en: 'Medication saved successfully', fa: 'دارو با موفقیت ذخیره شد' },
  medicationsDescription: { en: 'Manage your medications and reminder schedule', fa: 'مدیریت داروها و برنامه یادآور' },
  addMedicationDescription: { en: 'Fill in the details below to add a new medication reminder', fa: 'برای افزودن یک یادآور دارو جدید، جزئیات زیر را پر کنید' },
  editMedicationDescription: { en: 'Modify the medication details below', fa: 'جزئیات دارو را در ویرایش کنید' },
  noMedicationsYet: { en: 'No medications added yet', fa: 'هنوز دارویی اضافه نشده است' },
  medicationActive: { en: 'Active', fa: 'فعال' },
  medicationPaused: { en: 'Paused', fa: 'متوقف شده' },
  // Medication form validation & feedback
  errorMedicationNameRequired: { en: 'Medication name is required', fa: 'نام دارو الزامی است' },
  errorReminderTimeRequired: { en: 'At least one reminder time is required', fa: 'حداقل یک زمان یادآور الزامی است' },
  errorDuplicateReminderTime: { en: 'Remove duplicate reminder times', fa: 'زمان‌های یادآور تکراری را حذف کنید' },
  errorSelectWeekday: { en: 'Select at least one day', fa: 'حداقل یک روز را انتخاب کنید' },
  errorInvalidDateRange: { en: 'End date must be on or after start date', fa: 'تاریخ پایان باید بعد از یا برابر با تاریخ شروع باشد' },
  medicationUpdated: { en: 'Medication updated.', fa: 'دارو به‌روزرسانی شد.' },
  medicationAdded: { en: 'Medication added.', fa: 'دارو اضافه شد.' },
  errorSaveMedication: { en: 'Could not save this medication. Please try again.', fa: 'نمی‌توان این دارو را ذخیره کرد. لطفاً دوباره تلاش کنید.' },
  medicationDeleted: { en: 'Medication deleted.', fa: 'دارو حذف شد.' },
  errorDeleteMedication: { en: 'Could not delete this medication.', fa: 'نمی‌توان این دارو را حذف کرد.' },
  manageMedicationDescription: { en: 'Manage medication reminders and schedules.', fa: 'یادآورها و برنامه‌های دارویی را مدیریت کنید.' },
  medicationFormDescription: { en: 'Enter the medication details and reminder schedule.', fa: 'جزئیات دارو و برنامه یادآور را وارد کنید.' },
  close: { en: 'Close', fa: 'بستن' },
  medicationNamePlaceholder: { en: 'e.g. Medication name', fa: 'مثلاً نام دارو' },
  dosagePlaceholder: { en: 'e.g. As prescribed', fa: 'مثلاً طبق نسخه' },
  removeTime: { en: 'Remove time', fa: 'حذف زمان' },
  selectDays: { en: 'Choose days', fa: 'انتخاب روزها' },
  optional: { en: 'optional', fa: 'اختیاری' },
  medicationsCountLabel: { en: 'medication(s)', fa: 'دارو(ها)' },
  noMedicationsDescription: { en: 'Add a medication to create its reminder schedule.', fa: 'برای ایجاد برنامه یادآور، یک دارو اضافه کنید.' },
  medicationAcknowledgementDisclaimer: { en: 'Acknowledging a reminder only records that the reminder was acknowledged. It does not confirm that medication was taken.', fa: 'تأیید دریافت یادآور فقط ثبت می‌کند که یادآور تأیید شده است. ingestion دارو را تایید نمی‌کند.' },
  resetDemoData: { en: 'Reset demo data', fa: 'بازنشانی داده‌های نمایشی' },
  confirmResetDemo: { en: 'This will reset all demo data to the original synthetic dataset. Continue?', fa: 'این عملیات تمام داده‌های نمایشی را به مجموعه مصنوعی اصلی بازمی‌گرداند. ادامه می‌دهید؟' },
  // Smartwatch / device connection (demo)
  smartwatch: { en: 'Smartwatch', fa: 'ساعت هوشمند' },
  smartwatchStatus: { en: 'Device Status', fa: 'وضعیت دستگاه' },
  lastSync: { en: 'Last Sync', fa: 'آخرین همگام‌سازی' },
  disconnect: { en: 'Disconnect', fa: 'قطع اتصال' },
  meditation: { en: 'Meditation', fa: 'مدیتیشن' },
  // Days of week
  daySun: { en: 'Sun', fa: 'یک‌شنبه' },
  dayMon: { en: 'Mon', fa: 'دوشنبه' },
  dayTue: { en: 'Tue', fa: 'سه‌شنبه' },
  dayWed: { en: 'Wed', fa: 'چهارشنبه' },
  dayThu: { en: 'Thu', fa: 'پنج‌شنبه' },
  dayFri: { en: 'Fri', fa: 'جمعه' },
  daySat: { en: 'Sat', fa: 'شنبه' },
  // Wellbeing history
  wellbeingHistory: { en: 'Wellbeing History', fa: 'تاریخچه وضعیت' },
  noWellbeingEntries: { en: 'No wellbeing entries yet.', fa: 'هنوز هیچ ثبت وضعیتی وجود ندارد.' },
  moodHistory: { en: 'Mood History', fa: 'تاریخچه مزاج' },
  note: { en: 'Note (optional)', fa: 'یادداشت (اختیاری)' },
  enterNote: { en: 'Enter a note...', fa: 'یک یادداشت بنویسید...' },
  moodSelected: { en: 'Mood: {mood}', fa: 'مزاج: {mood}' },
  energySelected: { en: 'Energy: {energy}', fa: 'انرژی: {energy}' },
  sharedWithCaregiverShort: { en: 'Shared with caregiver', fa: 'به اشتراک گذاشته شده با مراقب' },
  privateEntry: { en: 'Private entry', fa: 'ثبت خصوصی' },
  scheduleView: { en: 'Schedule View', fa: 'نمای برنامه' },
  upcomingReminders: { en: 'Upcoming Reminders', fa: 'یادآورهای آینده' },
  noUpcomingReminders: { en: 'No upcoming reminders.', fa: 'هیچ یادآور آینده‌ای وجود ندارد.' },
  instanceStatus: { en: 'Status', fa: 'وضعیت' },
};

const STORAGE_KEY = 'carely_lang';

function loadLang(): Lang {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'en' || raw === 'fa') return raw as Lang;
    return 'fa';
  } catch {
    return 'fa';
  }
}

function saveLang(lang: Lang): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // ignore
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => loadLang());

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    saveLang(next);
  }, []);

  const t = useCallback((key: string, vars?: Record<string, string | number>) => {
    let text = translations[key]?.[lang] || translations[key]?.en || key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return text;
  }, [lang]);

  const isRTL = lang === 'fa';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLang must be used within a LanguageProvider');
  }
  return context;
};
