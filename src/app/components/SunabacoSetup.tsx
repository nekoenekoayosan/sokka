'use client';

import { useState } from 'react';

const COURSES = [
  'プログラミング',
  'DX人材育成講座',
  'AI人材育成講座',
  'デザインコース',
  'WEBデザインコース',
  'Word Pressコース',
  'LP基礎コース',
  'デジタルマーケティングコース',
  'キッズプログラミング',
  'ECマスターコース',
] as const;

export interface SunabacoConfig {
  course: string;
  period: string;
  curriculum: string;
}

interface SunabacoSetupProps {
  onConfirm: (config: SunabacoConfig) => void;
  initialConfig?: SunabacoConfig | null;
}

export default function SunabacoSetup({ onConfirm, initialConfig }: SunabacoSetupProps) {
  const [course, setCourse] = useState(initialConfig?.course || '');
  const [period, setPeriod] = useState(initialConfig?.period || '');
  const [curriculum, setCurriculum] = useState(initialConfig?.curriculum || '');

  const canSubmit = course && period.trim();

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* 学習設定 */}
      <div className="text-center">
        <h3 className="text-sm font-bold text-[#1A1A1A]">学習を始める</h3>
        <p className="text-xs text-[#888888] mt-1">コースと期を選択してください</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
        {/* コース選択 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1A1A1A]">コース</label>
          <select
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            className="w-full rounded-xl bg-[#F3FBFF] px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#57C0F3]/40 transition border-none appearance-none"
          >
            <option value="">コースを選択してください</option>
            {COURSES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* 期数入力 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1A1A1A]">期</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="52"
              min="1"
              className="w-24 rounded-xl bg-[#F3FBFF] px-4 py-3 text-sm text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#57C0F3]/40 transition border-none"
            />
            <span className="text-sm text-[#1A1A1A]">期</span>
          </div>
        </div>

        {/* カリキュラム入力 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1A1A1A]">カリキュラム（今日の学習テーマ）</label>
          <input
            type="text"
            value={curriculum}
            onChange={(e) => setCurriculum(e.target.value)}
            placeholder="例: バージョン管理について"
            className="w-full rounded-xl bg-[#F3FBFF] px-4 py-3 text-sm text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#57C0F3]/40 transition border-none"
          />
        </div>
      </div>

      <button
        onClick={() => canSubmit && onConfirm({ course, period, curriculum })}
        disabled={!canSubmit}
        className="mx-auto px-12 bg-[#1A1A1A] text-white text-sm font-medium py-3 rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#333] transition-colors shadow-sm"
      >
        この設定で学習を始める
      </button>

      {/* SUNABACO紹介セクション */}
      <div className="bg-[#1A1A1A] rounded-2xl p-6 flex flex-col gap-3">
        <p className="text-xs text-[#57C0F3] font-medium tracking-widest">Technology & Business</p>
        <h2 className="text-lg font-bold text-white leading-snug">
          SUNABACOとは？
        </h2>
        <p className="text-base font-bold text-[#F5D000] mt-2">日本最大級のビジネススクール</p>
        <p className="text-sm text-white">ありとあらゆるコースがあり、あなたのビジネスを加速します！</p>
        <p className="text-sm text-[#CCCCCC] leading-relaxed">
          よくあるエンジニア育成を目的にしたプログラミングスクールではありません。マーケティング、デザイン、組織運営、ビジネスに必要な技術を体系的に学べます。
        </p>
        <div className="flex flex-wrap gap-2 mt-1">
          {COURSES.map((c) => (
            <span key={c} className="text-[10px] text-[#888888] bg-[#2A2A2A] px-2.5 py-1 rounded-full">{c}</span>
          ))}
        </div>
      </div>

      {/* SUNABACOリンク */}
      <div className="grid grid-cols-2 gap-3 mt-2">
        <a
          href="https://sunabaco.com"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#1A1A1A] rounded-2xl p-5 flex flex-col gap-2 hover:opacity-90 transition-opacity"
        >
          <p className="text-xs text-[#57C0F3] font-medium">OFFICIAL</p>
          <p className="text-sm text-white font-bold">SUNABACO公式サイト</p>
          <p className="text-xs text-[#888888]">sunabaco.com</p>
        </a>
        <a
          href="https://www.youtube.com/playlist?list=PL0ScNd_b1toyUdX6ogKHb9lYA1femfk22"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#1A1A1A] rounded-2xl p-5 flex flex-col gap-2 hover:opacity-90 transition-opacity"
        >
          <p className="text-xs text-[#F5D000] font-medium">YOUTUBE</p>
          <p className="text-sm text-white font-bold">過去の卒業制作</p>
          <p className="text-xs text-[#888888]">先輩たちの作品を見る</p>
        </a>
      </div>
    </div>
  );
}
