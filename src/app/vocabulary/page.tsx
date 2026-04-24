'use client';

import { useState } from 'react';
import Header from '../components/Header';
import QuizArea, { Term } from '../components/QuizArea';

interface VocabItem {
  id: string;
  term: string;
  meaning: string;
  is_correct: boolean;
  saved_at: string;
}

const MOCK_VOCAB: VocabItem[] = [
  { id: '1', term: 'API', meaning: 'アプリケーション間でデータをやりとりするための取り決め', is_correct: true, saved_at: '2026-04-23' },
  { id: '2', term: 'コンポーネント', meaning: 'UIを構成する再利用可能な部品', is_correct: true, saved_at: '2026-04-22' },
  { id: '3', term: 'レンダリング', meaning: 'データをもとにHTMLを生成して画面に表示すること', is_correct: false, saved_at: '2026-04-22' },
  { id: '4', term: 'スキーマ', meaning: 'データベースの構造定義', is_correct: true, saved_at: '2026-04-21' },
];

export default function VocabularyPage() {
  const [vocab] = useState<VocabItem[]>(MOCK_VOCAB);
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect'>('all');
  const [quizMode, setQuizMode] = useState(false);
  const [quizDone, setQuizDone] = useState(false);

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

  // 単語帳のデータをQuizAreaのTerms形式に変換
  const quizTerms: Term[] = vocab.map((v) => ({
    word: v.term,
    explanation: v.meaning,
    difficulty: v.is_correct ? 'easy' : 'hard',
  }));

  // 答え合わせ（後でAPIに差し替え）
  const handleCheck = async (term: string, _correctMeaning: string, userAnswer: string) => {
    await new Promise((r) => setTimeout(r, 600));
    const isCorrect = userAnswer.length > 5;
    return {
      is_correct: isCorrect,
      feedback: isCorrect
        ? 'その通りです！しっかり覚えていますね。'
        : 'もう少し詳しく説明してみてください。',
      related_links: [
        { title: 'MDN Web Docs - ' + term, url: 'https://developer.mozilla.org/ja/' },
      ],
    };
  };

  const handleSave = (_term: string, _meaning: string) => {
    // 後でAPIに差し替え
  };

  const handleQuizStart = () => {
    setQuizDone(false);
    setQuizMode(true);
  };

  const handleQuizComplete = () => {
    setQuizDone(true);
    setQuizMode(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">

        {/* クイズ完了メッセージ */}
        {quizDone && (
          <div className="bg-[#57C0F3]/10 border border-[#57C0F3]/30 rounded-2xl px-5 py-4 mb-6 flex items-center justify-between">
            <p className="text-sm text-[#227298] font-medium">クイズお疲れさまでした！</p>
            <button
              onClick={() => setQuizDone(false)}
              className="text-xs text-[#888888] hover:text-[#1A1A1A] transition-colors"
            >
              閉じる
            </button>
          </div>
        )}

        {/* クイズモード */}
        {quizMode ? (
          <div>
            <button
              onClick={() => setQuizMode(false)}
              className="text-sm text-[#888888] hover:text-[#1A1A1A] transition-colors mb-4 flex items-center gap-1"
            >
              ← 単語帳に戻る
            </button>
            <QuizArea
              terms={quizTerms}
              onComplete={handleQuizComplete}
              onCheck={handleCheck}
              onSave={handleSave}
              title="単語確認テスト"
            />
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold text-[#1A1A1A] mb-6">単語帳</h1>

            {/* フィルター＋クイズボタン */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex bg-white rounded-full shadow-sm border border-gray-100 p-1">
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

              {/* クイズボタン */}
              <button
                onClick={handleQuizStart}
                className="flex items-center gap-2 bg-white rounded-full shadow-sm border border-gray-100 px-5 py-2.5 text-sm font-medium text-[#1A1A1A] hover:shadow-md transition-shadow"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 2.5C2 1.67 2.67 1 3.5 1H12.5C13.33 1 14 1.67 14 2.5V13.5C14 14.33 13.33 15 12.5 15H3.5C2.67 15 2 14.33 2 13.5V2.5Z" stroke="#1A1A1A" strokeWidth="1.2" strokeLinejoin="round"/>
                  <path d="M5 1V15" stroke="#1A1A1A" strokeWidth="1.2"/>
                  <path d="M7.5 5H11.5" stroke="#1A1A1A" strokeWidth="1.2" strokeLinecap="round"/>
                  <path d="M7.5 8H11.5" stroke="#1A1A1A" strokeWidth="1.2" strokeLinecap="round"/>
                  <path d="M7.5 11H10" stroke="#1A1A1A" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                <span>クイズ</span>
              </button>
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
          </>
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
