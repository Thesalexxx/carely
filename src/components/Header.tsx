import { Heart, Menu, Bell, User, Globe } from 'lucide-react'
import { HTMLAttributes } from 'react'
import { useLang } from '../context/LanguageContext'

interface HeaderProps extends HTMLAttributes<HTMLDivElement> {
  userRole: 'older-adult' | 'caregiver'
  onMenuToggle?: () => void
  isMenuOpen?: boolean
}

export const Header = ({ userRole, onMenuToggle, isMenuOpen }: HeaderProps) => {
  const { t, lang, setLang } = useLang()

  return (
    <header className="bg-white shadow-soft border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <button
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              onClick={onMenuToggle}
              aria-label={t('language')}
              aria-expanded={isMenuOpen === true}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-2">
              <Heart className="w-8 h-8 text-primary-600" />
              <h1 className="text-2xl font-heading font-bold text-gray-900">{t('appName')}</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <User className="w-5 h-5" />
            </button>
            <button
              className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              onClick={() => setLang(lang === 'en' ? 'fa' : 'en')}
              aria-label={t('language')}
              title={lang === 'en' ? t('persian') : t('english')}
            >
              <Globe className="w-5 h-5" />
            </button>
            <div className="hidden md:block">
              <span className="text-sm text-gray-600">
                {userRole === 'older-adult' ? t('olderAdult') : t('caregiver')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}