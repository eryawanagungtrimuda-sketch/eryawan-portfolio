import { NextResponse } from 'next/server';
import { createSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase';
import { absoluteUrl } from '@/lib/site-url';

type ProjectDetailResponse = {
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

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } },
) {
  const slug = params.slug?.trim().toLowerCase();

  if (!slug || !slugPattern.test(slug)) {
    return NextResponse.json({ error: 'Slug tidak valid.' }, { status: 400 });
  }

  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: 'Supabase belum terkonfigurasi.' },
      { status: 503 },
    );
  }

  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from('projects')
    .select(
      'id,title,slug,category,area_tags,cover_image,problem,solution,impact,konteks,konflik,keputusan_desain,dampak,insight_kunci,completion_year,is_published',
    )
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: 'Gagal mengambil data proyek.' },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: 'Proyek tidak ditemukan.' },
      { status: 404 },
    );
  }

  const summary = data.problem ?? '';
  const ogDescription = summary || data.konteks || 'Detail karya dan wawasan proyek.';
  const ogImage = data.cover_image || absoluteUrl('/hero.jpg');

  const response: ProjectDetailResponse = {
    id: data.id,
    title: data.title,
    slug: data.slug,
    summary,
    context: data.konteks ?? '',
    conflict: data.konflik ?? '',
    designDecision: data.keputusan_desain ?? '',
    solution: data.solution ?? '',
    impact: data.dampak ?? data.impact ?? '',
    insight: data.insight_kunci ?? '',
    visual: data.cover_image ?? '',
    year: data.completion_year ? String(data.completion_year) : '',
    category: data.category ?? '',
    tags: data.area_tags ?? [],
    canonicalUrl: absoluteUrl(`/karya/${data.slug}`),
    ogTitle: `${data.title} | Karya`,
    ogDescription,
    ogImage,
  };

  return NextResponse.json(response);
}
