export const onRequest: PagesFunction = async (context) => {
  const cookieHeader = context.request.headers.get('Cookie') || '';
  const session = cookieHeader.split('; ').find(c => c.startsWith('session='))?.split('=')[1];
  if (!session) return new Response('Not authenticated', { status: 401 });

  try {
    const [headerB64, payloadB64, signatureB64] = session.split('.');
    const encoder = new TextEncoder();
    const secretKeyData = encoder.encode(context.env.JWT_SECRET);
    const key = await crypto.subtle.importKey(
      'raw',
      secretKeyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const data = encoder.encode(`${headerB64}.${payloadB64}`);
    const signature = Uint8Array.from(atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify('HMAC', key, signature, data);
    if (!valid) throw new Error('Invalid signature');

    const payload = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))));
    if (payload.exp < Math.floor(Date.now() / 1000)) throw new Error('Token expired');
    return new Response(JSON.stringify(payload), { status: 200 });
  } catch (err) {
    return new Response('Invalid token', { status: 401 });
  }
};
