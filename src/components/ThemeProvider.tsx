import { createContext, useContext, ReactNode } from 'react'

interface ThemeContextType {
  theme: 'light'
}

const ThemeContext = createContext<ThemeContextType>({ theme: 'light' })

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const value = { theme: 'light' as const }
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}