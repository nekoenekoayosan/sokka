'use client';

import { useState, useRef } from 'react';

type InputType = 'text' | 'image' | 'audio';

interface InputAreaProps {
  onSubmit: (inputType: InputType, content: string | File) => void;
  isLoading: boolean;
}

export default function InputArea({ onSubmit, isLoading }: InputAreaProps) {
  const [inputType, setInputType] = useState<InputType>('text');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs: { type: InputType; label: string }[] = [
    { type: 'text',  label: 'テキスト' },
    { type: 'image', label: '画像' },
    { type: 'audio', label: '音声' },
  ];

  const handleTabChange = (type: InputType) => {
    setInputType(type);
    setFile(null);
    setText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleSubmit = () => {
    if (inputType === 'text') {
      if (!text.trim()) return;
      onSubmit('text', text);
    } else {
      if (!file) return;
      onSubmit(inputType, file);
    }
  };

  const canSubmit = inputType === 'text' ? text.trim().length > 0 : file !== null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      {/* トグルスイッチ */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-4 w-fit">
        {tabs.map(({ type, label }) => (
          <button
            key={type}
            onClick={() => handleTabChange(type)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              inputType === type
                ? 'bg-[#1B4FD8] text-white'
                : 'text-[#888888] hover:text-[#1A1A1A]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 入力エリア */}
      {inputType === 'text' && (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="学習した内容をここに貼り付けてください..."
          rows={6}
          className="w-full rounded-xl border border-gray-200 bg-[#F5F0E8] px-4 py-3 text-sm text-[#1A1A1A] placeholder-[#888888] resize-none focus:outline-none focus:ring-2 focus:ring-[#1B4FD8]/30 transition"
        />
      )}

      {inputType === 'image' && (
        <label className="flex flex-col items-center justify-center w-full h-36 rounded-xl border-2 border-dashed border-gray-200 bg-[#F5F0E8] cursor-pointer hover:border-[#1B4FD8]/40 transition">
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="hidden"
          />
          {file ? (
            <span className="text-sm text-[#1A1A1A] font-medium">{file.name}</span>
          ) : (
            <>
              <span className="text-2xl mb-2">🖼</span>
              <span className="text-sm text-[#888888]">JPG・PNG をアップロード</span>
            </>
          )}
        </label>
      )}

      {inputType === 'audio' && (
        <label className="flex flex-col items-center justify-center w-full h-36 rounded-xl border-2 border-dashed border-gray-200 bg-[#F5F0E8] cursor-pointer hover:border-[#1B4FD8]/40 transition">
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3"
            onChange={handleFileChange}
            className="hidden"
          />
          {file ? (
            <span className="text-sm text-[#1A1A1A] font-medium">{file.name}</span>
          ) : (
            <>
              <span className="text-2xl mb-2">🎙</span>
              <span className="text-sm text-[#888888]">MP3 をアップロード</span>
            </>
          )}
        </label>
      )}

      {/* 送信ボタン */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit || isLoading}
        className="mt-4 w-full bg-[#1B4FD8] text-white text-sm font-medium py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1541b8] transition-colors"
      >
        学習を開始
      </button>
    </div>
  );
}
