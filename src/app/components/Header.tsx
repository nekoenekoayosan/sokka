'use client';

import { useState } from 'react';
import Link from 'next/link';

interface HeaderProps {
  onLogoClick?: () => void;
}

export default function Header({ onLogoClick }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-[#FFFFFF] border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between relative">
        {/* ロゴ（中央） */}
        <Link
          href="/"
          onClick={onLogoClick}
          className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold text-[#F5D000] tracking-tight"
        >
          sokka!
        </Link>

        {/* 左の余白（ロゴ中央揃えのため） */}
        <div />

        {/* ハンバーガーメニューボタン */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex flex-col gap-1.5 p-2 rounded-md hover:bg-gray-50 transition-colors"
          aria-label="メニューを開く"
        >
          <span className={`block w-5 h-0.5 bg-[#1A1A1A] transition-transform origin-center ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 bg-[#1A1A1A] transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-[#1A1A1A] transition-transform origin-center ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* ドロップダウンメニュー */}
      {menuOpen && (
        <div className="absolute right-4 top-14 bg-white rounded-xl shadow-md border border-gray-100 min-w-44 py-2 z-50">
          <Link
            href="/vocabulary"
            className="block px-5 py-3 text-sm text-[#1A1A1A] hover:bg-gray-50 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            単語帳閲覧
          </Link>
          <div className="px-5 py-3 text-sm text-[#888888]">（今後追加予定）</div>
        </div>
      )}
    </header>
  );
}
