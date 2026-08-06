export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/github', '');
  
  // Example proxy for Cloudflare Pages (requires SESSIONS KV setup)
  const token = request.headers.get("Authorization"); 
  const githubUrl = `https://api.github.com${path}${url.search}`;
  
  try {
    const response = await fetch(githubUrl, {
      method: request.method,
      headers: {
        "Authorization": token,
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "AuroraCMS-Pro"
      },
      body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.clone().text() : null
    });
    
    return new Response(await response.text(), {
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
