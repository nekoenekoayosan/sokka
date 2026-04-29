'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

function SokkaLogo() {
  return (
    <svg width="120" height="42" viewBox="0 0 120 42" xmlns="http://www.w3.org/2000/svg">
      <text
        x="0" y="36"
        fontFamily="'Lilita One', cursive"
        fontSize="40"
        fill="#F5D000"
      >
        sokka!
      </text>
      {/* oの中のスコップアイコン（oはx約18付近、幅約24px、中心x約30） */}
      <g transform="translate(36, 5)">
        {/* 柄（グリップ付き） */}
        <rect x="5.5" y="0" width="4" height="14" rx="2" fill="white" />
        {/* グリップ（T字） */}
        <rect x="1" y="0" width="13" height="4" rx="2" fill="white" />
        {/* ブレード（丸みのあるスコップ頭） */}
        <path d="M2 14 Q2 26 7.5 26 Q13 26 13 14 Z" fill="white" />
      </g>
    </svg>
  );
}

interface HeaderProps {
  onLogoClick?: () => void;
}

export default function Header({ onLogoClick }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-[#FFFFFF] border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-2xl mx-auto px-4 h-[65px] flex items-center justify-between relative">
        {/* ロゴ（中央） */}
        <Link
          href="/"
          onClick={onLogoClick}
          className="absolute left-1/2 -translate-x-1/2"
        >
          <Image src="/top_logo.png" alt="sokka!" height={44} width={148} priority />
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
          <Link
            href="/history"
            className="block px-5 py-3 text-sm text-[#1A1A1A] hover:bg-gray-50 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            学習履歴
          </Link>
        </div>
      )}
    </header>
  );
}
