'use client';

import { useEffect, useState } from 'react';

interface ReviewQuiz {
  term: string;
  meaning: string;
}

interface LoadingScreenProps {
  status: string;
  reviewQuizzes?: ReviewQuiz[];
  onNoteChange?: (note: string) => void;
}

const MOCK_REVIEWS: ReviewQuiz[] = [
  { term: 'API', meaning: 'アプリケーション間でデータをやりとりするための取り決め' },
  { term: 'コンポーネント', meaning: 'UIを構成する再利用可能な部品' },
  { term: 'レンダリング', meaning: 'データをもとにHTMLを生成して画面に表示すること' },
];

const ESTIMATED_SECONDS = 30;

export default function LoadingScreen({ status, reviewQuizzes, onNoteChange }: LoadingScreenProps) {
  const quizzes = reviewQuizzes ?? MOCK_REVIEWS;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [note, setNote] = useState('');
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    setRevealed(false);
  }, [currentIdx]);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const remaining = Math.max(0, ESTIMATED_SECONDS - elapsed);
  const progress = Math.min(100, (elapsed / ESTIMATED_SECONDS) * 100);

  const quiz = quizzes[currentIdx % quizzes.length];

  return (
    <div className="flex flex-col items-center gap-8 py-12">
      {/* スピナー + ステータス + 残り時間 */}
      <div className="flex flex-col items-center gap-3 w-full">
        <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-[#1B4FD8] animate-spin" />
        <p className="text-sm text-[#888888]">{status}</p>
        <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#57C0F3] rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-[#888888]">
          {remaining > 0 ? `残り約 ${remaining} 秒` : 'まもなく完了します...'}
        </p>
      </div>

      {/* 自分で学んだことメモ */}
      <div className="w-full">
        <p className="text-xs text-[#888888] text-center mb-3">処理を待つ間に振り返ろう</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm font-bold text-[#1A1A1A] mb-2">自分で学んだこと</p>
          <textarea
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              onNoteChange?.(e.target.value);
            }}
            placeholder="今回の学習で気づいたこと、印象に残ったことを自由に書いてみよう..."
            rows={4}
            className="w-full rounded-xl bg-[#F3FBFF] px-4 py-3 text-sm text-[#1A1A1A] placeholder-[#888888] resize-none focus:outline-none focus:ring-2 focus:ring-[#57C0F3]/40 transition border-none"
          />
        </div>
      </div>

      {/* 復習クイズ */}
      {quizzes.length > 0 && (
        <div className="w-full">
          <p className="text-xs text-[#888888] text-center mb-3">待ち時間に復習しよう</p>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <p className="text-xs text-[#888888] mb-1">この用語の意味は？</p>
            <p className="text-lg font-bold text-[#1A1A1A] mb-4">{quiz.term}</p>

            {revealed ? (
              <div className="bg-[#F5F0E8] rounded-xl px-4 py-3 text-sm text-[#1A1A1A]">
                {quiz.meaning}
              </div>
            ) : (
              <button
                onClick={() => setRevealed(true)}
                className="w-full py-2.5 rounded-xl border border-gray-200 text-sm text-[#888888] hover:bg-gray-50 transition-colors"
              >
                意味を確認する
              </button>
            )}

            {/* ナビゲーション */}
            {quizzes.length > 1 && (
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => setCurrentIdx((i) => (i - 1 + quizzes.length) % quizzes.length)}
                  className="text-xs text-[#888888] hover:text-[#1A1A1A] transition-colors"
                >
                  ← 前へ
                </button>
                <span className="text-xs text-[#888888]">
                  {(currentIdx % quizzes.length) + 1} / {quizzes.length}
                </span>
                <button
                  onClick={() => setCurrentIdx((i) => (i + 1) % quizzes.length)}
                  className="text-xs text-[#888888] hover:text-[#1A1A1A] transition-colors"
                >
                  次へ →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
