'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';
import type { ProjectInquiry } from '@/lib/types';

export default function AdminInquiriesList(){const [rows,setRows]=useState<ProjectInquiry[]>([]);const [loading,setLoading]=useState(true);
const load=async()=>{setLoading(true);const supabase=getSupabaseClient();const {data}=await supabase.from('project_inquiries').select('*').order('created_at',{ascending:false});setRows((data||[]) as ProjectInquiry[]);setLoading(false);}; useEffect(()=>{load();},[]);
const stats=useMemo(()=>({total:rows.length,baru:rows.filter(r=>r.status==='baru').length,progress:rows.filter(r=>r.status==='ditinjau'||r.status==='dihubungi').length,selesai:rows.filter(r=>r.status==='selesai').length}),[rows]);
const patch=async(id:string,status:ProjectInquiry['status'])=>{const supabase=getSupabaseClient();const {data:{session}}=await supabase.auth.getSession();await fetch(`/api/project-inquiries/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json',Authorization:`Bearer ${session?.access_token||''}`},body:JSON.stringify({status})});await load();};
if(loading) return <p>Memuat inquiry...</p>;
return <div className='space-y-6'><div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>{[['Total Inquiry',stats.total],['Baru',stats.baru],['Ditinjau / Dihubungi',stats.progress],['Selesai',stats.selesai]].map(([l,v])=><div key={String(l)} className='rounded-xl border border-white/10 p-4'><p className='text-xs text-white/60'>{l}</p><p className='mt-2 text-3xl'>{String(v)}</p></div>)}</div>
<div className='overflow-auto rounded-2xl border border-white/10'><table className='w-full text-sm'><thead><tr className='text-left text-white/60'><th className='p-3'>Nama</th><th>Perusahaan</th><th>Jenis kebutuhan</th><th>Timeline</th><th>Budget range</th><th>Status</th><th>Created at</th><th>Actions</th></tr></thead><tbody>{rows.map(r=><tr key={r.id} className='border-t border-white/10'><td className='p-3'>{r.nama}</td><td>{r.perusahaan||'—'}</td><td>{r.jenis_kebutuhan}</td><td>{r.timeline||'—'}</td><td>{r.budget_range||'—'}</td><td>{r.status}</td><td>{new Date(r.created_at).toLocaleString('id-ID')}</td><td className='space-x-2'><Link href={`/admin/inquiries/${r.id}`}>Detail</Link><button onClick={()=>patch(r.id,'dihubungi')}>Tandai Dihubungi</button><button onClick={()=>patch(r.id,'arsip')}>Arsipkan</button></td></tr>)}</tbody></table></div></div>;
}
