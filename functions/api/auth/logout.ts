export const onRequest: PagesFunction = async () => {
  const response = Response.redirect('/', 302)
  response.headers.set(
    'Set-Cookie',
    'session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0'
  )
  return response
}
