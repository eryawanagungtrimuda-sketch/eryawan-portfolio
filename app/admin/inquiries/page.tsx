import Link from 'next/link';
import AdminAuthGuard from '@/components/admin-auth-guard';
import AdminInquiriesList from '@/components/admin-inquiries-list';

export default function AdminInquiriesPage(){return <AdminAuthGuard><main id='admin-shell' className='min-h-screen bg-[#080807] px-5 py-10 font-sans text-[#F4F1EA] md:px-10 lg:px-16'><div className='mx-auto max-w-6xl'><div className='flex flex-col gap-6 border-b border-white/10 pb-8 md:flex-row md:items-center md:justify-between'><div><Link href='/admin' className='font-mono text-[10px] font-black uppercase tracking-[0.28em] text-white/35'>← Kembali ke Sebelumnya</Link><h1 className='font-display mt-4 text-5xl'>Inquiry Project</h1><p className='mt-3 text-white/55'>Pantau brief project yang masuk dari halaman Mulai Diskusi Project.</p></div></div><section className='py-10'><AdminInquiriesList /></section></div></main></AdminAuthGuard>}
