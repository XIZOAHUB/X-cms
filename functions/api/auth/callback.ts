// No external packages needed
export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const code = url.searchParams.get('code');
  if (!code) return new Response('No code', { status: 400 });

  // Exchange code for token
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: context.env.GITHUB_CLIENT_ID,
      client_secret: context.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });
  const tokenData: any = await tokenRes.json();
  if (!tokenData.access_token) return new Response('Login failed', { status: 401 });

  // Get user info
  const userRes = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const user: any = await userRes.json();

  // Create JWT using Web Crypto API
  const encoder = new TextEncoder();
  const secretKeyData = encoder.encode(context.env.JWT_SECRET);
  const key = await crypto.subtle.importKey(
    'raw',
    secretKeyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const payload = { username: user.login, id: user.id, exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 };
  const payloadBytes = encoder.encode(JSON.stringify(payload));
  const signature = await crypto.subtle.sign('HMAC', key, payloadBytes);

  // Encode as Base64 (unpadded)
  const base64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/=+$/, '');
  const token = `${base64(encoder.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })))}.${base64(payloadBytes)}.${base64(new Uint8Array(signature))}`;

  const response = Response.redirect('https://cms-web.xizoa.com/admin', 302);
  response.headers.set(
    'Set-Cookie',
    `session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`
  );
  return response;
};
