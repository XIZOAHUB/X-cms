#!/bin/bash
# We will just rewrite the tabs array to remove fake things in App.tsx   // Available
sed -i '/id: "seo"/d' src/App.tsx
sed -i '/id: "plugins"/d' src/App.tsx
sed -i '/id: "theme_optimizer"/d' src/App.tsx
sed -i '/id: "automation"/d' src/App.tsx
sed -i '/id: "analytics"/d' src/App.tsx
sed -i '/id: "terminal"/d' src/App.tsx
sed -i '/id: "python_studio"/d' src/App.tsx
sed -i '/id: "backups"/d' src/App.tsx
sed -i '/id: "logs"/d' src/App.tsx

# Also remove the switch cases for them (they won't be reachable anyway, but let's be clean)
# Actually just leaving them unreachable is fine, but it might complain about unused imports.

