export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/cloudflare', '');
  
  // Example proxy for Cloudflare Pages to call its own API
  // You would configure these in Cloudflare Environment Variables
  const accountId = env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = env.CLOUDFLARE_API_TOKEN;
  
  const cfUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}${path}${url.search}`;
  
  try {
    const response = await fetch(cfUrl, {
      method: request.method,
      headers: {
        "Authorization": `Bearer ${apiToken}`,
        "Content-Type": "application/json",
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
