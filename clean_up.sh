#!/bin/bash
rm -f src/components/settings/SeoSuite.tsx
rm -f src/components/settings/PluginManager.tsx
rm -f src/components/settings/ThemeOptimizer.tsx
rm -f src/components/settings/AutomationSuite.tsx
rm -f src/components/settings/AnalyticsDashboard.tsx
rm -f src/components/ui/TerminalPanel.tsx
rm -f src/components/editor/PythonStudio.tsx
rm -f src/components/deploy/BackupsManager.tsx
rm -f src/components/settings/AuditLogs.tsx

sed -i '/import SeoSuite/d' src/App.tsx
sed -i '/import PluginManager/d' src/App.tsx
sed -i '/import ThemeOptimizer/d' src/App.tsx
sed -i '/import AutomationSuite/d' src/App.tsx
sed -i '/import AnalyticsDashboard/d' src/App.tsx
sed -i '/import TerminalPanel/d' src/App.tsx
sed -i '/import PythonStudio/d' src/App.tsx
sed -i '/import BackupsManager/d' src/App.tsx
sed -i '/import AuditLogs/d' src/App.tsx

sed -i '/case "seo":/,+1d' src/App.tsx
sed -i '/case "plugins":/,+1d' src/App.tsx
sed -i '/case "theme_optimizer":/,+1d' src/App.tsx
sed -i '/case "automation":/,+1d' src/App.tsx
sed -i '/case "analytics":/,+1d' src/App.tsx
sed -i '/case "terminal":/,+1d' src/App.tsx
sed -i '/case "python_studio":/,+1d' src/App.tsx
sed -i '/case "backups":/,+1d' src/App.tsx
sed -i '/case "logs":/,+1d' src/App.tsx
