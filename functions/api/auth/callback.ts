import jwt from 'jsonwebtoken';

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const code = url.searchParams.get('code');
  if (!code) return new Response('No code', { status: 400 });

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
  const data: any = await tokenRes.json();
  if (!data.access_token) return new Response('Login failed', { status: 401 });

  const userRes = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${data.access_token}` },
  });
  const user: any = await userRes.json();

  // JWT banana jsonwebtoken se
  const token = jwt.sign(
    { username: user.login, id: user.id },
    context.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  const response = Response.redirect('https://cms-web.xizoa.com/admin', 302);
  response.headers.set(
    'Set-Cookie',
    `session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`
  );
  return response;
};
