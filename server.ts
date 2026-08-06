import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import cors from "cors";
import axios from "axios";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_local_dev";

// ---- Auth Middleware ----
const requireAuth = (req: any, res: any, next: any) => {
  const token = req.cookies.aurora_session;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid session" });
  }
};

// ---- Auth Routes ----
app.get("/api/auth/github", (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) return res.status(500).json({ error: "GitHub OAuth not configured" });
  
  const redirectUri = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo,workflow,user`;
  res.redirect(redirectUri);
});

app.get("/api/auth/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send("No code provided");

  try {
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) throw new Error("Failed to get access token");

    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `token ${accessToken}` },
    });

    const user = userResponse.data;

    const sessionPayload = {
      username: user.login,
      avatarUrl: user.avatar_url,
      accessToken,
    };

    const token = jwt.sign(sessionPayload, JWT_SECRET, { expiresIn: "7d" });

    res.cookie("aurora_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", 
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect("/");
  } catch (err: any) {
    console.error("OAuth Error:", err.response?.data || err.message);
    res.status(500).send("Authentication failed");
  }
});

app.get("/api/auth/me", requireAuth, (req: any, res) => {
  res.json({
    username: req.user.username,
    avatarUrl: req.user.avatarUrl,
  });
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("aurora_session");
  res.json({ success: true });
});

// ---- GitHub API Proxy ----
app.use("/api/github", requireAuth, async (req: any, res) => {
  const githubPath = req.url;
  try {
    const response = await axios({
      method: req.method,
      url: `https://api.github.com${githubPath}`,
      headers: {
        Authorization: `token ${req.user.accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
      data: req.method !== 'GET' ? req.body : undefined,
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: "Failed to proxy GitHub request" });
    }
  }
});

// ---- Cloudflare API Proxy ----
app.use("/api/cloudflare", requireAuth, async (req: any, res) => {
  const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const cfApiToken = process.env.CLOUDFLARE_API_TOKEN;
  
  if (!cfAccountId || !cfApiToken) {
    return res.status(403).json({ error: "Cloudflare credentials not configured on server" });
  }

  const cfPath = req.url;
  try {
    const response = await axios({
      method: req.method,
      url: `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}${cfPath}`,
      headers: {
        Authorization: `Bearer ${cfApiToken}`,
        "Content-Type": "application/json",
      },
      data: req.body,
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: "Failed to proxy Cloudflare request" });
    }
  }
});

// ---- Gemini API Proxy ----
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

app.post("/api/gemini/generate", requireAuth, async (req, res) => {
  try {
    const { prompt, systemInstruction } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required." });
    
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: systemInstruction ? { systemInstruction } : undefined,
    });
    res.json({ text: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Development Mode: Vite middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production Mode: Serving static assets.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AuroraCMS Server is listening on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to bootstrap the Express/Vite server:", err);
  process.exit(1);
});
