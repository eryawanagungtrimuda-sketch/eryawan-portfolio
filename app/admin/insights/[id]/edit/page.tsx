'use client';
import { useEffect, useState } from 'react';
import AdminAuthGuard from '@/components/admin-auth-guard';
import InsightForm from '@/components/insight-form';
import { getSupabaseClient } from '@/lib/supabaseClient';
import type { Insight } from '@/lib/types';
export default function Page({ params }: { params: { id: string } }){const [insight,setInsight]=useState<Insight|null>(null);const [projects,setProjects]=useState<{id:string;title:string}[]>([]);useEffect(()=>{const s=getSupabaseClient();s.from('insights').select('*').eq('id',params.id).single().then(({data})=>setInsight((data||null) as Insight|null));s.from('projects').select('id,title').order('title').then(({data})=>setProjects((data||[]) as any[]));},[params.id]);
return <AdminAuthGuard><main id='admin-shell' className='min-h-screen bg-[#080807] px-5 py-10 text-[#F4F1EA]'><div className='mx-auto max-w-4xl'><h1 className='text-5xl mb-6'>Edit Wawasan</h1>{insight?<InsightForm insight={insight} projects={projects} />:'Memuat...'}</div></main></AdminAuthGuard>}
