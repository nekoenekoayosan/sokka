import { NextRequest, NextResponse } from "next/server";
import { flashModel } from "@/lib/gemini";
import { supabase } from "@/lib/supabase";

async function transcribeAudio(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("model", "whisper-1");
  formData.append("language", "ja");

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Whisper API error: ${res.status}`);
  }

  const data = await res.json();
  return data.text;
}

async function extractTextFromImage(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");

  const result = await flashModel.generateContent([
    {
      inlineData: {
        mimeType: file.type,
        data: base64,
      },
    },
    "この画像に含まれるテキストをすべて正確に文字起こししてください。レイアウトや構造もできるだけ保持してください。",
  ]);

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
      "difficulty": "easy | medium | hard"
    }
  ]
}

termsは最大10個まで、テキストの中で特に重要な専門用語や概念を抽出してください。`;

  const result = await flashModel.generateContent(prompt);
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

      if (inputType === "text") {
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
