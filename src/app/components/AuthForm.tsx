'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';

export default function AuthForm() {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (isSignUp) {
      const { error } = await signUp(email, password);
      if (error) {
        setError(error);
      } else {
        setMessage('確認メールを送信しました。メールを確認してください。');
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        setError('メールアドレスまたはパスワードが正しくありません');
      }
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
      <div className="text-center">
        <h2 className="text-lg font-bold text-[#1A1A1A]">
          {isSignUp ? 'アカウント作成' : 'ログイン'}
        </h2>
        <p className="text-xs text-[#888888] mt-1">
          {isSignUp ? 'メールアドレスで登録' : 'アカウントにログイン'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1A1A1A]">メールアドレス</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@mail.com"
            required
            className="w-full rounded-xl bg-[#F3FBFF] px-4 py-3 text-sm text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#57C0F3]/40 transition border-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1A1A1A]">パスワード</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="6文字以上"
            required
            minLength={6}
            className="w-full rounded-xl bg-[#F3FBFF] px-4 py-3 text-sm text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#57C0F3]/40 transition border-none"
          />
        </div>

        {error && (
          <p className="text-xs text-[#A72929] bg-[#A72929]/10 rounded-xl px-4 py-2">{error}</p>
        )}

        {message && (
          <p className="text-xs text-[#227298] bg-[#F3FBFF] rounded-xl px-4 py-2">{message}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#57C0F3] text-white text-sm font-medium py-3 rounded-full disabled:opacity-40 hover:bg-[#3aaee0] transition-colors"
        >
          {loading ? '処理中...' : isSignUp ? 'アカウントを作成' : 'ログイン'}
        </button>
      </form>

      <button
        onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage(''); }}
        className="text-xs text-[#227298] hover:opacity-70 transition-opacity"
      >
        {isSignUp ? 'すでにアカウントをお持ちの方はこちら' : 'アカウントをお持ちでない方はこちら'}
      </button>
    </div>
  );
}
