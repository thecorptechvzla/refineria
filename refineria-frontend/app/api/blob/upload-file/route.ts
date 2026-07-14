import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (clientPayload?: string) => {
        let fileSize = 0;
        try {
          const parsed = clientPayload ? JSON.parse(clientPayload) : {};
          fileSize = parsed.fileSize || 0;
        } catch {}

        if (fileSize > 50 * 1024 * 1024) {
          throw new Error('El archivo excede el límite de 50 MB');
        }

        return {
          maximumSizeInBytes: 50 * 1024 * 1024,
          allowedContentTypes: ['application/pdf'],
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('[upload-file] Subida completada:', blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('[upload-file] error', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}
