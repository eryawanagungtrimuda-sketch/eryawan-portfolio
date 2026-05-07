'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import AdminAuthGuard from '@/components/admin-auth-guard';
import { getSupabaseClient } from '@/lib/supabaseClient';
import type { Insight } from '@/lib/types';

export default function Page(){const [items,setItems]=useState<Insight[]>([]);useEffect(()=>{getSupabaseClient().from('insights').select('*').order('created_at',{ascending:false}).then(({data})=>setItems((data||[]) as Insight[]));},[]);
const published=items.filter(i=>i.is_published).length;
return <AdminAuthGuard><main id='admin-shell' className='min-h-screen bg-[#080807] px-5 py-10 text-[#F4F1EA]'><div className='mx-auto max-w-6xl'><div className='flex justify-between'><h1 className='text-5xl'>Insights</h1><Link href='/admin/insights/new'>Tambah Wawasan</Link></div><p>Total {items.length} • Published {published} • Draft {items.length-published}</p><div className='mt-6 space-y-3'>{items.map(i=><div key={i.id} className='border p-4 border-white/10 flex justify-between'><div><p>{i.title}</p><p>{i.category} · {i.source_type} · {i.is_published?'published':'draft'}</p></div><div className='flex gap-3'><Link href={`/admin/insights/${i.id}/edit`}>Edit</Link><button onClick={async()=>{await getSupabaseClient().from('insights').delete().eq('id',i.id);setItems(items.filter(x=>x.id!==i.id));}}>Delete</button></div></div>)}</div></div></main></AdminAuthGuard>}
