import { NextRequest, NextResponse } from "next/server";
import { proModel, generateWithRetry } from "@/lib/gemini";
import { supabase } from "@/lib/supabase";

const MAX_TURNS = 5;

export async function POST(request: NextRequest) {
  try {
    const { summary_id, messages, turn, is_sunabaco } = await request.json();

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

    const baseContext = `【学習内容の要約】
${summaryData.summary}

【重要用語】
${JSON.stringify(summaryData.terms, null, 2)}`;

    const normalRules = `ルール：
- 生徒の理解度に合わせて質問してください
- 一度に聞く質問は1つだけにしてください
- 具体例を交えてわかりやすく説明してください
- 褒めるところは褒めてください
${isLastTurn ? "- これが最後のターンです。会話のまとめを生成してください。学習した内容のポイントを整理し、今後の学習へのアドバイスを含めてください。" : ""}`;

    const sunabacoRules = `ルール：
- 暗記確認ではなく「なぜそうなのか」「どう使うのか」を深掘りしてください
- 学習者の回答内容に具体的に触れてフィードバックしてください。テンプレ的な「素晴らしい！」だけで終わらないでください
- 関連する実務事例や面白い雑学を1つ盛り込んでください
- 「自分から調べてみたくなる」ような問いかけで締めてください
- 一度に聞く質問は1つだけにしてください
- ビジネスや実務での活用シーンを意識した会話を心がけてください
${isLastTurn ? "- これが最後のターンです。会話のまとめを生成してください。学んだ内容が実務でどう活きるかを整理し、さらに深掘りしたくなるような次のアクションを提案してください。" : ""}`;

    const systemPrompt = is_sunabaco
      ? `あなたはSUNABACOの実践的なメンターです。受講生と対話しながら、学んだ知識を「使える力」に変える手助けをしてください。表面的な理解で終わらせず、本質的な理解と応用力を引き出してください。\n\n${baseContext}\n\n${sunabacoRules}`
      : `あなたは優しくて知識豊富な先生です。以下の学習内容について、生徒と対話しながら理解を深める手助けをしてください。\n\n${baseContext}\n\n${normalRules}`;

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
      const summaryResult = await generateWithRetry(() =>
        chat.sendMessage(
          "ここまでの会話全体を振り返り、「今日の学習のまとめ」を2〜3文で簡潔に生成してください。学んだポイントの要約と、今後の学習に向けた一言アドバイスを含めてください。まとめ文のみを出力してください。"
        )
      );
      response.summary = summaryResult.response.text();
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
