'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface HeaderProps {
  onLogoClick?: () => void;
  sunabacoLabel?: string;
}

export default function Header({ onLogoClick, sunabacoLabel }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={`border-b shadow-sm sticky top-0 z-50 ${sunabacoLabel ? 'bg-[#1A1A1A]' : 'bg-[#FFFFFF] border-gray-100'}`}>
      <div className="max-w-2xl mx-auto px-4 h-[65px] flex items-center justify-between relative">
        {/* ロゴ（中央） */}
        <Link
          href="/"
          onClick={onLogoClick}
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
        >
          <Image src="/logo.png" alt="sokka!" height={sunabacoLabel ? 36 : 56} width={sunabacoLabel ? 120 : 188} priority />
          {sunabacoLabel && (
            <span className="text-[10px] text-[#57C0F3] font-medium -mt-1">{sunabacoLabel}</span>
          )}
        </Link>

        {/* 左の余白（ロゴ中央揃えのため） */}
        <div />

        {/* ハンバーガーメニューボタン */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex flex-col gap-1.5 p-2 rounded-md hover:bg-gray-50 transition-colors"
          aria-label="メニューを開く"
        >
          <span className={`block w-5 h-0.5 ${sunabacoLabel ? 'bg-white' : 'bg-[#1A1A1A]'} transition-transform origin-center ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 ${sunabacoLabel ? 'bg-white' : 'bg-[#1A1A1A]'} transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 ${sunabacoLabel ? 'bg-white' : 'bg-[#1A1A1A]'} transition-transform origin-center ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* ドロップダウンメニュー */}
      {menuOpen && (
        <div className="absolute right-4 top-14 bg-white rounded-xl shadow-md border border-gray-100 min-w-44 py-2 z-50">
          <Link
            href="/learn"
            className="block px-5 py-3 text-sm text-[#1A1A1A] hover:bg-gray-50 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            学習を始める
          </Link>
          <Link
            href="/sunabaco"
            className="block px-5 py-3 text-sm text-[#1A1A1A] hover:bg-gray-50 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            SUNABACO専用
          </Link>
          <div className="border-t border-gray-100 my-1" />
          <Link
            href="/history"
            className="block px-5 py-3 text-sm text-[#1A1A1A] hover:bg-gray-50 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            学習履歴
          </Link>
          <Link
            href="/vocabulary"
            className="block px-5 py-3 text-sm text-[#1A1A1A] hover:bg-gray-50 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            単語帳
          </Link>
        </div>
      )}
    </header>
  );
}
