import { useNavigate } from 'react-router-dom'
import { Heart, Users } from 'lucide-react'
import { useLang } from '../context/LanguageContext'

export type UserRole = 'older-adult' | 'caregiver'

interface RolePickerProps {
  setRole: (role: UserRole) => void
}

// Full-screen role choice shown only when no role has been selected yet.
// Once a role is chosen, App hides this and shows the normal app navigation.
export const RolePicker = ({ setRole }: RolePickerProps) => {
  const { t } = useLang()
  const navigate = useNavigate()

  const pickRole = (role: UserRole, path: string) => {
    setRole(role)
    navigate(path, { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full px-6 text-center">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 text-primary-600 mb-4">
            <Heart className="w-8 h-8" />
            <h1 className="text-2xl font-bold text-gray-900">{t('appName')}</h1>
          </div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            {t('selectYourRole')}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {t('rolePreferenceSaved')}
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => pickRole('older-adult', '/older-adult/my-day')}
            className="flex w-full items-center justify-center space-x-3 px-5 py-4 rounded-2xl border-2 border-primary-600 bg-primary-50 text-primary-700 font-semibold text-base shadow-sm hover:bg-primary-100 transition-all"
          >
            <Heart className="w-5 h-5" />
            <span>{t('olderAdult')}</span>
          </button>

          <button
            onClick={() => pickRole('caregiver', '/caregiver/overview')}
            className="flex w-full items-center justify-center space-x-3 px-5 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-700 font-semibold text-base shadow-sm hover:bg-gray-50 transition-all"
          >
            <Users className="w-5 h-5" />
            <span>{t('caregiver')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
