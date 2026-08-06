export const onRequest: PagesFunction = async (context) => {
  const clientId = context.env.GITHUB_CLIENT_ID;

  if (!clientId) {
    return new Response("GITHUB_CLIENT_ID is missing", { status: 500 });
  }

  const redirectUri = "https://cms-web.xizoa.com/api/auth/callback";

  const githubUrl = new URL("https://github.com/login/oauth/authorize");
  githubUrl.searchParams.set("client_id", clientId);
  githubUrl.searchParams.set("redirect_uri", redirectUri);
  githubUrl.searchParams.set("scope", "user:email");

  return Response.redirect(githubUrl.toString(), 302);
};
