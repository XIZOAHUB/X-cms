import React, { useState } from "react";
import {
  HelpCircle,
  BookOpen,
  Settings,
  GitBranch,
  Sparkles,
  Search,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

export default function HelpHub() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [troubleStep, setTroubleStep] = useState(0);

  const guides = [
    {
      title: "Connecting Your Static Site",
      desc: "Paste your Github Personal Access Token (classic or fine-grained) with 'repo' and 'workflow' privileges. AuroraCMS reads your directory automatically.",
    },
    {
      title: "Structuring Your Blogs",
      desc: "Articles must reside in 'blog/' or '_posts/' as markdown (.md) files. Frontmatter must contain title, slug, tags, categories, cover image, and published state.",
    },
    {
      title: "Using AI Page Generation",
      desc: "Tap AI Studio or page templates. Type a topic like 'About Me Page' or 'TOS HTML'. Tap 'Generate' to call Gemini server-side, review drafts, and commit instantly.",
    },
  ];

  const faqs = [
    {
      q: "Why is my Github Page not showing my live edits instantly?",
      a: "Github Pages takes 1 to 2 minutes to compile and deploy your commits using Github Actions. You can check the progress of the deployment build pipeline in the 'Git Activity' tab or directly on your repository Actions tab on GitHub.",
    },
    {
      q: "What permissions does my Personal Access Token require?",
      a: "The PAT must have the 'repo' scope. If you want automatic workflows or advanced webhook registration, please ensure the token also has 'workflow' or 'admin:repo_hook' checkboxes active.",
    },
    {
      q: "Are my API keys and secrets stored securely?",
      a: "Yes. All access tokens and local configurations are held in your browser's private localStorage. No secrets are ever persisted on our servers. Gemini queries are proxied via a secure, server-side-only endpoint.",
    },
  ];

  return (
    <div className="space-y-6 pb-24" id="help-hub-module">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <HelpCircle className="text-[#2F81F7]" size={22} />
          <span>AuroraCMS Knowledge & Support Hub</span>
        </h2>
        <p className="text-xs text-gray-500">
          Find comprehensive documentation, interactive guides, FAQs, and a live troubleshooting wizard.
        </p>
      </div>

      {/* Quick Start Blueprints */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {guides.map((g, idx) => (
          <div key={idx} className="bg-white border border-[#e6e2d6] rounded-xl p-4 space-y-2 flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-mono font-bold">
                STEP 0{idx + 1}
              </span>
              <h3 className="text-sm font-bold text-gray-900">{g.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{g.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Troubleshooting Wizard */}
      <div className="bg-[#f8f6f0] border border-[#e6e2d6] rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <ShieldAlert className="text-[#d29922]" size={16} />
          <span>Interactive Troubleshooting Wizard</span>
        </h3>

        {troubleStep === 0 && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">Select what problem you are currently encountering:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => setTroubleStep(1)}
                className="p-3 bg-white hover:bg-[#f0ece1] border border-[#e6e2d6] rounded-lg text-left text-xs text-gray-900 transition-all"
              >
                🔴 Connection fails or invalid Personal Access Token
              </button>
              <button
                onClick={() => setTroubleStep(2)}
                className="p-3 bg-white hover:bg-[#f0ece1] border border-[#e6e2d6] rounded-lg text-left text-xs text-gray-900 transition-all"
              >
                🟡 Newly saved files are not displaying on my live site
              </button>
              <button
                onClick={() => setTroubleStep(3)}
                className="p-3 bg-white hover:bg-[#f0ece1] border border-[#e6e2d6] rounded-lg text-left text-xs text-gray-900 transition-all"
              >
                🟣 Gemini AI generation returned an error
              </button>
            </div>
          </div>
        )}

        {troubleStep === 1 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-900">Connection / PAT troubleshooting</h4>
            <div className="text-xs text-gray-500 space-y-2 leading-relaxed">
              <p>1. Open your <strong>GitHub Settings &gt; Developer Settings &gt; Personal Access Tokens (classic)</strong>.</p>
              <p>2. Verify that the <strong>'repo'</strong> scope checkbox is ticked. This is critical for CMS read/write.</p>
              <p>3. If you get a 401 error, try regenerating the token. Token formats should start with <code className="font-mono text-gray-300">ghp_</code>.</p>
            </div>
            <button
              onClick={() => setTroubleStep(0)}
              className="text-xs text-[#58a6ff] hover:underline"
            >
              &larr; Back to Selection
            </button>
          </div>
        )}

        {troubleStep === 2 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-900">Live changes delay</h4>
            <div className="text-xs text-gray-500 space-y-2 leading-relaxed">
              <p>1. Ensure your index.html or sitemaps are committed to the exact deployment branch listed in top-header.</p>
              <p>2. Commit messages usually trigger a GitHub Actions build which takes <strong>30-90 seconds</strong>.</p>
              <p>3. Hard-refresh your browser tab to skip caching: <kbd className="font-mono text-gray-300">Ctrl + F5</kbd> or <kbd className="font-mono text-gray-300">Cmd + Shift + R</kbd>.</p>
            </div>
            <button
              onClick={() => setTroubleStep(0)}
              className="text-xs text-[#58a6ff] hover:underline"
            >
              &larr; Back to Selection
            </button>
          </div>
        )}

        {troubleStep === 3 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-900">Gemini AI model issues</h4>
            <div className="text-xs text-gray-500 space-y-2 leading-relaxed">
              <p>1. Verify that your server environment variable <code className="font-mono text-gray-300">GEMINI_API_KEY</code> is correctly configured.</p>
              <p>2. Ensure your topics are descriptive enough. Very short topics may cause safety filters or truncation parameters to block output.</p>
            </div>
            <button
              onClick={() => setTroubleStep(0)}
              className="text-xs text-[#58a6ff] hover:underline"
            >
              &larr; Back to Selection
            </button>
          </div>
        )}
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white border border-[#e6e2d6] rounded-xl p-5 space-y-4 shadow-md">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <BookOpen className="text-[#2F81F7]" size={16} />
          <span>Frequently Asked Questions</span>
        </h3>

        <div className="divide-y divide-[#30363d]/50 space-y-1">
          {faqs.map((faq, idx) => {
            const isActive = activeFaq === idx;
            return (
              <div key={idx} className="py-3">
                <button
                  onClick={() => setActiveFaq(isActive ? null : idx)}
                  className="w-full flex items-center justify-between text-left text-xs font-semibold text-gray-900 hover:text-blue-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isActive ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
                </button>
                {isActive && (
                  <p className="text-xs text-gray-500 leading-relaxed mt-2 pl-1 font-sans">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
