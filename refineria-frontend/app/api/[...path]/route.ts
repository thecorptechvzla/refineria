import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NODE_ENV === 'development'
  ? 'http://localhost:4000'
  : 'https://refineria-backend.vercel.app';

async function proxy(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const apiPath = '/' + path.join('/');
  const url = `${API_BASE}${apiPath}${request.nextUrl.search}`;

  const body = request.method !== 'GET' && request.method !== 'HEAD'
    ? await request.blob()
    : undefined;

  const headers: Record<string, string> = {};

  const cookie = request.headers.get('cookie');
  if (cookie) {
    headers['cookie'] = cookie;
  }

  const contentType = request.headers.get('content-type');
  if (contentType) {
    headers['content-type'] = contentType;
  }

  const accept = request.headers.get('accept');
  if (accept) {
    headers['accept'] = accept;
  }

  try {
    const backendRes = await fetch(url, {
      method: request.method,
      headers,
      body,
      // @ts-expect-error - duplex is required for streaming bodies in some runtimes
      duplex: body ? 'half' : undefined,
    });

    const resBody = backendRes.body ? await backendRes.blob() : null;
    const response = new NextResponse(resBody, {
      status: backendRes.status,
      statusText: backendRes.statusText,
    });

    backendRes.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (!['set-cookie', 'content-encoding', 'content-length', 'transfer-encoding'].includes(lower)) {
        response.headers.set(key, value);
      }
    });

    const setCookieVal = backendRes.headers.get('set-cookie');
    if (setCookieVal) {
      const parts = setCookieVal.split(';').map(s => s.trim());
      const [nv, ...attrs] = parts;
      const eqIdx = nv.indexOf('=');
      const cookieName = nv.slice(0, eqIdx);
      const cookieValue = nv.slice(eqIdx + 1);

      const opts: Record<string, unknown> = {};
      for (const attr of attrs) {
        const [k, ...v] = attr.split('=');
        const key = k.toLowerCase();
        const val = v.join('=');
        if (key === 'max-age') opts.maxAge = parseInt(val, 10);
        else if (key === 'path') opts.path = val;
        else if (key === 'domain') opts.domain = val;
        else if (key === 'httponly') opts.httpOnly = true;
        else if (key === 'secure') opts.secure = true;
        else if (key === 'samesite') opts.sameSite = val.toLowerCase();
      }

      response.cookies.set(cookieName, cookieValue, opts);
    }

    return response;
  } catch {
    return NextResponse.json(
      { message: 'Error al conectar con el servidor', error: 'Service unavailable' },
      { status: 503 },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
