'use client';

import { useState } from 'react';
import Header from './components/Header';
import InputArea from './components/InputArea';
import LoadingScreen from './components/LoadingScreen';
import QuizArea, { Term } from './components/QuizArea';
import ChatArea, { Message } from './components/ChatArea';

type Phase = 'input' | 'loading' | 'quiz' | 'chat';
type InputType = 'audio' | 'text' | 'url';

const LOADING_STEPS = ['文字起こし中...', '要約中...', '語句を抽出中...'];

export default function Home() {
  const [phase, setPhase] = useState<Phase>('input');
  const [loadingStatus, setLoadingStatus] = useState(LOADING_STEPS[0]);

  const [terms, setTerms] = useState<Term[]>([]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [chatTurn, setChatTurn] = useState(0);
  const [isLastTurn, setIsLastTurn] = useState(false);
  const [chatSummary, setChatSummary] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  // ---- 入力送信 ----
  const handleSubmit = async (_inputType: InputType, _content: string | File) => {
    setPhase('loading');

    for (let i = 0; i < LOADING_STEPS.length; i++) {
      setLoadingStatus(LOADING_STEPS[i]);
      await new Promise((r) => setTimeout(r, 1200));
    }

    // モックデータ（後でAPIに差し替え）
    const mockTerms: Term[] = [
      { word: 'API', explanation: 'アプリケーション間でデータをやりとりするための取り決め', difficulty: 'easy' },
      { word: 'コンポーネント', explanation: 'UIを構成する再利用可能な部品', difficulty: 'easy' },
      { word: 'レンダリング', explanation: 'データをもとにHTMLを生成して画面に表示すること', difficulty: 'hard' },
    ];
    setTerms(mockTerms);
    setPhase('quiz');
  };

  // ---- 答え合わせ ----
  const handleCheck = async (term: string, _correctMeaning: string, userAnswer: string) => {
    await new Promise((r) => setTimeout(r, 800));
    const isCorrect = userAnswer.length > 5;
    return {
      is_correct: isCorrect,
      feedback: isCorrect
        ? 'その通りです！正確に理解できています。'
        : 'もう少し詳しく説明してみてください。キーワードを思い出してみよう。',
      related_links: [
        { title: 'MDN Web Docs - ' + term, url: 'https://developer.mozilla.org/ja/' },
      ],
    };
  };

  const handleSave = (_term: string, _meaning: string) => {
    // 後でAPIに差し替え
  };

  // ---- クイズ完了 → チャット開始 ----
  const handleQuizComplete = async () => {
    setPhase('loading');
    setLoadingStatus('会話を準備中...');
    await new Promise((r) => setTimeout(r, 800));

    const firstMessage: Message = {
      role: 'ai',
      content: '学習お疲れさまでした！今日学んだ内容について、もう少し深掘りしてみましょう。\n\nAPIとコンポーネントの関係を自分の言葉で説明してみてください。',
    };
    setMessages([firstMessage]);
    setChatTurn(1);
    setPhase('chat');
  };

  // ---- チャット送信 ----
  const handleChatSend = async (text: string) => {
    if (!text.trim() || isSending) return;
    setIsSending(true);
    setChatInput('');

    const userMessage: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);

    await new Promise((r) => setTimeout(r, 1000));
    const nextTurn = chatTurn + 1;
    const isLast = nextTurn >= 5;

    const aiReply: Message = {
      role: 'ai',
      content: isLast
        ? 'とても良い理解です！今日の学習をしっかり自分のものにできていますね。'
        : '良い答えです。では次に、実際にどんな場面で使われるか考えてみましょう。',
    };
    setMessages((prev) => [...prev, aiReply]);
    setChatTurn(nextTurn);

    if (isLast) {
      setIsLastTurn(true);
      setChatSummary(
        '今日はAPIとコンポーネントについて学びました。\n・APIはシステム間の橋渡し役\n・コンポーネントはUIの部品単位\nこの2つを組み合わせることでモダンなWebアプリが作れます。'
      );
    }
    setIsSending(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 flex flex-col gap-6">

        {phase === 'input' && (
          <InputArea onSubmit={handleSubmit} isLoading={false} />
        )}

        {phase === 'loading' && (
          <LoadingScreen status={loadingStatus} />
        )}

        {phase === 'quiz' && terms.length > 0 && (
          <QuizArea
            terms={terms}
            onComplete={handleQuizComplete}
            onCheck={handleCheck}
            onSave={handleSave}
          />
        )}

        {phase === 'chat' && (
          <ChatArea
            messages={messages}
            turn={chatTurn}
            maxTurns={5}
            isLast={isLastTurn}
            summary={chatSummary}
            onSend={handleChatSend}
            isSending={isSending}
            inputValue={chatInput}
            onInputChange={setChatInput}
          />
        )}
      </main>
    </div>
  );
}
