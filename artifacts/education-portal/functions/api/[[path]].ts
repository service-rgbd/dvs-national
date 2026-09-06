const DEFAULT_API_ORIGIN = 'https://pnigvs-api.rafiils120.workers.dev';

interface Env {
  API_ORIGIN?: string;
}

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const apiOrigin = (context.env.API_ORIGIN ?? DEFAULT_API_ORIGIN).replace(/\/$/, '');
  const incoming = new URL(context.request.url);
  const target = `${apiOrigin}${incoming.pathname}${incoming.search}`;

  const headers = new Headers(context.request.headers);
  headers.delete('host');

  const init: RequestInit = {
    method: context.request.method,
    headers,
    redirect: 'manual',
  };

  if (context.request.method !== 'GET' && context.request.method !== 'HEAD') {
    init.body = context.request.body;
  }

  const response = await fetch(target, init);
  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete('content-encoding');
  responseHeaders.delete('content-length');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}
