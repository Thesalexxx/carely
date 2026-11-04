import { NavLink } from 'react-router-dom'
import { Home, Pill, Heart, Calendar, Users, Activity, Watch } from 'lucide-react'
import { HTMLAttributes } from 'react'
import { useLang } from '../context/LanguageContext'

interface SidebarProps extends HTMLAttributes<HTMLDivElement> {
  userRole: 'older-adult' | 'caregiver'
  onClose?: () => void
}

const olderAdultLinks = [
  { to: '/older-adult/my-day', icon: Home, labelKey: 'myDay' },
  { to: '/older-adult/medications', icon: Pill, labelKey: 'medications' },
  { to: '/older-adult/wellbeing', icon: Heart, labelKey: 'wellbeing' },
  { to: '/older-adult/routine', icon: Calendar, labelKey: 'dailyRoutine' },
  { to: '/older-adult/smartwatch', icon: Watch, labelKey: 'smartwatch' },
  { to: '/older-adult/meditation', icon: Activity, labelKey: 'meditation' }
]

const caregiverLinks = [
  { to: '/caregiver/overview', icon: Users, labelKey: 'caregiverOverview' },
  { to: '/caregiver/monitoring', icon: Activity, labelKey: 'monitoring' }
]

export const Sidebar = ({ userRole, onClose, className, ...rest }: SidebarProps) => {
  const { t } = useLang()
  const links = userRole === 'older-adult' ? olderAdultLinks : caregiverLinks

  const handleLinkClick = () => {
    if (onClose) onClose()
  }

  return (
    <aside
      className={className}
      {...rest}
    >
      <div className="p-6">
        <nav className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-4 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{t(link.labelKey)}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>

      <div className="absolute bottom-0 w-64 p-6 border-t border-gray-200">
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">{t('needHelp')}</h3>
          <p className="text-xs text-gray-600">{t('contactCaregiver')}</p>
        </div>
      </div>
    </aside>
  )
}