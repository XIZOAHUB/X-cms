import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import { LoginPage } from '@components/auth/LoginPage'
import { DashboardLayout } from '@components/layout/DashboardLayout'
import { Dashboard } from '@components/dashboard/Dashboard'
import { FileManager } from '@components/content/FileManager'
import { AiAssistant } from '@components/editor/AiAssistant'
import { CloudflareManager } from '@components/deploy/CloudflareManager'
import { WebsiteManager } from '@components/settings/WebsiteManager' 


function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="aurora-gradient w-12 h-12 rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={user ? <Navigate to="/dashboard" /> : <LoginPage />} 
      />
      <Route 
        path="/" 
        element={user ? <DashboardLayout /> : <Navigate to="/login" />}
      >
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="files/*" element={<FileBrowser />} />
        <Route path="edit/:owner/:repo/*" element={<AiAssistant />} />
        <Route path="deploy" element={<CloudflareManager />} />
        <Route path="settings" element={<WebsiteManager />} />

      </Route>
    </Routes>
  )
}

export default App
