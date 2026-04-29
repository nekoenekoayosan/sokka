import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  try {
    const { chapterId } = await params;

    // チャプター情報を取得
    const { data: chapter, error: chapterError } = await supabase
      .from("chapters")
      .select("id, day_number, title, created_at")
      .eq("id", chapterId)
      .single();

    if (chapterError || !chapter) {
      return NextResponse.json(
        { error: "チャプターが見つかりません" },
        { status: 404 }
      );
    }

    // チャプターに紐づく要約・語句を取得
    const { data: summaries, error: summaryError } = await supabase
      .from("summaries")
      .select("id, summary, terms, created_at")
      .eq("chapter_id", chapterId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (summaryError) throw summaryError;

    const summary = summaries && summaries.length > 0 ? summaries[0] : null;

    return NextResponse.json({
      chapter,
      summary: summary?.summary || null,
      terms: summary?.terms || [],
      learned_at: summary?.created_at || null,
    });
  } catch (error) {
    console.error("Chapter detail API error:", error);
    return NextResponse.json(
      { error: "チャプター詳細の取得に失敗しました" },
      { status: 500 }
    );
  }
}
