export const onRequest: PagesFunction = async (context) => {
  const code = new URL(context.request.url).searchParams.get("code");

  if (!code) {
    return new Response("Missing GitHub OAuth code", { status: 400 });
  }

  const tokenRes = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: context.env.GITHUB_CLIENT_ID,
        client_secret: context.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    }
  );

  const tokenData = await tokenRes.json<any>();

  if (!tokenData.access_token) {
    return new Response(
      JSON.stringify(tokenData, null, 2),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      Accept: "application/vnd.github+json",
    },
  });

  const user = await userRes.json<any>();

  return new Response(
    JSON.stringify(user, null, 2),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};
