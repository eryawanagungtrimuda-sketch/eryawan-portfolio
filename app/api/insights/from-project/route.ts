import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createInsightDraftFromProject } from '@/lib/insights';

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type harus application/json.' }, { status: 400 });
    }

    const rawBody = await req.text();
    if (!rawBody.trim()) {
      return NextResponse.json({ error: 'Body request tidak boleh kosong.' }, { status: 400 });
    }

    let payload: unknown;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Format JSON tidak valid.' }, { status: 400 });
    }

    const projectId =
      payload && typeof payload === 'object' && 'projectId' in payload
        ? String((payload as { projectId?: unknown }).projectId || '').trim()
        : '';

    if (!projectId) {
      return NextResponse.json({ error: 'projectId wajib.' }, { status: 400 });
    }

    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice(7).trim() : '';
    if (!token) {
      return NextResponse.json({ error: 'Session admin tidak valid. Login ulang lalu coba lagi.' }, { status: 401 });
    }

    const insight = await createInsightDraftFromProject(projectId, {
      supabase: createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        { global: { headers: { Authorization: `Bearer ${token}` } } },
      ),
    });

    return NextResponse.json({ id: insight.id });
  } catch (error) {
    console.error('[insights/from-project] Failed to build insight draft', {
      message: error instanceof Error ? error.message : 'unknown error',
    });
    return NextResponse.json(
      { error: 'Gagal membuat draft wawasan. Periksa session admin atau policy Supabase insights.' },
      { status: 500 },
    );
  }
}
