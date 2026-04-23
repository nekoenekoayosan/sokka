import { NextRequest, NextResponse } from "next/server";
import { flashModel } from "@/lib/gemini";

async function searchRelatedLinks(
  term: string
): Promise<{ title: string; url: string }[]> {
  const apiKey = process.env.GOOGLE_CSE_API_KEY;
  const cseId = process.env.GOOGLE_CSE_ID;

  if (!apiKey || !cseId) return [];

  try {
    const query = encodeURIComponent(`${term} プログラミング 解説`);
    const res = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${query}&num=3`
    );

    if (!res.ok) return [];

    const data = await res.json();
    return (data.items || []).slice(0, 3).map(
      (item: { title: string; link: string }) => ({
        title: item.title,
        url: item.link,
      })
    );
  } catch {
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const { term, correct_meaning, user_answer } = await request.json();

    if (!term || !correct_meaning || !user_answer) {
      return NextResponse.json(
        { error: "必須パラメータが不足しています" },
        { status: 400 }
      );
    }

    const prompt = `あなたは学習アプリの採点者です。

【用語】${term}
【正解の意味】${correct_meaning}
【ユーザーの回答】${user_answer}

ユーザーの回答が正解の意味と概ね合っているかを判定してください。
完全一致でなくても、意味の本質を捉えていれば正解とします。

以下のJSON形式で出力してください。JSONのみを出力してください。
{
  "is_correct": true または false,
  "feedback": "フィードバックメッセージ（1〜2文）"
}`;

    const result = await flashModel.generateContent(prompt);
    const responseText = result.response.text();

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse Gemini response");
    }

    const judgment = JSON.parse(jsonMatch[0]);

    const relatedLinks = await searchRelatedLinks(term);

    return NextResponse.json({
      is_correct: judgment.is_correct,
      feedback: judgment.feedback,
      related_links: relatedLinks,
    });
  } catch (error) {
    console.error("Quiz check API error:", error);
    return NextResponse.json(
      { error: "判定中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
