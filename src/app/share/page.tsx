'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function SharePage() {
  return (
    <Suspense>
      <ShareContent />
    </Suspense>
  );
}

function ShareContent() {
  const searchParams = useSearchParams();
  const result = searchParams.get('result') || '';
  const summary = searchParams.get('summary') || '';
  const label = searchParams.get('label') || '';

  const resultConfig: Record<string, { emoji: string; title: string; color: string }> = {
    excellent: { emoji: '🏆', title: '完全マスター！', color: '#F5D000' },
    good: { emoji: '🎉', title: 'よくできました！', color: '#57C0F3' },
    ok: { emoji: '💪', title: 'がんばりました！', color: '#57C0F3' },
  };

  const config = resultConfig[result] || resultConfig['ok'];

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="px-4 h-[65px] flex items-center justify-center">
          <Link href="/">
            <Image src="/top_logo2.png" alt="sokka!" height={56} width={188} priority />
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-12 flex flex-col items-center gap-8">
        {/* 結果カード */}
        <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col items-center gap-4">
          <span className="text-5xl">{config.emoji}</span>
          <h1 className="text-xl font-bold text-[#1A1A1A]" style={{ color: config.color }}>
            {config.title}
          </h1>

          {label && (
            <div className="bg-[#1A1A1A] rounded-full px-4 py-1.5">
              <p className="text-xs text-[#57C0F3] font-medium">{label}</p>
            </div>
          )}

          {summary && (
            <div className="w-full bg-[#F3FBFF] rounded-xl px-5 py-4 mt-2">
              <p className="text-xs font-bold text-[#227298] mb-2">学習のまとめ</p>
              <p className="text-sm text-[#1A1A1A] leading-relaxed whitespace-pre-wrap">{summary}</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3 w-full">
          <p className="text-sm text-[#888888]">あなたもSokka!で学習してみませんか？</p>
          <Link
            href="/"
            className="w-full max-w-xs bg-[#57C0F3] text-white text-center text-sm font-medium py-4 rounded-full hover:bg-[#3aaee0] transition-colors shadow-sm"
          >
            Sokka!を始める
          </Link>
        </div>
      </main>
    </div>
  );
}
