import { NextResponse } from 'next/server';
import { createSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase';
import { absoluteUrl } from '@/lib/site-url';

type InsightDetailResponse = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  context: string;
  conflict: string;
  designDecision: string;
  solution: string;
  impact: string;
  insight: string;
  visual: string;
  year: string;
  category: string;
  tags: string[];
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
};

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const slug = params.slug?.trim().toLowerCase();
  if (!slug || !slugPattern.test(slug)) {
    return NextResponse.json({ error: 'Slug tidak valid.' }, { status: 400 });
  }
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: 'Supabase belum terkonfigurasi.' }, { status: 503 });
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('insights')
    .select('id,title,slug,excerpt,category,content,cover_image,created_at,is_published')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error) return NextResponse.json({ error: 'Gagal mengambil data wawasan.' }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Wawasan tidak ditemukan.' }, { status: 404 });

  const ogDescription = data.excerpt || 'Wawasan desain untuk pengambilan keputusan ruang.';
  const ogImage = data.cover_image || absoluteUrl('/hero.jpg');

  const response: InsightDetailResponse = {
    id: data.id,
    title: data.title,
    slug: data.slug,
    summary: data.excerpt ?? '',
    context: data.excerpt ?? '',
    conflict: '',
    designDecision: '',
    solution: '',
    impact: '',
    insight: data.excerpt ?? '',
    visual: data.cover_image ?? '',
    year: data.created_at ? String(new Date(data.created_at).getFullYear()) : '',
    category: data.category ?? '',
    tags: [],
    canonicalUrl: absoluteUrl(`/wawasan/${data.slug}`),
    ogTitle: `${data.title} | Wawasan`,
    ogDescription,
    ogImage,
  };

  return NextResponse.json(response);
}
