'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';

interface Chapter {
  id: string;
  day_number: number;
  title: string | null;
  created_at: string;
  is_learned: boolean;
}

export default function ChaptersPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/history/${courseId}/chapters`)
      .then((res) => res.json())
      .then((data) => {
        setChapters(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [courseId]);

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <Link
          href="/history"
          className="text-sm text-[#888888] hover:text-[#1A1A1A] transition-colors mb-4 flex items-center gap-1"
        >
          ← コース一覧に戻る
        </Link>

        <h1 className="text-xl font-bold text-[#1A1A1A] mb-6">チャプター一覧</h1>

        {loading ? (
          <p className="text-sm text-[#888888] text-center py-12">読み込み中...</p>
        ) : chapters.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-sm text-[#888888]">チャプターがまだありません</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
            {chapters.map((ch) => (
              <Link
                key={ch.id}
                href={
                  ch.is_learned
                    ? `/history/${courseId}/${ch.id}`
                    : '#'
                }
                onClick={(e) => {
                  if (!ch.is_learned) e.preventDefault();
                }}
                className={`rounded-2xl border p-4 text-center transition-shadow ${
                  ch.is_learned
                    ? 'bg-white shadow-sm border-gray-100 hover:shadow-md cursor-pointer'
                    : 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
                }`}
              >
                <p
                  className={`text-lg font-bold ${
                    ch.is_learned ? 'text-[#57C0F3]' : 'text-[#888888]'
                  }`}
                >
                  {ch.day_number}
                </p>
                <p className="text-xs text-[#888888] mt-1">
                  {ch.title || `Day ${ch.day_number}`}
                </p>
                {ch.is_learned && (
                  <span className="inline-block mt-2 text-xs bg-[#57C0F3]/15 text-[#227298] px-2 py-0.5 rounded-full">
                    学習済み
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
