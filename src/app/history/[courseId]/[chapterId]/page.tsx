'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/Header';

interface Term {
  word: string;
  explanation: string;
  difficulty: string;
}

interface ChapterDetail {
  chapter: {
    id: string;
    day_number: number;
    title: string | null;
    created_at: string;
  };
  summary: string | null;
  terms: Term[];
  learned_at: string | null;
}

export default function ChapterDetailPage() {
  const { courseId, chapterId } = useParams<{
    courseId: string;
    chapterId: string;
  }>();
  const [detail, setDetail] = useState<ChapterDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/history/${courseId}/${chapterId}`)
      .then((res) => res.json())
      .then((data) => {
        setDetail(data.error ? null : data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [courseId, chapterId]);

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <Link
          href={`/history/${courseId}`}
          className="text-sm text-[#888888] hover:text-[#1A1A1A] transition-colors mb-4 flex items-center gap-1"
        >
          ← チャプター一覧に戻る
        </Link>

        {loading ? (
          <p className="text-sm text-[#888888] text-center py-12">読み込み中...</p>
        ) : !detail ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-sm text-[#888888]">データが見つかりません</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* ヘッダー */}
            <div>
              <h1 className="text-xl font-bold text-[#1A1A1A]">
                Day {detail.chapter.day_number}
                {detail.chapter.title && ` - ${detail.chapter.title}`}
              </h1>
              {detail.learned_at && (
                <p className="text-xs text-[#888888] mt-1">
                  学習日：{new Date(detail.learned_at).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>

            {/* 要約 */}
            {detail.summary && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-sm font-bold text-[#1A1A1A] mb-3">要約</h2>
                <p className="text-sm text-[#1A1A1A] leading-relaxed whitespace-pre-wrap">
                  {detail.summary}
                </p>
              </div>
            )}

            {/* キーワード一覧 */}
            {detail.terms.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-sm font-bold text-[#1A1A1A] mb-3">
                  キーワード（{detail.terms.length}語）
                </h2>
                <div className="flex flex-col gap-3">
                  {detail.terms.map((term, i) => (
                    <div
                      key={i}
                      className="border-b border-gray-50 pb-3 last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#1A1A1A]">
                          {term.word}
                        </span>
                        {term.difficulty === 'hard' && (
                          <span className="text-xs bg-[#A72929]/10 text-[#A72929] px-2 py-0.5 rounded-full">
                            難
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#888888] mt-1">
                        {term.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* データなし */}
            {!detail.summary && detail.terms.length === 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                <p className="text-sm text-[#888888]">
                  このチャプターの学習データはまだありません
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
