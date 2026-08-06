export const onRequest: PagesFunction = async (context) => {
  const clientId = context.env.GITHUB_CLIENT_ID;
  const redirectUri = 'https://cms-web.xizoa.com/api/auth/callback';
  const scope = 'user:email';
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  return Response.redirect(githubAuthUrl, 302);
};
