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

    const resHeaders = new Headers();
    backendRes.headers.forEach((value, key) => {
      if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key)) {
        resHeaders.set(key, value);
      }
    });

    const resBody = backendRes.body ? await backendRes.blob() : null;

    return new NextResponse(resBody, {
      status: backendRes.status,
      statusText: backendRes.statusText,
      headers: resHeaders,
    });
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
