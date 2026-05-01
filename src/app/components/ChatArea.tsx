'use client';

import { useEffect, useRef } from 'react';

export interface Message {
  role: 'ai' | 'user';
  content: string;
}

interface ShareTerm {
  word: string;
  explanation: string;
}

interface ChatAreaProps {
  messages: Message[];
  turn: number;
  maxTurns: number;
  isLast: boolean;
  summary: string;
  onSend: (text: string) => void;
  isSending: boolean;
  inputValue: string;
  onInputChange: (v: string) => void;
  terms?: ShareTerm[];
  userNote?: string;
  resultLevel?: string;
  sunabacoLabel?: string;
}

export default function ChatArea({
  messages,
  turn,
  maxTurns,
  isLast,
  summary,
  onSend,
  isSending,
  inputValue,
  onInputChange,
  terms = [],
  userNote,
  resultLevel,
  sunabacoLabel,
}: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/share?result=${resultLevel ?? ''}&summary=${encodeURIComponent(summary)}&label=${encodeURIComponent(sunabacoLabel ?? '')}`;
    const tweetUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`;
    window.open(tweetUrl, '_blank');
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#1A1A1A]">AIと深める</h2>
        <span className="text-xs text-[#888888]">
          {turn} / {maxTurns} ターン
        </span>
      </div>

      {/* ターン進捗バー */}
      <div className="w-full h-1 bg-gray-100 rounded-full">
        <div
          className="h-1 bg-[#1B4FD8] rounded-full transition-all"
          style={{ width: `${(turn / maxTurns) * 100}%` }}
        />
      </div>

      {/* チャットメッセージ */}
      <div className="flex flex-col gap-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                msg.role === 'user'
                  ? 'bg-[#1B4FD8] text-white rounded-br-sm'
                  : 'bg-white border border-gray-100 text-[#1A1A1A] rounded-bl-sm shadow-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* まとめ（最終ターン） */}
      {isLast && summary && (
        <div className="bg-[#F5D000]/10 border border-[#F5D000]/30 rounded-2xl p-5 flex flex-col gap-3">
          <p className="text-xs font-bold text-[#B89E00]">学習のまとめ</p>
          <p className="text-sm text-[#1A1A1A] leading-relaxed whitespace-pre-wrap">{summary}</p>
          {userNote && (
            <div className="bg-white/60 rounded-xl px-4 py-3 mt-1">
              <p className="text-xs font-bold text-[#888888] mb-1">あなたのメモ</p>
              <p className="text-sm text-[#1A1A1A] whitespace-pre-wrap">{userNote}</p>
            </div>
          )}
          <button
            onClick={handleShare}
            className="inline-flex items-center justify-center gap-2 bg-[#1A1A1A] text-white text-sm font-medium py-2.5 rounded-xl hover:opacity-80 transition-opacity"
          >
            <span>𝕏</span>
            <span>Xにシェア</span>
          </button>
        </div>
      )}

      {/* 入力エリア（最終ターン以外） */}
      {!isLast && (
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && inputValue.trim()) {
                e.preventDefault();
                onSend(inputValue);
              }
            }}
            placeholder="返答を入力..."
            disabled={isSending}
            className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#1B4FD8]/30 transition disabled:opacity-50"
          />
          <button
            onClick={() => onSend(inputValue)}
            disabled={!inputValue.trim() || isSending}
            className="bg-[#1B4FD8] text-white px-5 rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-[#1541b8] transition-colors"
          >
            {isSending ? '...' : '送信'}
          </button>
        </div>
      )}
    </div>
  );
}
