import { NextResponse } from 'next/server';
import { createInsightDraftFromProject } from '@/lib/insights';

export async function POST(req: Request) {
  const { projectId } = await req.json();
  if (!projectId) return NextResponse.json({ error: 'projectId wajib.' }, { status: 400 });
  const insight = await createInsightDraftFromProject(projectId);
  return NextResponse.json({ id: insight.id });
}
