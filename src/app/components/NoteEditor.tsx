'use client';

import { useRef, useCallback, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

interface NoteEditorProps {
  content: string;
  onChange: (html: string) => void;
}

const FONT_SIZES = [
  { label: '小', value: '2' },
  { label: '中', value: '3' },
  { label: '大', value: '5' },
  { label: '特大', value: '7' },
];

const COLORS = [
  { label: '黒', value: '#1A1A1A' },
  { label: '赤', value: '#DC2626' },
  { label: '青', value: '#2563EB' },
  { label: '緑', value: '#16A34A' },
  { label: 'オレンジ', value: '#EA580C' },
  { label: '紫', value: '#9333EA' },
];

export default function NoteEditor({ content, onChange }: NoteEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initializedRef = useRef(false);

  // 初回のみcontentを反映
  useEffect(() => {
    if (editorRef.current && !initializedRef.current) {
      editorRef.current.innerHTML = content;
      initializedRef.current = true;
    }
  }, [content]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabaseBrowser) return;

    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}.${ext}`;

    const { data, error } = await supabaseBrowser.storage
      .from('note-images')
      .upload(fileName, file);

    if (error) {
      alert('画像のアップロードに失敗しました');
      return;
    }

    const { data: urlData } = supabaseBrowser.storage
      .from('note-images')
      .getPublicUrl(data.path);

    const img = `<img src="${urlData.publicUrl}" style="max-width:100%;border-radius:8px;margin:8px 0;" />`;
    document.execCommand('insertHTML', false, img);
    handleInput();

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-2">
      {/* ツールバー */}
      <div className="flex flex-wrap items-center gap-1 bg-white rounded-xl border border-gray-100 shadow-sm p-2">
        {/* 太字 */}
        <button
          onClick={() => execCommand('bold')}
          className="px-2.5 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors"
          title="太字"
        >
          B
        </button>

        {/* 下線 */}
        <button
          onClick={() => execCommand('underline')}
          className="px-2.5 py-1.5 rounded-lg text-xs underline hover:bg-gray-100 transition-colors"
          title="下線"
        >
          U
        </button>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* 文字サイズ */}
        {FONT_SIZES.map((size) => (
          <button
            key={size.value}
            onClick={() => execCommand('fontSize', size.value)}
            className="px-2 py-1.5 rounded-lg text-xs hover:bg-gray-100 transition-colors"
            title={`文字サイズ: ${size.label}`}
          >
            {size.label}
          </button>
        ))}

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* 文字色 */}
        {COLORS.map((color) => (
          <button
            key={color.value}
            onClick={() => execCommand('foreColor', color.value)}
            className="w-6 h-6 rounded-full border border-gray-200 hover:scale-110 transition-transform"
            style={{ backgroundColor: color.value }}
            title={color.label}
          />
        ))}

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* 画像挿入 */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-2.5 py-1.5 rounded-lg text-xs hover:bg-gray-100 transition-colors"
          title="画像を挿入"
        >
          🖼️
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* エディタ本体 */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[300px] bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-sm text-[#1A1A1A] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#57C0F3]/40 transition"
        style={{ wordBreak: 'break-word' }}
      />
    </div>
  );
}
