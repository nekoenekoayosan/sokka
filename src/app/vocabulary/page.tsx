'use client';

import { useState } from 'react';
import Header from '../components/Header';

interface VocabItem {
  id: string;
  term: string;
  meaning: string;
  is_correct: boolean;
  saved_at: string;
}

// モックデータ（後でAPIに差し替え）
const MOCK_VOCAB: VocabItem[] = [
  { id: '1', term: 'API', meaning: 'アプリケーション間でデータをやりとりするための取り決め', is_correct: true, saved_at: '2026-04-23' },
  { id: '2', term: 'コンポーネント', meaning: 'UIを構成する再利用可能な部品', is_correct: true, saved_at: '2026-04-22' },
  { id: '3', term: 'レンダリング', meaning: 'データをもとにHTMLを生成して画面に表示すること', is_correct: false, saved_at: '2026-04-22' },
  { id: '4', term: 'スキーマ', meaning: 'データベースの構造定義', is_correct: true, saved_at: '2026-04-21' },
];

export default function VocabularyPage() {
  const [vocab] = useState<VocabItem[]>(MOCK_VOCAB);
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect'>('all');

  const filtered = vocab.filter((v) => {
    if (filter === 'correct') return v.is_correct;
    if (filter === 'incorrect') return !v.is_correct;
    return true;
  });

  const filterOptions: { value: typeof filter; label: string }[] = [
    { value: 'all', label: 'すべて' },
    { value: 'correct', label: '正解済み' },
    { value: 'incorrect', label: '要復習' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <h1 className="text-xl font-bold text-[#1A1A1A] mb-6">単語帳</h1>

        {/* フィルター */}
        <div className="flex bg-white rounded-full shadow-sm border border-gray-100 p-1 mb-6 w-fit">
          {filterOptions.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === value
                  ? 'bg-[#57C0F3] text-white shadow-sm'
                  : 'text-[#888888] hover:text-[#1A1A1A]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 単語リスト */}
        {filtered.length === 0 ? (
          <p className="text-sm text-[#888888] text-center py-12">単語がありません</p>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((item) => (
              <VocabCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function VocabCard({ item }: { item: VocabItem }) {
  const [open, setOpen] = useState(false);

  return (
    <button
      onClick={() => setOpen(!open)}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-left hover:shadow-md transition-shadow w-full"
    >
      <div className="flex items-center justify-between">
        <span className="font-bold text-[#1A1A1A]">{item.term}</span>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-3 py-0.5 rounded-full ${
              item.is_correct
                ? 'bg-[#57C0F3]/15 text-[#227298]'
                : 'bg-[#A72929]/10 text-[#A72929]'
            }`}
          >
            {item.is_correct ? '正解済み' : '要復習'}
          </span>
          <span className="text-[#888888] text-xs">{open ? '▲' : '▼'}</span>
        </div>
      </div>
      {open && (
        <p className="mt-3 text-sm text-[#1A1A1A] leading-relaxed border-t border-gray-100 pt-3">
          {item.meaning}
        </p>
      )}
      <p className="text-xs text-[#888888] mt-2">{item.saved_at}</p>
    </button>
  );
}
