import jwt from 'jsonwebtoken';

export const onRequest: PagesFunction = async (context) => {
  const cookieHeader = context.request.headers.get('Cookie') || '';
  const session = cookieHeader.split('; ').find(c => c.startsWith('session='))?.split('=')[1];
  if (!session) return new Response('Not authenticated', { status: 401 });

  try {
    const payload = jwt.verify(session, context.env.JWT_SECRET);
    return new Response(JSON.stringify(payload), { status: 200 });
  } catch {
    return new Response('Invalid token', { status: 401 });
  }
};
