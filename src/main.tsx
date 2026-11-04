import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { CareProvider } from './context/CareContext'
import { LanguageProvider } from './context/LanguageContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CareProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </CareProvider>
  </React.StrictMode>
)