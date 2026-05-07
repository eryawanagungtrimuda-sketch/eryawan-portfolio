'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AdminAuthGuard from '@/components/admin-auth-guard';
import { getSupabaseClient } from '@/lib/supabaseClient';
import type { Insight } from '@/lib/types';

export default function AdminInsightsPage() {
  const [items, setItems] = useState<Insight[]>([]);

  useEffect(() => {
    getSupabaseClient()
      .from('insights')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setItems((data || []) as Insight[]));
  }, []);

  const published = items.filter((item) => item.is_published).length;

  return (
    <AdminAuthGuard>
      <main id="admin-shell" className="min-h-screen bg-[#080807] px-5 py-10 text-[#F4F1EA]">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <h1 className="text-5xl">Insights</h1>
            <Link href="/admin/insights/new">Tambah Wawasan</Link>
          </div>

          <p className="mt-3">Total {items.length} • Published {published} • Draft {items.length - published}</p>

          <div className="mt-6 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between border border-white/10 p-4">
                <div>
                  <p>{item.title}</p>
                  <p>{item.category} · {item.source_type} · {item.is_published ? 'published' : 'draft'}</p>
                </div>
                <div className="flex gap-3">
                  <Link href={`/admin/insights/${item.id}/edit`}>Edit</Link>
                  <button
                    onClick={async () => {
                      await getSupabaseClient().from('insights').delete().eq('id', item.id);
                      setItems((current) => current.filter((row) => row.id !== item.id));
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </AdminAuthGuard>
  );
}
