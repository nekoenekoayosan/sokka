'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '../components/Header';
import InputArea from '../components/InputArea';
import LoadingScreen from '../components/LoadingScreen';
import QuizArea, { Term } from '../components/QuizArea';
import FlashCardReview from '../components/FlashCardReview';
import ChatArea, { Message } from '../components/ChatArea';

const DEMO_TERMS: Term[] = [
  {
    word: 'アウトプット',
    explanation: '学んだ内容を自分の言葉で説明・表現すること',
    difficulty: 'easy',
    hint: 'Sokka!が解決しようとしている学習課題のキーワードです',
    trivia: '「ラーニングピラミッド」によると、人に教えることで記憶定着率は90%に達するとされています',
  },
  {
    word: 'ソクラテス式問答',
    explanation: '問いかけと対話を通じて理解を深める学習法',
    difficulty: 'easy',
    hint: 'Sokka!のチャットフェーズで採用している会話スタイルです',
    trivia: '古代ギリシャの哲学者ソクラテスは自分では一冊も本を書かず、すべて弟子プラトンが記録しました',
  },
  {
    word: 'Gemini API',
    explanation: 'Googleが提供するAIモデルのAPI。要約・採点・チャットに使用される',
    difficulty: 'hard',
    hint: 'Sokka!のAI処理全般を担っているGoogleのサービスです',
    trivia: 'Geminiはラテン語で「双子」を意味し、テキストと画像の両方を扱えることに由来します',
  },
  {
    word: 'API Routes',
    explanation: 'Next.jsのサーバーサイド機能。バックエンド処理をフロントエンドと同一リポジトリで管理できる',
    difficulty: 'hard',
    hint: 'Sokka!のバックエンドの仕組みに関係しています',
    trivia: 'Next.jsはVercel社が開発し、2016年に初版がリリースされました',
  },
  {
    word: 'Supabase',
    explanation: 'PostgreSQLベースのデータベースをクラウドで提供するサービス',
    difficulty: 'hard',
    hint: 'Sokka!の単語帳データの保存に使われているサービスです',
    trivia: 'Supabaseは「Firebaseのオープンソース代替」として2020年に誕生しました',
  },
  {
    word: 'CI/CD',
    explanation: 'GitHubへのプッシュをトリガーに自動でテスト・デプロイを行う仕組み',
    difficulty: 'hard',
    hint: 'Sokka!の開発・運用フローに使われている自動化の仕組みです',
    trivia: 'CI/CDの概念は2000年代初頭のアジャイル開発の普及とともに広まりました',
  },
];

const DEMO_CHAT = [
  'お疲れさまでした！Sokka!が解決しようとしている学習上の課題について、自分の言葉で説明してみてください。',
  'そうですね！受動的なインプットだけでは記憶が定着しにくいという課題でしたね。では、Sokka!はその課題をどのような流れで解決していますか？',
  '「インプット→理解→定着」のサイクルですね。このうち、Gemini APIはどのフェーズで活躍していると思いますか？',
  '正解です！AIが要約・採点・チャットの全フェーズを担っているんですね。技術面について、Next.jsとSupabaseはそれぞれ何の役割を担っていますか？',
  '完璧な理解です！Sokka!はGemini APIで学習内容を自動分析し、クイズとチャットで能動的な定着を促す、まさに現代の学習課題に応えたアプリですね。今日の学習お疲れさまでした！',
];

type Phase = 'input' | 'loading' | 'review' | 'quiz' | 'chat';
type InputType = 'audio' | 'text' | 'url';

export default function LearnPage() {
  return (
    <Suspense>
      <LearnContent />
    </Suspense>
  );
}

function LearnContent() {
  const searchParams = useSearchParams();
  const isDemo = searchParams.get('demo') === 'true';

  const [phase, setPhase] = useState<Phase>('input');
  const [loadingStatus, setLoadingStatus] = useState('処理中...');

  const [terms, setTerms] = useState<Term[]>([]);
  const [summaryId, setSummaryId] = useState<string | null>(null);
  const [summaryText, setSummaryText] = useState('');
  const [showSummary, setShowSummary] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [chatTurn, setChatTurn] = useState(0);
  const [isLastTurn, setIsLastTurn] = useState(false);
  const [chatSummary, setChatSummary] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [userNote, setUserNote] = useState('');

  const handleSubmit = async (inputType: InputType, content: string | File, wantSummary: boolean) => {
    setShowSummary(wantSummary);

    if (isDemo) {
      setPhase('loading');
      setLoadingStatus('文字起こし中...');
      await new Promise((r) => setTimeout(r, 1500));
      setLoadingStatus('要約中...');
      await new Promise((r) => setTimeout(r, 1500));
      setLoadingStatus('語句を抽出中...');
      await new Promise((r) => setTimeout(r, 1500));
      setTerms(DEMO_TERMS);
      setSummaryText('これはデモ用の要約テキストです。Sokka!は学習内容を自動で分析し、クイズとチャットで能動的な定着を促すアプリケーションです。');
      setPhase('review');
      return;
    }

    setPhase('loading');
    setLoadingStatus('文字起こし中...');

    const t1 = setTimeout(() => setLoadingStatus('要約中...'), 3000);
    const t2 = setTimeout(() => setLoadingStatus('語句を抽出中...'), 6000);

    try {
      const formData = new FormData();

      if (inputType === 'audio' && content instanceof File) {
        formData.append('input_type', 'audio');
        formData.append('file', content);
      } else if (inputType === 'text' && typeof content === 'string') {
        formData.append('input_type', 'text');
        formData.append('content', content);
      } else if (inputType === 'url' && typeof content === 'string') {
        formData.append('input_type', 'url');
        formData.append('content', content);
      }

      const res = await fetch('/api/process', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        let errorMessage = `処理に失敗しました (${res.status})`;
        try {
          const err = await res.json();
          errorMessage = err.error || errorMessage;
        } catch {
          // JSONじゃないエラーの場合はステータスコードだけ表示
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      setSummaryId(data.summary_id);
      setTerms(data.terms);
      setSummaryText(data.summary || '');
      setPhase('review');
    } catch (error) {
      console.error('Process error:', error);
      alert(error instanceof Error ? error.message : '処理中にエラーが発生しました');
      setPhase('input');
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
    }
  };

  const handleCheck = async (term: string, correctMeaning: string, userAnswer: string) => {
    if (isDemo) {
      await new Promise((r) => setTimeout(r, 800));
      const isCorrect = userAnswer.length > 10;
      return {
        is_correct: isCorrect,
        feedback: isCorrect
          ? 'その通りです！しっかり理解できています。'
          : 'もう少し詳しく説明してみましょう。ヒントを参考にしてみてください。',
        related_links: [],
      };
    }

    const res = await fetch('/api/quiz/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        term,
        correct_meaning: correctMeaning,
        user_answer: userAnswer,
      }),
    });

    if (!res.ok) {
      return {
        is_correct: false,
        feedback: 'エラーが発生しました。もう一度試してください。',
        related_links: [],
      };
    }

    return await res.json();
  };

  const handleSave = (_term: string, _meaning: string) => {
    // TODO: vocabularyテーブルへの保存
  };

  const handleQuizComplete = async () => {
    if (isDemo) {
      setPhase('loading');
      setLoadingStatus('会話を準備中...');
      await new Promise((r) => setTimeout(r, 1000));
      setMessages([{ role: 'ai', content: DEMO_CHAT[0] }]);
      setChatTurn(1);
      setPhase('chat');
      return;
    }

    setPhase('loading');
    setLoadingStatus('会話を準備中...');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary_id: summaryId,
          messages: [],
          turn: 0,
        }),
      });

      if (!res.ok) throw new Error('チャット開始に失敗しました');

      const data = await res.json();
      const firstMessage: Message = { role: 'ai', content: data.reply };
      setMessages([firstMessage]);
      setChatTurn(1);
      setPhase('chat');
    } catch (error) {
      console.error('Chat start error:', error);
      setMessages([{
        role: 'ai',
        content: '学習お疲れさまでした！今日学んだ内容について、もう少し深掘りしてみましょう。',
      }]);
      setChatTurn(1);
      setPhase('chat');
    }
  };

  const handleChatSend = async (text: string) => {
    if (isDemo) {
      if (!text.trim() || isSending) return;
      setIsSending(true);
      setChatInput('');
      setMessages((prev) => [...prev, { role: 'user', content: text }]);
      await new Promise((r) => setTimeout(r, 800));
      const reply = DEMO_CHAT[chatTurn] ?? DEMO_CHAT[DEMO_CHAT.length - 1];
      const isLast = chatTurn >= 4;
      setMessages((prev) => [...prev, { role: 'ai', content: reply }]);
      setChatTurn((prev) => prev + 1);
      if (isLast) {
        setIsLastTurn(true);
        setChatSummary(reply);
      }
      setIsSending(false);
      return;
    }

    if (!text.trim() || isSending) return;
    setIsSending(true);
    setChatInput('');

    const userMessage: Message = { role: 'user', content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    try {
      const nextTurn = chatTurn + 1;
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary_id: summaryId,
          messages: updatedMessages,
          turn: nextTurn,
        }),
      });

      if (!res.ok) throw new Error('チャット送信に失敗しました');

      const data = await res.json();
      const aiReply: Message = { role: 'ai', content: data.reply };
      setMessages((prev) => [...prev, aiReply]);
      setChatTurn(nextTurn);

      if (data.is_last_turn) {
        setIsLastTurn(true);
        setChatSummary(data.summary || data.reply);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: 'エラーが発生しました。もう一度お試しください。' },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col">
      <Header onLogoClick={() => setPhase('input')} />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 flex flex-col gap-6">

        {phase === 'input' && (
          <InputArea onSubmit={handleSubmit} isLoading={false} />
        )}

        {phase === 'loading' && (
          <LoadingScreen status={loadingStatus} onNoteChange={setUserNote} />
        )}

        {phase === 'review' && terms.length > 0 && (
          <FlashCardReview terms={terms} onStartQuiz={() => setPhase('quiz')} />
        )}

        {phase === 'quiz' && showSummary && summaryText && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-bold text-[#1A1A1A] mb-3">要約</h2>
            <p className="text-sm text-[#1A1A1A] leading-relaxed whitespace-pre-wrap">{summaryText}</p>
          </div>
        )}

        {phase === 'quiz' && terms.length > 0 && (
          <QuizArea
            terms={terms}
            onComplete={handleQuizComplete}
            onCheck={handleCheck}
            onSave={handleSave}
            onSkipToChat={handleQuizComplete}
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
