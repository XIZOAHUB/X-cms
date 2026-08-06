import { SignJWT } from 'jose'; // package add karna hoga

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const code = url.searchParams.get('code');
  if (!code) return new Response('No code', { status: 400 });

  // Token exchange
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: context.env.GITHUB_CLIENT_ID,
      client_secret: context.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });
  const data = await tokenRes.json() as { access_token: string };
  if (!data.access_token) return new Response('Login failed', { status: 401 });

  // Get user info
  const userRes = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${data.access_token}` },
  });
  const user = await userRes.json() as { login: string; id: number };

  // Create JWT session
  const jwt = await new SignJWT({ username: user.login, id: user.id })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(new TextEncoder().encode(context.env.JWT_SECRET));

  // Set cookie and redirect to admin
  const response = Response.redirect('https://cms-web.xizoa.com/admin', 302);
  response.headers.set(
    'Set-Cookie',
    `session=${jwt}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`
  );
  return response;
};
