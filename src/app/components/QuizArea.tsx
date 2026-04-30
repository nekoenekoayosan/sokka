'use client';

import { useState } from 'react';

export interface Term {
  word: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hint?: string;
}

export interface RelatedLink {
  title: string;
  url: string;
}

interface CheckResult {
  is_correct: boolean;
  feedback: string;
  related_links: RelatedLink[];
}

interface QuizAreaProps {
  terms: Term[];
  onComplete: () => void;
  onCheck: (term: string, correctMeaning: string, userAnswer: string) => Promise<CheckResult>;
  onSave: (term: string, meaning: string) => void;
  onSkipToChat?: () => void;
  title?: string;
}

export default function QuizArea({ terms, onComplete, onCheck, onSave, onSkipToChat, title = 'データの要点' }: QuizAreaProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<CheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const current = terms[currentIdx];
  const isLast = currentIdx === terms.length - 1;

  const handleCheck = async () => {
    if (!answer.trim()) return;
    setIsChecking(true);
    const res = await onCheck(current.word, current.explanation, answer);
    setResult(res);
    if (res.is_correct) onSave(current.word, current.explanation);
    setIsChecking(false);
  };

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentIdx((i) => i + 1);
      setAnswer('');
      setResult(null);
    }
  };

  const handleRetry = () => {
    setAnswer('');
    setResult(null);
  };

  const handleSkip = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentIdx((i) => i + 1);
      setAnswer('');
      setResult(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#1A1A1A]">{title}</h2>
        <button
          onClick={onSkipToChat}
          className="text-xs text-[#227298] hover:opacity-70 transition-opacity"
        >
          ？ わからないときはAIに聞いてみよう →
        </button>
      </div>

      {/* 進捗バー */}
      <div className="w-full h-1 bg-gray-100 rounded-full">
        <div
          className="h-1 bg-[#57C0F3] rounded-full transition-all"
          style={{ width: `${((currentIdx + 1) / terms.length) * 100}%` }}
        />
      </div>
      <div className="flex items-center justify-between">
        <button
          onClick={onComplete}
          className="text-xs text-[#888888] hover:text-[#1A1A1A] transition-colors"
        >
          途中保存して会話へ →
        </button>
        <p className="text-xs text-[#888888]">
          {currentIdx + 1} / {terms.length}
        </p>
      </div>

      {/* 用語カード */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
        {/* 用語名 */}
        <div className="flex items-center gap-2">
          <span
            className={`text-xl font-bold ${
              current.difficulty === 'hard' ? 'text-[#A72929]' : 'text-[#1A1A1A]'
            }`}
          >
            {current.word}
          </span>
          {current.difficulty === 'hard' && (
            <span className="text-xs bg-[#A72929]/10 text-[#A72929] px-2 py-0.5 rounded-full">
              難しい用語
            </span>
          )}
        </div>

        {current.hint && (
          <p className="text-sm text-[#888888]">💡 {current.hint}</p>
        )}

        {/* 回答前 */}
        {!result && (
          <>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="意味を入力する..."
              rows={3}
              className="w-full rounded-xl bg-[#F3FBFF] px-4 py-3 text-sm text-[#1A1A1A] placeholder-[#888888] resize-none focus:outline-none focus:ring-2 focus:ring-[#57C0F3]/40 transition border-none"
            />
            <button
              onClick={handleCheck}
              disabled={!answer.trim() || isChecking}
              className="w-full bg-[#57C0F3] text-white text-sm font-medium py-3 rounded-full disabled:opacity-40 hover:bg-[#3aaee0] transition-colors"
            >
              {isChecking ? '確認中...' : '答え合わせ'}
            </button>
            <button
              onClick={handleSkip}
              className="w-full text-xs text-[#888888] hover:text-[#1A1A1A] transition-colors py-1"
            >
              この問題をスキップ →
            </button>
          </>
        )}

        {/* 正解フィードバック */}
        {result?.is_correct && (
          <div className="flex flex-col gap-3">
            <div className="bg-[#F5D000]/10 border border-[#F5D000]/30 rounded-xl px-4 py-3">
              <p className="text-xs font-bold text-[#B89E00] mb-1">正解！</p>
              <p className="text-sm text-[#1A1A1A]">{result.feedback}</p>
            </div>
            <p className="text-xs text-[#888888]">✓ 単語帳に保存しました</p>
            <RelatedLinks links={result.related_links} />
            <button
              onClick={handleNext}
              className="w-full bg-[#57C0F3] text-white text-sm font-medium py-3 rounded-full hover:bg-[#3aaee0] transition-colors"
            >
              {isLast ? '会話フェーズへ →' : '次の用語へ →'}
            </button>
          </div>
        )}

        {/* 不正解フィードバック */}
        {result && !result.is_correct && (
          <div className="flex flex-col gap-3">
            <div className="bg-[#A72929]/10 border border-[#A72929]/20 rounded-xl px-4 py-3">
              <p className="text-xs font-bold text-[#A72929] mb-1">もう一度考えてみよう</p>
              <p className="text-sm text-[#1A1A1A]">{result.feedback}</p>
            </div>
            <RelatedLinks links={result.related_links} />
            <button
              onClick={handleRetry}
              className="w-full border border-[#57C0F3] text-[#227298] text-sm font-medium py-3 rounded-full hover:bg-[#57C0F3]/5 transition-colors"
            >
              もう一度入力する
            </button>
            <button
              onClick={handleSkip}
              className="w-full text-xs text-[#888888] hover:text-[#1A1A1A] transition-colors py-1"
            >
              スキップして次へ →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function RelatedLinks({ links }: { links: RelatedLink[] }) {
  if (!links.length) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs text-[#888888]">関連リンク</p>
      {links.map((link) => (
        <a
          key={link.url}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#227298] underline underline-offset-2 hover:opacity-70 transition-opacity"
        >
          {link.title}
        </a>
      ))}
    </div>
  );
}
