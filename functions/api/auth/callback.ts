--- START OF FILE X-cms-main/functions/api/auth/callback.ts ---
export const onRequest: PagesFunction<{
  DB: D1Database;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  JWT_SECRET: string;
}> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return new Response("Missing GitHub code", { status: 400 });
    }

    const clientId = context.env.GITHUB_CLIENT_ID;
    const clientSecret = context.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return new Response("Missing GitHub credentials", { status: 500 });
    }

    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: `${url.origin}/api/auth/callback`,
    });

    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const tokenData: any = await tokenRes.json();
    if (!tokenData.access_token) return new Response(JSON.stringify(tokenData), { status: 401 });

    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "AuroraCMS",
      },
    });

    const user: any = await userRes.json();
    if (!user.id) return new Response(JSON.stringify(user), { status: 500 });

    try {
      if (context.env.DB) {
        const now = new Date().toISOString();
        await context.env.DB.prepare(`
          INSERT INTO users (github_id, username, name, email, avatar, created_at, last_login)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(github_id) DO UPDATE SET
            username = excluded.username, name = excluded.name, email = excluded.email, avatar = excluded.avatar, last_login = excluded.last_login
        `).bind(user.id, user.login, user.name ?? "", user.email ?? "", user.avatar_url ?? "", now, now).run();
      }
    } catch (dbErr) {
      console.warn("DB ignoring missing bind error");
    }

    const sessionPayload = {
      username: user.login,
      avatarUrl: user.avatar_url,
      accessToken: tokenData.access_token
    };

    const encoder = new TextEncoder();
    const secret = context.env.JWT_SECRET || "fallback_secret_for_local_dev";
    const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);

    function base64url(str: string) {
      return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(Number('0x' + p1))))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = base64url(JSON.stringify({ ...sessionPayload, exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600 }));
    
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(`${header}.${payload}`));
    const signature = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(signatureBuffer)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const session = `${header}.${payload}.${signature}`;

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
        "Set-Cookie": `aurora_session=${session}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`,
      },
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
--- END OF FILE ---
