import type { Metadata } from 'next';
import ShareContent from './ShareContent';

interface Props {
  searchParams: Promise<{ result?: string; summary?: string; label?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const result = params.result || '2';

  const ogImage = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://sokka.vercel.app'}/${result}.png`;

  const titleMap: Record<string, string> = {
    '1': 'クイズ結果：完敗しました | sokka!',
    '2': 'クイズ結果：まだいけます | sokka!',
    '3': 'クイズ結果：ググってください | sokka!',
  };

  return {
    title: titleMap[result] || 'クイズ結果 | sokka!',
    description: 'Sokka!で学習しました！あなたも学んだことを自分のものにしよう。',
    openGraph: {
      title: titleMap[result] || 'クイズ結果 | sokka!',
      description: 'Sokka!で学習しました！あなたも学んだことを自分のものにしよう。',
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: titleMap[result] || 'クイズ結果 | sokka!',
      description: 'Sokka!で学習しました！',
      images: [ogImage],
    },
  };
}

export default function SharePage() {
  return <ShareContent />;
}
