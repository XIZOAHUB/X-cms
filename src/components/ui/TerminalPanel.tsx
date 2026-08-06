import React, { useState, useRef, useEffect } from "react";
import { Terminal as TerminalIcon } from "lucide-react";
import { UserProfile, Repo } from "../../types/index";
import { fetchDirectory, fetchFileContent } from "../../services/githubApi";

interface TerminalPanelProps {
  profile: UserProfile;
  repo: Repo;
  branch: string;
}

interface CommandHistory {
  command: string;
  output: React.ReactNode;
}

export default function TerminalPanel({ profile, repo, branch }: TerminalPanelProps) {
  const [history, setHistory] = useState<CommandHistory[]>([]);
  const [input, setInput] = useState("");
  const [currentPath, setCurrentPath] = useState(""); // "" means root
  const endRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  useEffect(() => {
    setHistory([
      { command: "", output: `Welcome to CMS Shell v1.0.0\nConnected to ${repo.owner}/${repo.name} [${branch}]\nType 'help' for available commands.` }
    ]);
  }, [repo, branch]);

  const executeCommand = async (cmdStr: string) => {
    const args = cmdStr.trim().split(/\s+/);
    const cmd = args[0].toLowerCase();
    
    let output: React.ReactNode = "";

    try {
      switch (cmd) {
        case "help":
          output = `Available commands:
  help       - Show this help message
  clear      - Clear the terminal
  ls         - List files in current directory
  cd <dir>   - Change directory
  cat <file> - View file content
  whoami     - Show current user info
  pwd        - Print working directory`;
          break;
        case "clear":
          setHistory([]);
          return;
        case "pwd":
          output = `/${currentPath}`;
          break;
        case "whoami":
          output = `User: ${profile.username}\nEmail: ${profile.email || 'N/A'}`;
          break;
        case "cd":
          const target = args[1];
          if (!target || target === "~" || target === "/") {
            setCurrentPath("");
          } else if (target === "..") {
            const parts = currentPath.split("/").filter(Boolean);
            parts.pop();
            setCurrentPath(parts.join("/"));
          } else {
            const newPath = currentPath ? `${currentPath}/${target}` : target;
            setCurrentPath(newPath);
          }
          break;
        case "ls":
          const items = await fetchDirectory(profile.pat, repo.owner, repo.name, currentPath, branch);
          if (items.length === 0) {
            output = "(empty directory)";
          } else {
            output = items.map((i: any) => i.type === "dir" ? `<DIR>  ${i.name}` : `       ${i.name}`).join("\n");
          }
          break;
        case "cat":
          const fileTarget = args[1];
          if (!fileTarget) {
            output = "Usage: cat <file>";
            break;
          }
          const filePath = currentPath ? `${currentPath}/${fileTarget}` : fileTarget;
          const fileData = await fetchFileContent(profile.pat, repo.owner, repo.name, filePath, branch);
          output = fileData.content;
          break;
        default:
          if (cmd) {
            output = `Command not found: ${cmd}`;
          }
      }
    } catch (err: any) {
      output = `Error: ${err.message}`;
    }

    setHistory((prev) => [...prev, { command: cmdStr, output }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) {
      setHistory(prev => [...prev, { command: "", output: "" }]);
      setInput("");
      return;
    }
    const cmdStr = input;
    setInput("");
    await executeCommand(cmdStr);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col shadow-lg h-[600px] font-mono text-xs text-gray-300">
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between text-gray-400 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <TerminalIcon size={14} />
          <span>CMS Terminal</span>
        </div>
        <div className="flex items-center gap-1.5">
           <div className="w-3 h-3 rounded-full bg-red-500"></div>
           <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
           <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto space-y-2 cursor-text" onClick={() => document.getElementById("terminal-input")?.focus()}>
        {history.map((h, i) => (
          <div key={i} className="space-y-1">
            {h.command !== "" && (
              <div className="flex text-emerald-400">
                <span className="mr-2 select-none">user@{repo.name}:~{currentPath ? `/${currentPath}` : ''}$</span>
                <span>{h.command}</span>
              </div>
            )}
            {h.output && (
              <pre className="whitespace-pre-wrap break-all text-gray-300">{h.output}</pre>
            )}
          </div>
        ))}
        
        <form onSubmit={handleSubmit} className="flex text-emerald-400">
          <span className="mr-2 whitespace-nowrap select-none">user@{repo.name}:~{currentPath ? `/${currentPath}` : ''}$</span>
          <input
            id="terminal-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-emerald-400 focus:ring-0 focus:outline-none"
            autoComplete="off"
            spellCheck="false"
            autoFocus
          />
        </form>
        <div ref={endRef} />
      </div>
    </div>
  );
}
