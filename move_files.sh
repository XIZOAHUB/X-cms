#!/bin/bash
mv src/components/AuthScreen.tsx src/components/auth/
mv src/components/Dashboard.tsx src/components/dashboard/
mv src/components/FileManager.tsx src/components/content/
mv src/components/BlogCMS.tsx src/components/content/
mv src/components/GitTimeline.tsx src/components/content/
mv src/components/AiAssistant.tsx src/components/editor/
mv src/components/PythonStudio.tsx src/components/editor/
mv src/components/MediaLibrary.tsx src/components/media/
mv src/components/CloudflareManager.tsx src/components/deploy/
mv src/components/BackupsManager.tsx src/components/deploy/
mv src/components/WebsiteManager.tsx src/components/settings/
mv src/components/SeoSuite.tsx src/components/settings/
mv src/components/ThemeOptimizer.tsx src/components/settings/
mv src/components/PluginManager.tsx src/components/settings/
mv src/components/AutomationSuite.tsx src/components/settings/
mv src/components/AnalyticsDashboard.tsx src/components/settings/
mv src/components/HelpHub.tsx src/components/settings/
mv src/components/AuditLogs.tsx src/components/settings/
mv src/components/BottomNav.tsx src/components/ui/
mv src/components/TerminalPanel.tsx src/components/ui/
mv src/components/RepositoriesView.tsx src/components/ui/

mv src/lib/github.ts src/services/githubApi.ts
rmdir src/lib

mv src/types.ts src/types/index.ts

# Fix App.tsx imports
sed -i 's|./components/AuthScreen|./components/auth/AuthScreen|g' src/App.tsx
sed -i 's|./components/Dashboard|./components/dashboard/Dashboard|g' src/App.tsx
sed -i 's|./components/FileManager|./components/content/FileManager|g' src/App.tsx
sed -i 's|./components/BlogCMS|./components/content/BlogCMS|g' src/App.tsx
sed -i 's|./components/GitTimeline|./components/content/GitTimeline|g' src/App.tsx
sed -i 's|./components/AiAssistant|./components/editor/AiAssistant|g' src/App.tsx
sed -i 's|./components/PythonStudio|./components/editor/PythonStudio|g' src/App.tsx
sed -i 's|./components/MediaLibrary|./components/media/MediaLibrary|g' src/App.tsx
sed -i 's|./components/CloudflareManager|./components/deploy/CloudflareManager|g' src/App.tsx
sed -i 's|./components/BackupsManager|./components/deploy/BackupsManager|g' src/App.tsx
sed -i 's|./components/WebsiteManager|./components/settings/WebsiteManager|g' src/App.tsx
sed -i 's|./components/SeoSuite|./components/settings/SeoSuite|g' src/App.tsx
sed -i 's|./components/ThemeOptimizer|./components/settings/ThemeOptimizer|g' src/App.tsx
sed -i 's|./components/PluginManager|./components/settings/PluginManager|g' src/App.tsx
sed -i 's|./components/AutomationSuite|./components/settings/AutomationSuite|g' src/App.tsx
sed -i 's|./components/AnalyticsDashboard|./components/settings/AnalyticsDashboard|g' src/App.tsx
sed -i 's|./components/HelpHub|./components/settings/HelpHub|g' src/App.tsx
sed -i 's|./components/AuditLogs|./components/settings/AuditLogs|g' src/App.tsx
sed -i 's|./components/BottomNav|./components/ui/BottomNav|g' src/App.tsx
sed -i 's|./components/TerminalPanel|./components/ui/TerminalPanel|g' src/App.tsx
sed -i 's|./components/RepositoriesView|./components/ui/RepositoriesView|g' src/App.tsx

sed -i 's|./types|./types/index|g' src/App.tsx

# Fix imports in components
find src/components -type f -name "*.tsx" -exec sed -i 's|\.\./types|\.\./\.\./types/index|g' {} +
find src/components -type f -name "*.tsx" -exec sed -i 's|\.\./lib/github|\.\./\.\./services/githubApi|g' {} +

