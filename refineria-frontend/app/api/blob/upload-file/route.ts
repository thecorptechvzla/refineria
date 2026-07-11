import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 });
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('[upload-file] BLOB_READ_WRITE_TOKEN no está configurado');
      return NextResponse.json(
        { error: 'Error de configuración: BLOB_READ_WRITE_TOKEN no está definido. Configúralo en las variables de entorno de Vercel.' },
        { status: 500 },
      );
    }

    const uniqueFilename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;

    const blob = await put(uniqueFilename, file, {
      access: 'public',
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    const err = error as Error;
    console.error('[upload-file] Error completo:', err.message, err.stack);
    return NextResponse.json(
      { error: err.message, stack: process.env.NODE_ENV === 'development' ? err.stack : undefined },
      { status: 500 },
    );
  }
}
