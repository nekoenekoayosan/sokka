'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from './components/Header';

export default function MainPage() {
  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-12 flex flex-col items-center gap-8">

        {/* ロゴ */}
        <div className="flex flex-col items-center gap-2">
          <Image src="/top_logo2.png" alt="sokka!" height={80} width={268} priority />
          <p className="text-sm text-[#888888]">学んだことを、自分のものにする</p>
        </div>

        {/* メインアクション */}
        <div className="w-full flex flex-col gap-3 mt-4">
          <Link
            href="/learn"
            className="w-full bg-[#57C0F3] text-white text-center text-sm font-medium py-4 rounded-full hover:bg-[#3aaee0] transition-colors shadow-sm"
          >
            学習を始める
          </Link>

          <Link
            href="/learn?demo=true"
            className="w-full border border-[#57C0F3] text-[#227298] text-center text-sm font-medium py-4 rounded-full hover:bg-[#57C0F3]/5 transition-colors"
          >
            デモを試す
          </Link>
        </div>

        {/* 機能カード */}
        <div className="w-full grid grid-cols-2 gap-3 mt-4">
          <Link
            href="/sunabaco"
            className="bg-[#1A1A1A] rounded-2xl p-5 flex flex-col gap-2 hover:opacity-90 transition-opacity"
          >
            <p className="text-xs text-[#57C0F3] font-medium">SUNABACO</p>
            <p className="text-sm text-white font-bold">専用モード</p>
            <p className="text-xs text-[#888888]">コース・期に合わせた学習管理</p>
          </Link>

          <Link
            href="/history"
            className="bg-white rounded-2xl p-5 flex flex-col gap-2 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <p className="text-xs text-[#F5D000] font-medium">HISTORY</p>
            <p className="text-sm text-[#1A1A1A] font-bold">学習履歴</p>
            <p className="text-xs text-[#888888]">過去の学習を振り返る</p>
          </Link>

          <Link
            href="/vocabulary"
            className="bg-white rounded-2xl p-5 flex flex-col gap-2 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <p className="text-xs text-[#57C0F3] font-medium">VOCABULARY</p>
            <p className="text-sm text-[#1A1A1A] font-bold">単語帳</p>
            <p className="text-xs text-[#888888]">保存した用語を確認</p>
          </Link>

          <Link
            href="/sunabaco?demo=true"
            className="bg-[#1A1A1A] rounded-2xl p-5 flex flex-col gap-2 hover:opacity-90 transition-opacity"
          >
            <p className="text-xs text-[#F5D000] font-medium">SUNABACO</p>
            <p className="text-sm text-white font-bold">デモ</p>
            <p className="text-xs text-[#888888]">SUNABACOモードを体験</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
