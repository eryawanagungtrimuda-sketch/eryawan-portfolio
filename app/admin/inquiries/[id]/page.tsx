import Link from 'next/link';
import AdminAuthGuard from '@/components/admin-auth-guard';
import AdminInquiryDetail from '@/components/admin-inquiry-detail';

export default async function AdminInquiryDetailPage({params}:{params:Promise<{id:string}>}){const {id}=await params;return <AdminAuthGuard><main id='admin-shell' className='min-h-screen bg-[#080807] px-5 py-10 font-sans text-[#F4F1EA] md:px-10 lg:px-16'><div className='mx-auto max-w-4xl'><Link href='/admin/inquiries' className='font-mono text-[10px] font-black uppercase tracking-[0.28em] text-white/35'>← Kembali ke Sebelumnya</Link><h1 className='font-display mt-4 text-4xl'>Detail Inquiry</h1><section className='py-8'><AdminInquiryDetail id={id} /></section></div></main></AdminAuthGuard>}
