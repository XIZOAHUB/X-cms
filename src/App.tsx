import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuthStore } from './store/authStore'
import LoginPage from './components/auth/LoginPage'
import DashboardLayout from './components/layout/DashboardLayout'
import Dashboard from './components/dashboard/Dashboard'
import FileManager from './components/content/FileManager'
import BlogCMS from './components/content/BlogCMS'
import MediaLibrary from './components/media/MediaLibrary'
import AiAssistant from './components/editor/AiAssistant'
import CloudflareManager from './components/deploy/CloudflareManager'
import WebsiteManager from './components/settings/WebsiteManager'

function App() {
  const { user, isLoading, checkAuth } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const [repo] = useState({
    id: 1,
    name: "aurora-cms",
    owner: user?.username || "demo",
    fullName: `${user?.username || "demo"}/aurora-cms`,
    private: false,
    defaultBranch: "main",
    htmlUrl: `https://github.com/${user?.username || "demo"}/aurora-cms`
  })
  
  const branch = "main"

  if (isLoading) {
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
        <Route path="dashboard" element={<Dashboard repo={repo} branch={branch} onNavigate={(tab) => navigate(`/${tab}`)} />} />
        <Route path="files/*" element={<FileManager repo={repo} branch={branch} />} />
        <Route path="blog/*" element={<BlogCMS repo={repo} branch={branch} />} />
        <Route path="media/*" element={<MediaLibrary repo={repo} branch={branch} />} />
        <Route path="edit/:owner/:repo/*" element={<AiAssistant profile={{ username: user?.username || "", avatarUrl: user?.avatarUrl || "" }} repo={repo} branch={branch} />} />
        <Route path="deploy" element={<CloudflareManager repo={repo} branch={branch} />} />
        <Route path="settings" element={<WebsiteManager repo={repo} branch={branch} />} />
      </Route>
    </Routes>
  )
}

export default App
