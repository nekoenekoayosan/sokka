'use client';

import { useEffect, useState } from 'react';

interface ReviewQuiz {
  term: string;
  meaning: string;
}

interface LoadingScreenProps {
  status: string;
  reviewQuizzes?: ReviewQuiz[];
}

const MOCK_REVIEWS: ReviewQuiz[] = [
  { term: 'API', meaning: 'アプリケーション間でデータをやりとりするための取り決め' },
  { term: 'コンポーネント', meaning: 'UIを構成する再利用可能な部品' },
  { term: 'レンダリング', meaning: 'データをもとにHTMLを生成して画面に表示すること' },
];

export default function LoadingScreen({ status, reviewQuizzes }: LoadingScreenProps) {
  const quizzes = reviewQuizzes ?? MOCK_REVIEWS;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setRevealed(false);
  }, [currentIdx]);

  const quiz = quizzes[currentIdx % quizzes.length];

  return (
    <div className="flex flex-col items-center gap-8 py-12">
      {/* スピナー + ステータス */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-[#1B4FD8] animate-spin" />
        <p className="text-sm text-[#888888]">{status}</p>
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
