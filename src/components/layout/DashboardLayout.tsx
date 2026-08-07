import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuthStore } from '../../store/authStore';

export const DashboardLayout = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = location.pathname.split('/')[1] || 'dashboard';

  return (
    <div className="flex h-screen bg-[#fdfbf7] overflow-hidden text-gray-900 font-sans">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab: string) => navigate(`/${tab}`)} 
        profile={{ username: user?.username, avatarUrl: user?.avatarUrl }} 
      />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 border-b border-[#e6e2d6] bg-white flex items-center px-6 shrink-0 md:hidden">
          <h2 className="font-bold text-gray-900">AuroraCMS</h2>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

  // Available
