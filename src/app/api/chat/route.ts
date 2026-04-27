import { NextRequest, NextResponse } from "next/server";
import { proModel, generateWithRetry } from "@/lib/gemini";
import { supabase } from "@/lib/supabase";

const MAX_TURNS = 5;

export async function POST(request: NextRequest) {
  try {
    const { summary_id, messages, turn } = await request.json();

    if (!summary_id || turn === undefined) {
      return NextResponse.json(
        { error: "必須パラメータが不足しています" },
        { status: 400 }
      );
    }

    // 要約データを取得
    const { data: summaryData, error: summaryError } = await supabase
      .from("summaries")
      .select("summary, terms")
      .eq("id", summary_id)
      .single();

    if (summaryError || !summaryData) {
      return NextResponse.json(
        { error: "要約データが見つかりません" },
        { status: 404 }
      );
    }

    const isLastTurn = turn >= MAX_TURNS;

    const systemPrompt = `あなたは優しくて知識豊富な先生です。以下の学習内容について、生徒と対話しながら理解を深める手助けをしてください。

【学習内容の要約】
${summaryData.summary}

【重要用語】
${JSON.stringify(summaryData.terms, null, 2)}

ルール：
- 生徒の理解度に合わせて質問してください
- 一度に聞く質問は1つだけにしてください
- 具体例を交えてわかりやすく説明してください
- 褒めるところは褒めてください
${isLastTurn ? "- これが最後のターンです。会話のまとめを生成してください。学習した内容のポイントを整理し、今後の学習へのアドバイスを含めてください。" : ""}`;

    const chatHistory = (messages || []).map(
      (msg: { role: string; content: string }) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })
    );

    const chat = proModel.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        {
          role: "model",
          parts: [
            {
              text: "はい、先生として生徒さんの学習をサポートします。",
            },
          ],
        },
        ...chatHistory,
      ],
    });

    const lastMessage =
      messages && messages.length > 0
        ? messages[messages.length - 1].content
        : "学習を始めましょう。最初の質問をお願いします。";

    const result = await generateWithRetry(() =>
      chat.sendMessage(lastMessage)
    );
    const reply = result.response.text();

    const response: {
      reply: string;
      is_last_turn: boolean;
      summary?: string;
    } = {
      reply,
      is_last_turn: isLastTurn,
    };

    if (isLastTurn) {
      response.summary = reply;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "チャット処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
