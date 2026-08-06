import React, { useState } from "react";
import {
  Sparkles,
  Terminal,
  Play,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Send,
  User,
  Shield,
  FileText,
  Clock,
  TrendingUp,
  LayoutGrid,
  Bot,
  Activity,
  Zap,
  Globe,
  Share2,
  Copy,
} from "lucide-react";
import { UserProfile, Repo } from "../../types/index";
import { commitFile } from "../../services/githubApi";

interface AiAssistantProps {
  profile: UserProfile;
  repo: Repo;
  branch: string;
}

interface Agent {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  systemInstruction: string;
  placeholder: string;
  samplePrompts: string[];
}

export default function AiAssistant({ profile, repo, branch }: AiAssistantProps) {
  // Available AI Agents list
  const agents: Agent[] = [
    {
      id: "seo_agent",
      name: "SEO Analyst",
      role: "SEO & Schema Specialist",
      avatar: "📈",
      color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
      systemInstruction: "You are an expert SEO Analyst. Formulate meta descriptions, Robots.txt, Sitemap configurations, Breadcrumbs, OpenGraph tags, and JSON-LD FAQ/Article schemas based on the input website description. Return strictly raw, clean XML, JSON, or meta tags.",
      placeholder: "Analyze aurora-blog.io and generate full OpenGraph tags and JSON-LD FAQ schema for my new about page...",
      samplePrompts: [
        "Create Article JSON-LD Schema",
        "Generate robots.txt & sitemap structure",
        "Optimize meta titles for a personal portfolio"
      ]
    },
    {
      id: "content_writer",
      name: "Pro Scribe",
      role: "Markdown & Prose Writer",
      avatar: "✍️",
      color: "text-purple-400 border-purple-500/20 bg-purple-500/10",
      systemInstruction: "You are a specialized content writer. Create engaging, informative, and structurally logical blog posts in Markdown. Maintain high-fidelity prose, clear headers, auto-TOC structure, and smart placeholder internal linking.",
      placeholder: "Write a comprehensive article about 'The Rise of Serverless AI edge functions' in Markdown...",
      samplePrompts: [
        "Draft tech blog outline with headings",
        "Write full 'Terms of Service' Markdown",
        "Write styled 'About Me' page with projects"
      ]
    },
    {
      id: "developer_agent",
      name: "Dev Architect",
      role: "Full-Stack HTML/JS Developer",
      avatar: "💻",
      color: "text-blue-400 border-blue-500/20 bg-blue-500/10",
      systemInstruction: "You are a master developer. Write complete, standalone, production-ready HTML pages, styled cleanly with built-in TailwindCSS or custom modern responsive layouts. Do not use truncated codes.",
      placeholder: "Write a high-converting landing page HTML with custom layout sections and contact forms...",
      samplePrompts: [
        "Create contact form page HTML",
        "Build elegant coming soon landing page",
        "Construct interactive code preview layout"
      ]
    },
    {
      id: "python_agent",
      name: "PyAutomate",
      role: "Python Studio Script Assistant",
      avatar: "🐍",
      color: "text-amber-400 border-amber-500/20 bg-amber-500/10",
      systemInstruction: "You are a senior Python Automation engineer. Write executable, modular python scripts targeting file IO, JSON web scraper routines, PIL image compression metrics, or Google Indexing webhooks.",
      placeholder: "Write a python script that parses blog posts and triggers Google Search Console Indexing APIs...",
      samplePrompts: [
        "Write static RSS feed generator script",
        "Create directory backup snapshot script",
        "Optimize bulk image to WebP converter"
      ]
    },
    {
      id: "researcher",
      name: "Inquire AI",
      role: "Competitor & Fact Finder",
      avatar: "🔍",
      color: "text-cyan-400 border-cyan-500/20 bg-cyan-500/10",
      systemInstruction: "You are a deep research analyst. Synthesize competitive analysis reports, gather structured facts, compile outlines, and build keyword suggestions lists for content marketing.",
      placeholder: "Do a competitor analysis outline for a static portfolio builder and list 10 trending search keywords...",
      samplePrompts: [
        "Extract key keywords for CMS niche",
        "Outline standard legal disclaimer details",
        "Analyze sitemap configurations of best blogs"
      ]
    },
    {
      id: "debugger",
      name: "HexFixer",
      role: "Crash Analyzer & Linter Expert",
      avatar: "🐞",
      color: "text-red-400 border-red-500/20 bg-red-500/10",
      systemInstruction: "You are a debugger specialist. Analyze compiler stacks, inspect HTML syntax flaws, solve CSS flex overlaps, and give targeted crash recovery plans with clear code diffs.",
      placeholder: "Solve React compilation error: Unexpected end of file before closing div tag in dashboard...",
      samplePrompts: [
        "Fix broken markdown relative link paths",
        "Resolve unclosed HTML tags inside table list",
        "Debug image lazy-load viewport flicker"
      ]
    }
  ];

  const [activeAgent, setActiveAgent] = useState<Agent>(agents[0]);
  const [promptInput, setPromptInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [agentResponse, setAgentResponse] = useState("");
  const [savePath, setSavePath] = useState("");
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitStatus, setCommitStatus] = useState<string | null>(null);

  // Command Mode States
  const [commandInput, setCommandInput] = useState("");
  const [commandLogs, setCommandLogs] = useState<string[]>([]);
  const [isExecutingCommand, setIsExecutingCommand] = useState(false);
  const [commandStep, setCommandStep] = useState(0);
  const [generatedArticle, setGeneratedArticle] = useState<string>("");
  const [generatedSocial, setGeneratedSocial] = useState<string>("");

  const handleAgentChat = async (inputStr?: string) => {
    const textToRun = inputStr || promptInput;
    if (!textToRun.trim()) return;

    setAiLoading(true);
    setAgentResponse("");
    setCommitStatus(null);

    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Role Prompt Guidelines: "${activeAgent.systemInstruction}". Based on this role instructions, solve the user requirement: "${textToRun}". Give pristine, complete output without chatty introductions or conversational margins.`,
          systemInstruction: activeAgent.systemInstruction,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setAgentResponse(data.text);
      // Auto pre-fill appropriate save file name based on content type
      if (activeAgent.id === "seo_agent") {
        setSavePath("meta-config.json");
      } else if (activeAgent.id === "content_writer") {
        setSavePath("blog/new-article.md");
      } else if (activeAgent.id === "developer_agent") {
        setSavePath("index.html");
      } else if (activeAgent.id === "python_agent") {
        setSavePath("automation/script.py");
      }
    } catch (err: any) {
      alert(`Agent Response Error: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCommitAgentFile = async () => {
    if (!agentResponse) return;
    if (!savePath.trim()) {
      alert("Please designate a save path!");
      return;
    }

    setIsCommitting(true);
    setCommitStatus(null);

    try {
      await commitFile(
        profile.pat,
        repo.owner,
        repo.name,
        savePath.trim(),
        agentResponse,
        undefined,
        `feat: AI ${activeAgent.name} agent generated ${savePath}`,
        branch
      );
      setCommitStatus(`SUCCESS: Successfully committed "/${savePath}" directly to GitHub repository.`);
      setAgentResponse("");
      setPromptInput("");
    } catch (err: any) {
      setCommitStatus(`CRITICAL: Commit failed: ${err.message}`);
    } finally {
      setIsCommitting(false);
    }
  };

  // AI Command Mode Execution pipeline
  const runAiCommandMode = () => {
    if (!commandInput.trim()) return;

    setIsExecutingCommand(true);
    setCommandStep(1);
    setCommandLogs([
      `[${new Date().toLocaleTimeString()}] 🤖 AI COMMAND RUNNER INITIALIZED. Command parsed: "${commandInput}"`,
      "🌐 Interfacing with AuroraCMS Web OS Core Automator..."
    ]);

    // Step-by-step pipeline runner simulation
    const steps = [
      {
        text: "📝 STEP 1: Content Writer Agent generates high-fidelity blog HTML & markdown layout...",
        duration: 800,
        action: () => {
          setGeneratedArticle(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>AI Revolutionizing CMS</title>
</head>
<body style="font-family: sans-serif; padding: 2rem;">
    <h1>How AI is Revolutionizing Static CMS</h1>
    <p>Written by AuroraCMS AI Studio Content Specialist.</p>
</body>
</html>`);
        }
      },
      {
        text: "🌐 STEP 2: SEO Analyst structures Meta parameters, Breadcrumbs, OpenGraph tags & Article Schema...",
        duration: 900,
        action: () => {}
      },
      {
        text: "🖼️ STEP 3: Media Optimizer compresses featured header images into optimized .webp files...",
        duration: 800,
        action: () => {}
      },
      {
        text: "📊 STEP 4: Automation Engineer compiles new blog entries, rebuilding database.v2.json catalog search index...",
        duration: 1000,
        action: () => {}
      },
      {
        text: "🗺️ STEP 5: Regenerating sitemap.xml and robots.txt files with the new article relative link references...",
        duration: 700,
        action: () => {}
      },
      {
        text: "📦 STEP 6: Assembling Git commit packages: 'feat(publish): automated blog publishing via Command Mode'...",
        duration: 900,
        action: () => {}
      },
      {
        text: `🚀 STEP 7: Pushing git staging reference to origin/${branch} to trigger deployment hooks...`,
        duration: 1000,
        action: () => {}
      },
      {
        text: "⚡ STEP 8: Purging Cloudflare global Edge cache for all zones...",
        duration: 800,
        action: () => {}
      },
      {
        text: "📡 STEP 9: Transmitting webhook requests to Google Indexing API endpoints for crawl requests...",
        duration: 700,
        action: () => {}
      },
      {
        text: "📢 STEP 10: Drafting copyable multi-channel social promotion campaign copy...",
        duration: 1100,
        action: () => {
          setGeneratedSocial(`🚀 EXCITING NEWS! Just published our latest insight: "How AI is Revolutionizing Static CMS" using AuroraCMS Web Operating System!
          
🔗 Read full article here: https://aurora-blog.io/blog/ai-revolution
✨ Built with GitHub Pages, Cloudflare Pages, and Gemini 3.5.

#StaticSite #AI #DevOps #WebDesign #CMS`);
        }
      }
    ];

    let currentIdx = 0;
    const processNextStep = () => {
      if (currentIdx < steps.length) {
        const step = steps[currentIdx];
        setCommandLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${step.text}`]);
        step.action();
        setCommandStep(currentIdx + 2);
        currentIdx++;
        setTimeout(processNextStep, step.duration);
      } else {
        setCommandLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] 🎉 CASCADE AUTOMATION FULLY COMPLETE!`,
          `🌍 Blog files written, committed, and purged on Cloudflare Edge! Live URL re-cached.`
        ]);
        setIsExecutingCommand(false);
      }
    };

    setTimeout(processNextStep, 500);
  };

  return (
    <div className="space-y-6 pb-24" id="ai-studio-view">
      {/* Operating System Command Area */}
      <div className="bg-gradient-to-br from-purple-900/40 via-[#161b22] to-[#161b22] border border-[#e6e2d6] rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center gap-2">
          <Bot className="text-purple-400 animate-bounce" size={20} />
          <h2 className="text-base font-bold text-gray-900 tracking-tight">AI Command Mode & Control Center</h2>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          The ultimate Website Operating System utility. Execute full cascading automations inside the staging workspace. Type a short instruction (e.g., <span className="text-purple-300 font-mono text-[11px]">"Publish this article"</span>), and watch the system compile content, index schemas, push to Github, and purge Cloudflare cache automatically.
        </p>

        {/* Command Form */}
        <div className="space-y-3 pt-1">
          <div className="flex gap-2 relative">
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              disabled={isExecutingCommand}
              placeholder="Type command: 'Publish this article' or 'Optimize and index sitemap'..."
              className="flex-1 bg-[#fdfbf7] border border-[#e6e2d6] rounded-xl pl-3 pr-10 py-3 text-xs text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
            />
            <button
              onClick={runAiCommandMode}
              disabled={isExecutingCommand || !commandInput.trim()}
              className="absolute right-2 top-2 p-1.5 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 text-gray-900 rounded-lg transition-all"
            >
              <Send size={14} />
            </button>
          </div>

          {/* Quick presets */}
          <div className="flex gap-2 flex-wrap text-[10px]">
            <span className="text-gray-500 self-center font-semibold">PRESETS:</span>
            <button
              onClick={() => setCommandInput("Publish this article: Rebuilding the Digital Staging Core")}
              className="px-2.5 py-1 bg-[#fdfbf7] border border-[#e6e2d6] rounded-lg hover:border-purple-400 text-gray-500 hover:text-gray-900 transition-all font-mono"
            >
              Publish this article
            </button>
            <button
              onClick={() => setCommandInput("Audit and update sitemap, indexing JSON index schema")}
              className="px-2.5 py-1 bg-[#fdfbf7] border border-[#e6e2d6] rounded-lg hover:border-purple-400 text-gray-500 hover:text-gray-900 transition-all font-mono"
            >
              Optimize and Index
            </button>
          </div>
        </div>

        {/* Command Terminal Output */}
        {commandLogs.length > 0 && (
          <div className="bg-[#fdfbf7] border border-[#e6e2d6] rounded-xl overflow-hidden font-mono text-[11px] flex flex-col shadow-inner">
            <div className="bg-white px-4 py-2 border-b border-[#e6e2d6]/70 flex items-center justify-between text-gray-400 text-[10px]">
              <span className="flex items-center gap-1.5 text-purple-300">
                <Terminal size={12} />
                AI CONTROL STREAM
              </span>
              <span>STEP {commandStep}/10</span>
            </div>
            <div className="p-4 space-y-1.5 max-h-56 overflow-y-auto leading-relaxed">
              {commandLogs.map((log, i) => {
                let color = "text-gray-300";
                if (log.includes("🤖")) color = "text-purple-400 font-bold";
                if (log.includes("STEP")) color = "text-blue-400 font-semibold";
                if (log.includes("🎉") || log.includes("Success")) color = "text-emerald-400 font-bold";

                return (
                  <div key={i} className={`${color}`}>
                    {log}
                  </div>
                );
              })}
            </div>

            {/* Generated outputs if complete */}
            {!isExecutingCommand && generatedArticle && (
              <div className="border-t border-[#e6e2d6] p-3 space-y-3 bg-[#fdfbf7]/50 text-xs font-sans text-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    Cascade Pipeline Output Completed
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="bg-white border border-[#e6e2d6] rounded-lg p-2.5 space-y-1">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Generated Article HTML</span>
                    <pre className="font-mono text-[10px] text-gray-300 max-h-24 overflow-y-auto p-1.5 bg-[#fdfbf7] rounded">
                      {generatedArticle}
                    </pre>
                  </div>
                  <div className="bg-white border border-[#e6e2d6] rounded-lg p-2.5 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Social Media Copy</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(generatedSocial);
                          alert("Social media templates copied!");
                        }}
                        className="text-blue-400 text-[10px] flex items-center gap-0.5 hover:underline"
                      >
                        <Copy size={10} /> Copy
                      </button>
                    </div>
                    <p className="text-[10px] text-emerald-400 leading-relaxed max-h-24 overflow-y-auto font-mono p-1 bg-[#fdfbf7] rounded">
                      {generatedSocial}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Multi-Agent Workbench */}
      <div className="space-y-4">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1 block">AI Agent Workbench</span>

        {/* Agent selection Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => {
                setActiveAgent(agent);
                setAgentResponse("");
                setCommitStatus(null);
              }}
              className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-between h-24 ${
                activeAgent.id === agent.id
                  ? "bg-purple-950/20 border-purple-500 text-gray-900 shadow-md ring-1 ring-purple-500/30"
                  : "bg-white border-[#e6e2d6] hover:border-gray-500 text-gray-700"
              }`}
            >
              <span className="text-2xl">{agent.avatar}</span>
              <div className="space-y-0.5">
                <span className="text-xs font-bold block truncate leading-none">{agent.name}</span>
                <span className="text-[9px] text-gray-500 block truncate leading-none pt-0.5">{agent.role.split(" ")[0]}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Selected Agent Playground Box */}
        <div className="bg-white border border-[#e6e2d6] rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-[#e6e2d6]/50 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{activeAgent.avatar}</span>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900">{activeAgent.name}</span>
                <span className="text-[10px] text-purple-400 font-semibold">{activeAgent.role}</span>
              </div>
            </div>
            <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider">
              ONLINE
            </span>
          </div>

          {/* Form */}
          <div className="space-y-3.5">
            <textarea
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder={activeAgent.placeholder}
              className="w-full h-24 p-3 bg-[#fdfbf7] border border-[#e6e2d6] rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none leading-relaxed"
            />

            <div className="flex justify-between items-center gap-3">
              {/* Sample prompts */}
              <div className="flex gap-1.5 overflow-x-auto text-[9px] py-1 max-w-[70%]">
                {activeAgent.samplePrompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPromptInput(p)}
                    className="px-2 py-1 bg-[#fdfbf7] border border-[#e6e2d6] rounded-lg text-gray-400 hover:text-gray-900 hover:border-gray-500 whitespace-nowrap transition-all"
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleAgentChat()}
                disabled={aiLoading || !promptInput.trim()}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-950 text-gray-900 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow"
              >
                {aiLoading ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    Writing...
                  </>
                ) : (
                  <>
                    <Sparkles size={13} />
                    Consult Agent
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {commitStatus && (
          <div className="p-3 bg-blue-950/40 border border-blue-900/60 rounded-xl text-xs text-blue-300 flex items-start gap-2 animate-fade-in">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-400" />
            <span>{commitStatus}</span>
          </div>
        )}

        {/* Agent Output Viewer */}
        {agentResponse && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-white border border-[#e6e2d6] rounded-2xl p-4 space-y-3 shadow-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <h4 className="text-xs font-bold text-gray-900">Save Output to Repository</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs items-end">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Save Path Name</label>
                  <input
                    type="text"
                    value={savePath}
                    onChange={(e) => setSavePath(e.target.value)}
                    placeholder="E.g., blog/post.md, about-seo.html"
                    className="w-full px-3 py-2 bg-[#fdfbf7] border border-[#e6e2d6] rounded-xl text-gray-900 focus:outline-none font-mono text-xs"
                  />
                </div>

                <button
                  onClick={handleCommitAgentFile}
                  disabled={isCommitting || !savePath.trim()}
                  className="py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-gray-900 font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow"
                >
                  {isCommitting ? "Committing..." : "Push to GitHub"}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Agent Structured Response</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(agentResponse);
                    alert("Agent response copied to clipboard!");
                  }}
                  className="text-[10px] text-blue-400 hover:underline flex items-center gap-1"
                >
                  <Copy size={12} />
                  <span>Copy raw output</span>
                </button>
              </div>

              <div className="border border-[#e6e2d6] rounded-2xl p-4 bg-[#fdfbf7] font-mono text-xs max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed text-gray-700 shadow-inner">
                {agentResponse}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
