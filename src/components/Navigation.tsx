import { NavLink } from 'react-router-dom'
import { Heart, Users } from 'lucide-react'
import { useLang } from '../context/LanguageContext'

export const Navigation = () => {
  const { t } = useLang()

  return (
    <nav className="bg-white shadow-soft border-b border-gray-200 sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          <NavLink
            to="/older-adult/my-day"
            className={({ isActive }) =>
              `flex items-center space-x-2 py-4 px-1 border-b-2 transition-colors ${
                isActive
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`
            }
          >
            <Heart className="w-5 h-5" />
            <span className="font-medium">{t('olderAdult')}</span>
          </NavLink>

          <NavLink
            to="/caregiver/overview"
            className={({ isActive }) =>
              `flex items-center space-x-2 py-4 px-1 border-b-2 transition-colors ${
                isActive
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`
            }
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">{t('caregiver')}</span>
          </NavLink>
        </div>
      </div>
    </nav>
  )
}