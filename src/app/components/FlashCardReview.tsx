'use client';

import { useState } from 'react';
import { Term } from './QuizArea';

interface FlashCardReviewProps {
  terms: Term[];
  onStartQuiz: () => void;
}

export default function FlashCardReview({ terms, onStartQuiz }: FlashCardReviewProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState<Set<number>>(new Set());

  const current = terms[currentIdx];
  const allReviewed = reviewed.size === terms.length;

  const handleFlip = () => {
    setFlipped(!flipped);
    if (!flipped) {
      setReviewed((prev) => new Set(prev).add(currentIdx));
    }
  };

  const handleNext = () => {
    if (currentIdx < terms.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      setFlipped(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#1A1A1A]">復習フェーズ</h2>
        <span className="text-xs text-[#888888]">
          カードをタップして意味を確認しよう
        </span>
      </div>

      {/* 進捗バー */}
      <div className="w-full h-1 bg-gray-100 rounded-full">
        <div
          className="h-1 bg-[#F5D000] rounded-full transition-all"
          style={{ width: `${(reviewed.size / terms.length) * 100}%` }}
        />
      </div>
      <p className="text-xs text-[#888888] text-right">
        {reviewed.size} / {terms.length} 確認済み
      </p>

      {/* フラッシュカード */}
      <div
        onClick={handleFlip}
        className="cursor-pointer select-none"
      >
        <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center min-h-[200px] transition-all ${flipped ? 'bg-[#F3FBFF]' : ''}`}>
          {!flipped ? (
            <>
              <span className={`text-2xl font-bold mb-2 ${current.difficulty === 'hard' ? 'text-[#A72929]' : 'text-[#1A1A1A]'}`}>
                {current.word}
              </span>
              {current.difficulty === 'hard' && (
                <span className="text-xs bg-[#A72929]/10 text-[#A72929] px-2 py-0.5 rounded-full mb-3">
                  難しい用語
                </span>
              )}
              <span className="text-xs text-[#888888] mt-2">タップして意味を見る</span>
            </>
          ) : (
            <>
              <span className="text-sm font-bold text-[#227298] mb-3">{current.word}</span>
              <p className="text-sm text-[#1A1A1A] text-center leading-relaxed">{current.explanation}</p>
              {current.hint && (
                <p className="text-xs text-[#888888] mt-3">💡 {current.hint}</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* ナビゲーション */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className="px-4 py-2 text-sm text-[#227298] disabled:opacity-30 hover:bg-[#57C0F3]/5 rounded-full transition-colors"
        >
          ← 前へ
        </button>
        <span className="text-xs text-[#888888]">{currentIdx + 1} / {terms.length}</span>
        <button
          onClick={handleNext}
          disabled={currentIdx === terms.length - 1}
          className="px-4 py-2 text-sm text-[#227298] disabled:opacity-30 hover:bg-[#57C0F3]/5 rounded-full transition-colors"
        >
          次へ →
        </button>
      </div>

      {/* クイズへ進むボタン */}
      <button
        onClick={onStartQuiz}
        className={`w-full text-sm font-medium py-3 rounded-full transition-colors ${
          allReviewed
            ? 'bg-[#57C0F3] text-white hover:bg-[#3aaee0]'
            : 'border border-[#57C0F3] text-[#227298] hover:bg-[#57C0F3]/5'
        }`}
      >
        {allReviewed ? 'クイズを始める →' : 'スキップしてクイズへ →'}
      </button>
    </div>
  );
}
