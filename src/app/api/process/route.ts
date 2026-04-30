import { NextRequest, NextResponse } from "next/server";
import { flashModel, generateWithRetry } from "@/lib/gemini";
import { supabase } from "@/lib/supabase";
import { YoutubeTranscript } from "youtube-transcript";

async function transcribeAudio(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");

  const result = await generateWithRetry(() =>
    flashModel.generateContent([
      {
        inlineData: {
          mimeType: file.type,
          data: base64,
        },
      },
      "この音声の内容をすべて正確に文字起こししてください。日本語で出力してください。句読点や改行も適切に入れてください。文字起こしのみを出力し、他の説明は含めないでください。",
    ])
  );

  return result.response.text();
}

async function fetchYouTubeTranscript(url: string): Promise<string> {
  const transcript = await YoutubeTranscript.fetchTranscript(url, {
    lang: "ja",
  });
  if (!transcript || transcript.length === 0) {
    throw new Error("字幕が取得できませんでした");
  }
  return transcript.map((t) => t.text).join(" ");
}

async function extractTextFromImage(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");

  const result = await generateWithRetry(() =>
    flashModel.generateContent([
      {
        inlineData: {
          mimeType: file.type,
          data: base64,
        },
      },
      "この画像に含まれるテキストをすべて正確に文字起こししてください。レイアウトや構造もできるだけ保持してください。",
    ])
  );

  return result.response.text();
}

async function summarizeAndExtractTerms(text: string) {
  const prompt = `以下のテキストを学習教材として分析してください。

【テキスト】
${text}

以下のJSON形式で出力してください。JSONのみを出力し、他のテキストは含めないでください。
{
  "summary": "テキストの要約（200〜400字程度）",
  "terms": [
    {
      "word": "重要な用語",
      "explanation": "その用語の正確な意味（50字以内）",
      "difficulty": "easy | medium | hard",
      "trivia": "その用語に関連する面白い雑学や豆知識（60字以内）"
    }
  ]
}

termsは最大10個まで、テキストの中で特に重要な専門用語や概念を抽出してください。
triviaには、学習者が興味を持つような意外な事実や歴史的背景などを含めてください。`;

  const result = await generateWithRetry(() =>
    flashModel.generateContent(prompt)
  );
  const responseText = result.response.text();

  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse Gemini response as JSON");
  }

  return JSON.parse(jsonMatch[0]);
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let inputType: string;
    let transcribedText: string;
    let fileName: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      inputType = formData.get("input_type") as string;
      const file = formData.get("file") as File | null;
      const content = formData.get("content") as string | null;

      if (inputType === "url") {
        if (!content) {
          return NextResponse.json(
            { error: "URLが入力されていません" },
            { status: 400 }
          );
        }
        fileName = content;
        transcribedText = await fetchYouTubeTranscript(content);
      } else if (inputType === "text") {
        if (!content) {
          return NextResponse.json(
            { error: "テキストが入力されていません" },
            { status: 400 }
          );
        }
        transcribedText = content;
      } else if (inputType === "image") {
        if (!file) {
          return NextResponse.json(
            { error: "画像ファイルが選択されていません" },
            { status: 400 }
          );
        }
        fileName = file.name;
        transcribedText = await extractTextFromImage(file);
      } else if (inputType === "audio") {
        if (!file) {
          return NextResponse.json(
            { error: "音声ファイルが選択されていません" },
            { status: 400 }
          );
        }
        fileName = file.name;
        transcribedText = await transcribeAudio(file);
      } else {
        return NextResponse.json(
          { error: "無効な入力タイプです" },
          { status: 400 }
        );
      }
    } else {
      const body = await request.json();
      inputType = body.input_type;
      if (inputType !== "text" || !body.content) {
        return NextResponse.json(
          { error: "無効なリクエストです" },
          { status: 400 }
        );
      }
      transcribedText = body.content;
    }

    // filesテーブルに保存
    const { data: fileRecord, error: fileError } = await supabase
      .from("files")
      .insert({
        file_name: fileName,
        file_type: inputType,
        transcribed_text: transcribedText,
      })
      .select("id")
      .single();

    if (fileError) throw fileError;

    // 要約・語句抽出
    const { summary, terms } = await summarizeAndExtractTerms(transcribedText);

    // summariesテーブルに保存
    const { data: summaryRecord, error: summaryError } = await supabase
      .from("summaries")
      .insert({
        file_id: fileRecord.id,
        summary,
        terms,
      })
      .select("id")
      .single();

    if (summaryError) throw summaryError;

    return NextResponse.json({
      file_id: fileRecord.id,
      transcribed_text: transcribedText,
      summary_id: summaryRecord.id,
      summary,
      terms,
    });
  } catch (error) {
    console.error("Process API error:", error);
    return NextResponse.json(
      { error: "処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
