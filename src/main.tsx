import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import App from './App'
import './index.css'

// Remove loader when React mounts
const removeLoader = () => {
  const loader = document.getElementById('loader')
  if (loader) {
    loader.classList.add('hidden')
    setTimeout(() => loader.remove(), 500)
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            border: '1px solid #334155',
            color: '#e2e8f0'
          }
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)

// Remove loader after mount
removeLoader()
