export const onRequest: PagesFunction = async (context) => {
  try {
    const url = new URL(context.request.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return new Response("Missing GitHub code", { status: 400 });
    }

    const clientId = context.env.GITHUB_CLIENT_ID;
    const clientSecret = context.env.GITHUB_CLIENT_SECRET;
    const jwtSecret = context.env.JWT_SECRET;

    if (!clientId) {
      return new Response("Missing GITHUB_CLIENT_ID", { status: 500 });
    }

    if (!clientSecret) {
      return new Response("Missing GITHUB_CLIENT_SECRET", { status: 500 });
    }

    if (!jwtSecret) {
      return new Response("Missing JWT_SECRET", { status: 500 });
    }

    // Exchange code for access token
    const tokenRes = await fetch(
  "https://github.com/login/oauth/access_token",
  {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: "https://cms-web.xizoa.com/api/auth/callback"
    }),
  }
);

const responseText = await tokenRes.text();

if (!tokenRes.ok) {
  return new Response(responseText, {
    status: tokenRes.status,
    headers: {
      "Content-Type": "text/plain"
    }
  });
}

const tokenData = JSON.parse(responseText);

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

    // Get GitHub user
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/vnd.github+json",
      },
    });

    const user: any = await userRes.json();

    if (!user.login) {
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

    // Temporary session
    const session = btoa(
      JSON.stringify({
        id: user.id,
        username: user.login,
        avatar: user.avatar_url,
      })
    );

    const response = Response.redirect(
      "https://cms-web.xizoa.com/dashboard",
      302
    );

    response.headers.append(
      "Set-Cookie",
      `session=${session}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`
    );

    return response;
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
