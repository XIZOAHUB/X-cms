# AuroraCMS

AuroraCMS is a mobile-first, GitHub-native Headless Content Management System. It runs entirely in your browser using React and Vite.

## Features
- **Zero Backend**: Directly connects to GitHub API to read/write files and Cloudflare API to trigger deployments.
- **AI Assistant**: Built-in Gemini AI content specialist for generating and optimizing blogs, SEO, and configurations.
- **Theme Optimizer**: Live preview and modify CSS variables for your frontend.
- **Plugin Manager**: Install enhancements like SEO tools and Analytics natively.
- **Cloudflare Integration**: Push deployments natively from the CMS without leaving the interface.

## Tech Stack
- React 18
- Vite
- Tailwind CSS
- TypeScript
- Lucide Icons
- (Optional: Zustand, Axios, React Router v6)

## Setup
1. Clone the repository.
2. Run \`npm install\` to install dependencies.
3. Start the dev server: \`npm run dev\`

## Architecture
The application runs as a static Single Page Application (SPA). It uses Personal Access Tokens (PAT) provided by the user locally to authenticate with the GitHub API. No secrets are stored on the server.
