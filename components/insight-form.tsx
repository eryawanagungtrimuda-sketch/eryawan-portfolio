'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabaseClient';
import type { Insight, InsightSourceType } from '@/lib/types';

export default function InsightForm({ insight, projects = [] }: { insight?: Insight | null; projects?: { id: string; title: string }[] }) {
  const router = useRouter();
  const [form, setForm] = useState<any>({ ...insight, source_type: insight?.source_type || 'manual', is_published: insight?.is_published || false });
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = getSupabaseClient();
    const payload = { ...form, source_project_id: form.source_project_id || null, updated_at: new Date().toISOString() };
    if (insight?.id) await supabase.from('insights').update(payload).eq('id', insight.id);
    else {
      const { data } = await supabase.from('insights').insert(payload).select('id').single();
      router.push(`/admin/insights/${data.id}/edit`);
    }
    setLoading(false);
  }

  async function generateDraft() {
    const res = await fetch('/api/generate-insight-draft', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    if (res.ok) setForm((f: any) => ({ ...f, ...data }));
  }

  return <form onSubmit={onSubmit} className="space-y-4">
    <input placeholder="Title" value={form.title || ''} onChange={(e)=>setForm({...form,title:e.target.value})} required />
    <input placeholder="Slug" value={form.slug || ''} onChange={(e)=>setForm({...form,slug:e.target.value})} required />
    <input placeholder="Category" value={form.category || ''} onChange={(e)=>setForm({...form,category:e.target.value})} />
    <select value={form.source_type} onChange={(e)=>setForm({...form,source_type:e.target.value as InsightSourceType})}>
      <option value="manual">manual</option><option value="project">project</option><option value="image_review">image_review</option>
    </select>
    <select value={form.source_project_id || ''} onChange={(e)=>setForm({...form,source_project_id:e.target.value})}><option value="">Pilih project (opsional)</option>{projects.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select>
    <input placeholder="Cover image URL" value={form.cover_image || ''} onChange={(e)=>setForm({...form,cover_image:e.target.value})} />
    <textarea placeholder="Excerpt" value={form.excerpt || ''} onChange={(e)=>setForm({...form,excerpt:e.target.value})} />
    <textarea placeholder="Content (Markdown)" value={form.content || ''} onChange={(e)=>setForm({...form,content:e.target.value})} rows={14} />
    <label className="block"><input type="checkbox" checked={Boolean(form.is_published)} onChange={(e)=>setForm({...form,is_published:e.target.checked})} /> Publish</label>
    <div className="flex gap-3"><button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</button><button type="button" onClick={generateDraft}>AI improve (placeholder)</button></div>
  </form>;
}
