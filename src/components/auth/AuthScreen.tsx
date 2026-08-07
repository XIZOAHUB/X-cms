import React, { useEffect } from "react";
import { Github, Lock, Shield, Server, Zap } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

export default function AuthScreen() {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogin = () => {
    // Redirect to the backend OAuth proxy upafye
    window.location.href = "/api/auth/github";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f6f8fa] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fa] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-gray-700">
            <Github size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mt-3">AuroraCMS Pro</h1>
          <p className="text-gray-500 mt-2 text-sm">Enterprise-grade serverless headless CMS</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e6e2d6] overflow-hidden">
          <div className="p-8">
            <button
              onClick={handleLogin}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-3 group"
            >
              <Github size={20} className="group-hover:scale-110 transition-transform" />
              Sign in with GitHub
            </button>
            <p className="text-center text-xs text-gray-500 mt-4">
              We only request access to public and private repositories you choose.
            </p>
          </div>
          
          <div className="bg-gray-50 px-8 py-5 border-t border-[#e6e2d6]">
            <div className="flex items-center justify-center gap-6 text-gray-400">
              <div className="flex items-center gap-1.5" title="End-to-end Encrypted">
                <Lock size={14} />
                <span className="text-[10px] uppercase font-bold tracking-wider">Secure</span>
              </div>
              <div className="flex items-center gap-1.5" title="No tokens in browser">
                <Shield size={14} />
                <span className="text-[10px] uppercase font-bold tracking-wider">Private</span>
              </div>
              <div className="flex items-center gap-1.5" title="Cloudflare Functions Backend">
                <Server size={14} />
                <span className="text-[10px] uppercase font-bold tracking-wider">Serverless</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
