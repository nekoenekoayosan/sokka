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
  const [summaryId, setSummaryId] = useState<string>('');

  const [messages, setMessages] = useState<Message[]>([]);
  const [chatTurn, setChatTurn] = useState(0);
  const [isLastTurn, setIsLastTurn] = useState(false);
  const [chatSummary, setChatSummary] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  // ---- 入力送信 ----
  const handleSubmit = async (inputType: InputType, content: string | File) => {
    setPhase('loading');
    setLoadingStatus(LOADING_STEPS[0]);

    try {
      const formData = new FormData();

      if (inputType === 'audio' && content instanceof File) {
        formData.append('input_type', 'audio');
        formData.append('file', content);
      } else if (inputType === 'text' && typeof content === 'string') {
        formData.append('input_type', 'text');
        formData.append('content', content);
      } else if (inputType === 'url' && typeof content === 'string') {
        formData.append('input_type', 'text');
        formData.append('content', content);
      }

      setLoadingStatus(LOADING_STEPS[1]);

      const res = await fetch('/api/process', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || '処理に失敗しました');
      }

      setLoadingStatus(LOADING_STEPS[2]);

      const data = await res.json();
      setSummaryId(data.summary_id);
      setTerms(data.terms);
      setPhase('quiz');
    } catch (error) {
      console.error('Process error:', error);
      alert(error instanceof Error ? error.message : '処理中にエラーが発生しました');
      setPhase('input');
    }
  };

  // ---- 答え合わせ ----
  const handleCheck = async (term: string, correctMeaning: string, userAnswer: string) => {
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
      throw new Error('判定に失敗しました');
    }

    return await res.json();
  };

  const handleSave = (_term: string, _meaning: string) => {
    // TODO: vocabularyテーブルへの保存
  };

  // ---- クイズ完了 → チャット開始 ----
  const handleQuizComplete = async () => {
    setPhase('loading');
    setLoadingStatus('会話を準備中...');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary_id: summaryId,
          messages: [],
          turn: 1,
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
      alert('チャットの開始に失敗しました');
      setPhase('input');
    }
  };

  // ---- チャット送信 ----
  const handleChatSend = async (text: string) => {
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
      const errorMessage: Message = { role: 'ai', content: 'エラーが発生しました。もう一度お試しください。' };
      setMessages((prev) => [...prev, errorMessage]);
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
