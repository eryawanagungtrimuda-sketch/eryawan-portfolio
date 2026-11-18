import { NextResponse } from 'next/server';

type InvoiceRpcError = {
  code?: string;
  message?: string;
};

export function invoiceRpcErrorResponse(error: InvoiceRpcError, fallback: string) {
  if (error.code === '42501') {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  if (error.code === 'P0002') {
    return NextResponse.json({ error: error.message || 'Data tidak ditemukan.' }, { status: 404 });
  }

  if (error.code === 'P0001') {
    return NextResponse.json({ error: error.message || fallback }, { status: 409 });
  }

  if (error.code === '22023') {
    return NextResponse.json({ error: error.message || 'Data yang dikirim tidak valid.' }, { status: 400 });
  }

  console.error('[invoice-workflow][rpc]', { code: error.code || 'unknown' });
  return NextResponse.json({ error: fallback }, { status: 500 });
}
