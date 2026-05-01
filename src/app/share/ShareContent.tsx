'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function ShareContent() {
  return (
    <Suspense>
      <ShareInner />
    </Suspense>
  );
}

function ShareInner() {
  const searchParams = useSearchParams();
  const result = searchParams.get('result') || '2';
  const label = searchParams.get('label') || '';

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col">
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="px-4 h-[65px] flex items-center justify-center">
          <Link href="/">
            <Image src="/top_logo2.png" alt="sokka!" height={56} width={188} priority />
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-12 flex flex-col items-center gap-8">
        {/* 結果画像 */}
        <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center gap-4">
          <Image src={`/${result}.png`} alt="クイズ結果" width={500} height={263} className="w-full rounded-xl" />

          {label && (
            <div className="bg-[#1A1A1A] rounded-full px-4 py-1.5">
              <p className="text-xs text-[#57C0F3] font-medium">{label}</p>
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
