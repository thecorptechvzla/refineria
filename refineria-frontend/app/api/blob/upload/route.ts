import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  console.log('[blob/upload] POST received', JSON.stringify(body));

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        maximumSizeInBytes: 10 * 1024 * 1024,
      }),
    });

    console.log('[blob/upload] success', JSON.stringify(jsonResponse));
    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('[blob/upload] error', error);
    return NextResponse.json(
      { error: (error as Error).message, stack: (error as Error).stack },
      { status: 400 },
    );
  }
}
