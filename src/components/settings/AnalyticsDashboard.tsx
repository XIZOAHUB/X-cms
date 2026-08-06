import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  RefreshCw,
  Activity,
} from "lucide-react";

export default function AnalyticsDashboard() {
  const [realtimeUsers, setRealtimeUsers] = useState(12);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d");

  // Tick the real-time active users count randomly to simulate active traffic
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeUsers((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        const next = prev + delta;
        return next < 3 ? 3 : next > 28 ? 24 : next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const trafficData = {
    "7d": [
      { label: "Mon", views: 420, visitors: 310 },
      { label: "Tue", views: 580, visitors: 400 },
      { label: "Wed", views: 710, visitors: 520 },
      { label: "Thu", views: 640, visitors: 480 },
      { label: "Fri", views: 820, visitors: 610 },
      { label: "Sat", views: 510, visitors: 390 },
      { label: "Sun", views: 600, visitors: 450 },
    ],
    "30d": [
      { label: "Week 1", views: 2400, visitors: 1800 },
      { label: "Week 2", views: 3100, visitors: 2200 },
      { label: "Week 3", views: 4500, visitors: 3100 },
      { label: "Week 4", views: 3800, visitors: 2700 },
    ],
    "90d": [
      { label: "Apr", views: 12000, visitors: 8500 },
      { label: "May", views: 15400, visitors: 11200 },
      { label: "Jun", views: 18900, visitors: 13400 },
    ],
  };

  const topPages = [
    { path: "/index.html", title: "Home Page", views: 1420, percentage: 48 },
    { path: "/blog/my-first-post.html", title: "My First Article", views: 850, percentage: 28 },
    { path: "/about.html", title: "About Me & Projects", views: 430, percentage: 14 },
    { path: "/contact.html", title: "Get in Touch", views: 310, percentage: 10 },
  ];

  const devices = [
    { type: "Desktop", count: "64%", icon: Monitor, color: "#2f81f7" },
    { type: "Mobile", count: "31%", icon: Smartphone, color: "#238636" },
    { type: "Tablet", count: "5%", icon: Tablet, color: "#d29922" },
  ];

  const currentTraffic = trafficData[timeRange];
  const maxVal = Math.max(...currentTraffic.map((d) => d.views)) * 1.15;

  return (
    <div className="space-y-6 pb-24" id="analytics-dashboard-module">
      {/* Module Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="text-[#2F81F7]" size={22} />
            <span>Site Analytics Suite</span>
          </h2>
          <p className="text-xs text-gray-500">
            Live tracking, device distribution, and performance metrics for your deployed GitHub Pages.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Time range selector */}
          <div className="flex bg-white border border-[#e6e2d6] p-0.5 rounded-lg text-xs">
            {(["7d", "30d", "90d"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  timeRange === r
                    ? "bg-[#f0ece1] text-[#58a6ff] border border-[#e6e2d6]"
                    : "text-gray-500 hover:text-gray-900 border border-transparent"
                }`}
              >
                {r === "7d" ? "7 Days" : r === "30d" ? "30 Days" : "90 Days"}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            className="p-1.5 bg-white border border-[#e6e2d6] hover:border-[#8b949e] rounded-lg text-gray-700 hover:text-gray-900 transition-all"
            title="Refresh statistics"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Main Metrics Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Real-time Monitor card */}
        <div className="bg-[#f8f6f0] border border-[#e6e2d6] p-4 rounded-xl flex flex-col justify-between h-28 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Visitors</span>
            <span className="flex items-center gap-1.5 text-[10px] text-[#238636] font-mono font-bold bg-[#2386361a] border border-[#23863640] px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#238636] animate-pulse" />
              <span>LIVE</span>
            </span>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-gray-900 leading-none tracking-tight">
              {isRefreshing ? "..." : realtimeUsers}
            </span>
            <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
              <Activity size={10} className="text-[#238636]" />
              <span>Viewing index.html & blogs</span>
            </p>
          </div>
        </div>

        {/* Total Page Views */}
        <div className="bg-[#f8f6f0] border border-[#e6e2d6] p-4 rounded-xl flex flex-col justify-between h-28">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Page Views</span>
            <TrendingUp size={16} className="text-[#2f81f7]" />
          </div>
          <div>
            <span className="text-3xl font-extrabold text-gray-900 leading-none tracking-tight">
              {isRefreshing ? "..." : timeRange === "7d" ? "4.26K" : timeRange === "30d" ? "13.8K" : "46.3K"}
            </span>
            <p className="text-[10px] text-[#238636] mt-1 flex items-center gap-0.5 font-semibold">
              <ArrowUpRight size={12} />
              <span>+14.2% since last week</span>
            </p>
          </div>
        </div>

        {/* Unique Visitors */}
        <div className="bg-[#f8f6f0] border border-[#e6e2d6] p-4 rounded-xl flex flex-col justify-between h-28">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Unique Visitors</span>
            <Users size={16} className="text-purple-400" />
          </div>
          <div>
            <span className="text-3xl font-extrabold text-gray-900 leading-none tracking-tight">
              {isRefreshing ? "..." : timeRange === "7d" ? "3.11K" : timeRange === "30d" ? "9.8K" : "33.1K"}
            </span>
            <p className="text-[10px] text-[#238636] mt-1 flex items-center gap-0.5 font-semibold">
              <ArrowUpRight size={12} />
              <span>+8.4% growth</span>
            </p>
          </div>
        </div>

        {/* Bounce Rate */}
        <div className="bg-[#f8f6f0] border border-[#e6e2d6] p-4 rounded-xl flex flex-col justify-between h-28">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Bounce Rate</span>
            <Clock size={16} className="text-[#d29922]" />
          </div>
          <div>
            <span className="text-3xl font-extrabold text-gray-900 leading-none tracking-tight">
              {isRefreshing ? "..." : "41.2%"}
            </span>
            <p className="text-[10px] text-[#da3633] mt-1 flex items-center gap-0.5 font-semibold">
              <ArrowDownRight size={12} />
              <span>-1.8% decrement (better)</span>
            </p>
          </div>
        </div>
      </div>

      {/* Traffic Charts & Page Views Breakdown split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Traffic SVG Area */}
        <div className="bg-white border border-[#e6e2d6] rounded-xl p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Views & Visitors Overview</h3>
            <div className="flex items-center gap-3 text-[10px] font-semibold">
              <span className="flex items-center gap-1 text-[#2f81f7]">
                <span className="w-2 h-2 rounded-full bg-[#2f81f7]" /> Views
              </span>
              <span className="flex items-center gap-1 text-[#58a6ff]/50">
                <span className="w-2 h-2 rounded-full bg-[#58a6ff]/50" /> Visitors
              </span>
            </div>
          </div>

          {/* Interactive SVG Chart */}
          <div className="h-56 w-full relative pt-2">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              <line x1="0" y1="40" x2="500" y2="40" stroke="#30363d" strokeDasharray="3 3" />
              <line x1="0" y1="90" x2="500" y2="90" stroke="#30363d" strokeDasharray="3 3" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="#30363d" strokeDasharray="3 3" />
              <line x1="0" y1="180" x2="500" y2="180" stroke="#30363d" />

              {/* Views Path (Blue) */}
              <path
                d={currentTraffic
                  .map((d, i) => {
                    const x = (i / (currentTraffic.length - 1)) * 500;
                    const y = 180 - (d.views / maxVal) * 140;
                    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                  })
                  .join(" ")}
                fill="none"
                stroke="#2f81f7"
                strokeWidth="2.5"
                className="transition-all duration-500"
              />

              {/* Visitors Path (Muted Blue/Teal) */}
              <path
                d={currentTraffic
                  .map((d, i) => {
                    const x = (i / (currentTraffic.length - 1)) * 500;
                    const y = 180 - (d.visitors / maxVal) * 140;
                    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                  })
                  .join(" ")}
                fill="none"
                stroke="#58a6ff"
                strokeOpacity="0.4"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                className="transition-all duration-500"
              />

              {/* Interactive nodes */}
              {currentTraffic.map((d, i) => {
                const x = (i / (currentTraffic.length - 1)) * 500;
                const y = 180 - (d.views / maxVal) * 140;
                return (
                  <g key={i} className="group/node cursor-pointer">
                    <circle
                      cx={x}
                      cy={y}
                      r="4"
                      className="fill-[#161b22] stroke-[#2f81f7] stroke-[2] transition-transform group-hover/node:scale-125"
                    />
                    <text
                      x={x}
                      y={y - 12}
                      textAnchor="middle"
                      className="text-[10px] font-mono fill-white opacity-0 group-hover/node:opacity-100 transition-opacity bg-[#fdfbf7] py-0.5 px-1 rounded"
                    >
                      {d.views}
                    </text>
                  </g>
                );
              })}

              {/* X Axis Labels */}
              {currentTraffic.map((d, i) => {
                const x = (i / (currentTraffic.length - 1)) * 500;
                return (
                  <text
                    key={i}
                    x={x}
                    y="196"
                    textAnchor="middle"
                    className="text-[9px] font-mono fill-[#8b949e]"
                  >
                    {d.label}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Device breakdown & Geolocation */}
        <div className="bg-white border border-[#e6e2d6] rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Device Breakdown</h3>
          <div className="space-y-4 pt-1">
            {devices.map((dev) => {
              const DevIcon = dev.icon;
              return (
                <div key={dev.type} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-2 text-gray-900">
                      <DevIcon size={14} style={{ color: dev.color }} />
                      <span>{dev.type}</span>
                    </span>
                    <span className="font-mono text-gray-500">{dev.count}</span>
                  </div>
                  {/* Progress bar line */}
                  <div className="w-full h-1.5 bg-[#fdfbf7] rounded-full overflow-hidden border border-[#e6e2d6]/40">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: dev.count,
                        backgroundColor: dev.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#e6e2d6]/50 space-y-2">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <Globe size={12} />
              <span>Top Geolocations</span>
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-900">
                <span>🇺🇸 United States</span>
                <span className="font-mono text-gray-500">48.3%</span>
              </div>
              <div className="flex justify-between text-gray-900">
                <span>🇮🇳 India</span>
                <span className="font-mono text-gray-500">22.1%</span>
              </div>
              <div className="flex justify-between text-gray-900">
                <span>🇩🇪 Germany</span>
                <span className="font-mono text-gray-500">8.4%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Pages view count and referral logs */}
      <div className="bg-white border border-[#e6e2d6] rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <span>Most Visited Web Pages</span>
          <span className="text-[10px] font-mono text-gray-500 bg-[#f0ece1] px-2 py-0.5 border border-[#e6e2d6] rounded-md">
            URL Paths
          </span>
        </h3>
        <div className="divide-y divide-[#30363d]/50">
          {topPages.map((page) => (
            <div key={page.path} className="py-3 flex items-center justify-between text-xs gap-4">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900 truncate">{page.title}</p>
                <p className="font-mono text-gray-500 truncate mt-0.5">{page.path}</p>
              </div>
              <div className="flex items-center gap-4 shrink-0 font-mono">
                <div className="text-right">
                  <p className="font-bold text-gray-900">{page.views} Views</p>
                  <p className="text-[10px] text-[#238636] font-semibold">{page.percentage}% of site traffic</p>
                </div>
                {/* Visual bar mini */}
                <div className="w-12 h-1.5 bg-[#fdfbf7] border border-[#e6e2d6]/40 rounded-full hidden sm:block overflow-hidden">
                  <div
                    className="h-full bg-[#2f81f7]"
                    style={{ width: `${page.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
