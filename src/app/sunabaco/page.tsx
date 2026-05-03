'use client';

import { Suspense, useState } from 'react';
import { fetchWithAuth } from '@/lib/fetch-with-auth';
import { useSearchParams } from 'next/navigation';
import Header from '../components/Header';
import InputArea from '../components/InputArea';
import LoadingScreen from '../components/LoadingScreen';
import QuizArea, { Term, QuizScore } from '../components/QuizArea';
import FlashCardReview from '../components/FlashCardReview';
import ChatArea, { Message } from '../components/ChatArea';
import SunabacoSetup, { SunabacoConfig } from '../components/SunabacoSetup';

const DEMO_TERMS: Term[] = [
  {
    word: 'アウトプット',
    explanation: '学んだ内容を自分の言葉で説明・表現すること',
    difficulty: 'easy',
    trivia: '「ラーニングピラミッド」によると、人に教えることで記憶定着率は90%に達するとされています',
  },
  {
    word: 'ソクラテス式問答',
    explanation: '問いかけと対話を通じて理解を深める学習法',
    difficulty: 'easy',
    trivia: '古代ギリシャの哲学者ソクラテスは自分では一冊も本を書かず、すべて弟子プラトンが記録しました',
  },
  {
    word: 'Gemini API',
    explanation: 'Googleが提供するAIモデルのAPI。要約・採点・チャットに使用される',
    difficulty: 'hard',
    trivia: 'Geminiはラテン語で「双子」を意味し、テキストと画像の両方を扱えることに由来します',
  },
];

const DEMO_CHAT = [
  'お疲れさまでした！今日学んだSokka!の仕組みについて、一番「なるほど！」と思った部分を教えてください。',
  '面白い視点ですね！実は「ラーニングピラミッド」という研究では、人に教えることで記憶定着率が90%まで上がると言われています。Sokka!のチャット機能はまさにその原理を使っています。では、AIがなぜ「答えを教える」のではなく「問いかける」設計になっていると思いますか？',
  'そうです！これはソクラテス式問答という2500年前の哲学的手法と同じアプローチです。Googleの社内研修でも活用されているんですよ。では、Gemini APIのような生成AIがこの役割を担えるようになったのは、なぜだと思いますか？',
  '良い洞察です！大規模言語モデルは膨大なテキストから「文脈に合った応答」を学習しています。ちなみにGeminiはテキスト・音声・画像を扱えるマルチモーダルAIで、Sokka!の音声入力対応もそのおかげです。今後、どんな場面でSokka!を使ってみたいですか？',
  '素敵なアイデアです！「インプット→アウトプット→深掘り」のサイクルは、AI時代でも変わらない最強の学習法です。今日出てきたキーワード（ラーニングピラミッド・マルチモーダルAIなど）をぜひ自分でも調べてみてください。学習お疲れさまでした！',
];

const DEMO_SUMMARY = 'Sokka!の設計原理はラーニングピラミッドとソクラテス式問答にあります。AIが答えを教えるのではなく問いかけることで、能動的なアウトプットを促し記憶定着率を高めます。今日の学びをきっかけに、生成AIと学習の関係をさらに探求してみてください。';

type Phase = 'setup' | 'input' | 'loading' | 'review' | 'quiz' | 'chat';
type InputType = 'audio' | 'text' | 'url';

export default function SunabacoPage() {
  return (
    <Suspense>
      <SunabacoContent />
    </Suspense>
  );
}

function SunabacoContent() {
  const searchParams = useSearchParams();
  const isDemo = searchParams.get('demo') === 'true';

  const [phase, setPhase] = useState<Phase>('setup');
  const [loadingStatus, setLoadingStatus] = useState('処理中...');
  const [sunabacoConfig, setSunabacoConfig] = useState<SunabacoConfig | null>(null);

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
  const [loadingReady, setLoadingReady] = useState(false);
  const [quizScore, setQuizScore] = useState<QuizScore | null>(null);

  const handleSubmit = async (inputType: InputType, content: string | File, wantSummary: boolean) => {
    setShowSummary(wantSummary);
    setLoadingReady(false);

    if (isDemo) {
      setPhase('loading');
      setLoadingStatus('文字起こし中...');
      await new Promise((r) => setTimeout(r, 1500));
      setLoadingStatus('要約中...');
      await new Promise((r) => setTimeout(r, 1500));
      setLoadingStatus('語句を抽出中...');
      await new Promise((r) => setTimeout(r, 1500));
      setTerms(DEMO_TERMS);
      setSummaryText('これはデモ用の要約テキストです。');
      setLoadingReady(true);
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

      const res = await fetchWithAuth('/api/process', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        let errorMessage = `処理に失敗しました (${res.status})`;
        try {
          const err = await res.json();
          errorMessage = err.error || errorMessage;
        } catch {}
        throw new Error(errorMessage);
      }

      const data = await res.json();
      setSummaryId(data.summary_id);
      setTerms(data.terms);
      setSummaryText(data.summary || '');
      setLoadingReady(true);
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
          : 'もう少し詳しく説明してみましょう。',
        related_links: [],
      };
    }

    const res = await fetchWithAuth('/api/quiz/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ term, correct_meaning: correctMeaning, user_answer: userAnswer }),
    });

    if (!res.ok) {
      return { is_correct: false, feedback: 'エラーが発生しました。もう一度試してください。', related_links: [] };
    }

    return await res.json();
  };

  const handleSave = (_term: string, _meaning: string) => {};

  const handleQuizComplete = async (score?: QuizScore) => {
    if (score) setQuizScore(score);
    if (isDemo) {
      if (!score) setQuizScore({ correct: 3, total: 3 });
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
      const res = await fetchWithAuth('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary_id: summaryId, messages: [], turn: 0, is_sunabaco: true, user_note: userNote || undefined }),
      });

      if (!res.ok) throw new Error('チャット開始に失敗しました');

      const data = await res.json();
      setMessages([{ role: 'ai', content: data.reply }]);
      setChatTurn(1);
      setPhase('chat');
    } catch (error) {
      console.error('Chat start error:', error);
      setMessages([{ role: 'ai', content: '学習お疲れさまでした！今日学んだ内容について深掘りしてみましょう。' }]);
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
      if (isLast) { setIsLastTurn(true); setChatSummary(DEMO_SUMMARY); }
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
      const res = await fetchWithAuth('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary_id: summaryId, messages: updatedMessages, turn: nextTurn, is_sunabaco: true }),
      });

      if (!res.ok) throw new Error('チャット送信に失敗しました');

      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'ai', content: data.reply }]);
      setChatTurn(nextTurn);

      if (data.is_last_turn) {
        setIsLastTurn(true);
        setChatSummary(data.summary || data.reply);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [...prev, { role: 'ai', content: 'エラーが発生しました。もう一度お試しください。' }]);
    } finally {
      setIsSending(false);
    }
  };

  const sunabacoLabel = sunabacoConfig
    ? `${sunabacoConfig.course} ${sunabacoConfig.period}期${sunabacoConfig.curriculum ? ` / ${sunabacoConfig.curriculum}` : ''}`
    : undefined;

  return (
    <div className="min-h-screen bg-[#E8F0F5] flex flex-col">
      <Header
        onLogoClick={() => setPhase('setup')}
        sunabacoLabel={sunabacoLabel}
        isSunabaco
      />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 flex flex-col gap-6">

        {phase === 'setup' && (
          <SunabacoSetup
            initialConfig={sunabacoConfig}
            onConfirm={(config) => {
              setSunabacoConfig(config);
              setPhase('input');
            }}
          />
        )}

        {phase === 'input' && (
          <>
            {sunabacoConfig && (
              <div className="bg-[#1A1A1A] rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#57C0F3] font-medium">SUNABACO {sunabacoConfig.course} {sunabacoConfig.period}期</p>
                  {sunabacoConfig.curriculum && (
                    <p className="text-sm text-white font-bold mt-0.5">{sunabacoConfig.curriculum}</p>
                  )}
                </div>
                <button
                  onClick={() => setPhase('setup')}
                  className="text-xs text-[#888888] hover:text-white transition-colors"
                >
                  変更
                </button>
              </div>
            )}
            <InputArea onSubmit={handleSubmit} isLoading={false} />
          </>
        )}

        {phase === 'loading' && (
          <LoadingScreen
            status={loadingStatus}
            onNoteChange={setUserNote}
            isReady={loadingReady}
            onProceed={() => setPhase('review')}
          />
        )}

        {phase === 'review' && terms.length > 0 && (
          <FlashCardReview
            terms={terms}
            onStartQuiz={() => setPhase('quiz')}
            title={sunabacoConfig?.curriculum ? `復習: ${sunabacoConfig.curriculum}` : undefined}
          />
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
            title={sunabacoConfig?.curriculum || 'データの要点'}
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
            terms={terms}
            userNote={userNote}
            resultLevel={quizScore ? (quizScore.correct === quizScore.total ? '3' : quizScore.correct >= quizScore.total / 2 ? '2' : '1') : '2'}
            quizScore={quizScore ?? undefined}
            sunabacoLabel={sunabacoLabel}
          />
        )}
      </main>
    </div>
  );
}
