export const onRequest: PagesFunction<{JWT_SECRET: string}> = async (context) => {
  const cookieHeader = context.request.headers.get('Cookie') || '';
  const session = cookieHeader.split('; ').find(c => c.trim().startsWith('aurora_session='))?.split('=')[1];
  if (!session) return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });

  try {
    const [headerB64, payloadB64, signatureB64] = session.split('.');
    const encoder = new TextEncoder();
    const secret = context.env.JWT_SECRET || "fallback_secret_for_local_dev";
    
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    
    const data = encoder.encode(`${headerB64}.${payloadB64}`);
    const signature = Uint8Array.from(atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
    
    const valid = await crypto.subtle.verify('HMAC', key, signature, data);
    if (!valid) throw new Error('Invalid signature');

    const decodedPayload = decodeURIComponent(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    const payload = JSON.parse(decodedPayload);
    
    if (payload.exp < Math.floor(Date.now() / 1000)) throw new Error('Token expired');
    
    return new Response(JSON.stringify({
      username: payload.username,
      avatarUrl: payload.avatarUrl
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
  }
};
