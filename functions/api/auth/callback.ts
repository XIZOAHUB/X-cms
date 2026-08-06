export const onRequest: PagesFunction<{
  DB: D1Database;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
}> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return new Response("Missing GitHub code", { status: 400 });
    }

    const clientId = context.env.GITHUB_CLIENT_ID;
    const clientSecret = context.env.GITHUB_CLIENT_SECRET;

    if (!clientId) {
      return new Response("Missing GITHUB_CLIENT_ID", { status: 500 });
    }

    if (!clientSecret) {
      return new Response("Missing GITHUB_CLIENT_SECRET", { status: 500 });
    }

    // Exchange code for access token
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: "https://cms-web.xizoa.com/api/auth/callback",
    });

    const tokenRes = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      }
    );

    const tokenData: any = await tokenRes.json();

    if (!tokenData.access_token) {
      return new Response(
        JSON.stringify(tokenData, null, 2),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Fetch GitHub user
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "AuroraCMS",
      },
    });

    const user: any = await userRes.json();

    if (!user.id) {
      return new Response(
        JSON.stringify(user, null, 2),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Save user to D1
    const now = new Date().toISOString();

    await context.env.DB.prepare(`
      INSERT INTO users (
        github_id,
        username,
        name,
        email,
        avatar,
        created_at,
        last_login
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(github_id)
      DO UPDATE SET
        username = excluded.username,
        name = excluded.name,
        email = excluded.email,
        avatar = excluded.avatar,
        last_login = excluded.last_login
    `)
      .bind(
        user.id,
        user.login,
        user.name ?? "",
        user.email ?? "",
        user.avatar_url ?? "",
        now,
        now
      )
      .run();

    // Temporary session
    const session = btoa(
      JSON.stringify({
        github_id: user.id,
        username: user.login,
      })
    );

    // Redirect + Cookie
    return new Response(null, {
      status: 302,
      headers: {
        Location: "https://cms-web.xizoa.com/dashboard",
        "Set-Cookie": `session=${session}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`,
      },
    });

  } catch (err: any) {
    return new Response(
      JSON.stringify(
        {
          success: false,
          error: err?.message ?? "Unknown error",
          stack: err?.stack ?? null,
        },
        null,
        2
      ),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
