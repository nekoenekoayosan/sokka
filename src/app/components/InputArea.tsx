'use client';

import { useState, useRef } from 'react';

type InputType = 'audio' | 'text' | 'url';

interface InputAreaProps {
  onSubmit: (inputType: InputType, content: string | File) => void;
  isLoading: boolean;
}

export default function InputArea({ onSubmit, isLoading }: InputAreaProps) {
  const [inputType, setInputType] = useState<InputType>('audio');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const tabs: { type: InputType; label: string }[] = [
    { type: 'audio', label: '音声' },
    { type: 'text',  label: 'テキスト' },
    { type: 'url',   label: 'URL' },
  ];

  const handleTabChange = (type: InputType) => {
    setInputType(type);
    setFile(null);
    setImageFile(null);
    setText('');
    setUrl('');
    if (audioInputRef.current) audioInputRef.current.value = '';
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleSubmit = () => {
    if (inputType === 'text') {
      if (!text.trim()) return;
      onSubmit('text', text);
    } else if (inputType === 'url') {
      if (!url.trim()) return;
      onSubmit('url', url);
    } else {
      if (!file) return;
      onSubmit('audio', file);
    }
  };

  const canSubmit =
    inputType === 'text' ? text.trim().length > 0
    : inputType === 'url' ? url.trim().length > 0
    : file !== null;

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* トグル */}
      <div className="flex bg-white rounded-full shadow-sm border border-gray-100 p-1">
        {tabs.map(({ type, label }) => (
          <button
            key={type}
            onClick={() => handleTabChange(type)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              inputType === type
                ? 'bg-[#57C0F3] text-white shadow-sm'
                : 'text-[#888888] hover:text-[#1A1A1A]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 入力エリア */}
      <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

        {inputType === 'audio' && (
          <div className="flex flex-col items-center gap-3">
            <label className="flex flex-col items-center justify-center w-full h-40 rounded-xl bg-[#F3FBFF] cursor-pointer hover:opacity-80 transition">
              <input
                ref={audioInputRef}
                type="file"
                accept=".mp3"
                onChange={(e) => { if (e.target.files?.[0]) setFile(e.target.files[0]); }}
                className="hidden"
              />
              {file ? (
                <span className="text-sm text-[#1A1A1A] font-medium">{file.name}</span>
              ) : (
                <span className="text-sm text-[#1A1A1A] px-5 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                  ファイルをアップロード
                </span>
              )}
            </label>

            {/* 補足画像 */}
            <label className="cursor-pointer">
              <input
                ref={imageInputRef}
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={(e) => { if (e.target.files?.[0]) setImageFile(e.target.files[0]); }}
                className="hidden"
              />
              <span className="text-xs text-[#227298] hover:opacity-70 transition">
                {imageFile ? `📎 ${imageFile.name}` : '補足画像を添付する場合はこちら'}
              </span>
            </label>
          </div>
        )}

        {inputType === 'text' && (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="学習した内容をここに貼り付けてください..."
            rows={7}
            className="w-full rounded-xl bg-[#F3FBFF] px-4 py-3 text-sm text-[#1A1A1A] placeholder-[#888888] resize-none focus:outline-none focus:ring-2 focus:ring-[#57C0F3]/40 transition border-none"
          />
        )}

        {inputType === 'url' && (
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-xl bg-[#F3FBFF] px-4 py-3 text-sm text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#57C0F3]/40 transition border-none"
          />
        )}
      </div>

      {/* 要約を表示するチェックボックス */}
      <label className="flex items-center gap-2 cursor-pointer mx-auto">
        <input
          type="checkbox"
          checked={showSummary}
          onChange={(e) => setShowSummary(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 accent-[#57C0F3]"
        />
        <span className="text-sm text-[#1A1A1A]">要約を表示する</span>
      </label>

      {/* 学習を開始ボタン */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit || isLoading}
        className="mx-auto px-12 bg-[#57C0F3] text-white text-sm font-medium py-3 rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#3aaee0] transition-colors shadow-sm"
      >
        学習を開始
      </button>
    </div>
  );
}
