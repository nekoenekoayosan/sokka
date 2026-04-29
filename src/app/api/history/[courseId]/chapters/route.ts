import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    const { data: chapters, error } = await supabase
      .from("chapters")
      .select("id, day_number, title, created_at")
      .eq("course_id", courseId)
      .order("day_number", { ascending: true });

    if (error) throw error;

    // 学習済みチャプター（summariesにデータがあるもの）を取得
    const chapterIds = (chapters || []).map((c) => c.id);
    const { data: summaries } = await supabase
      .from("summaries")
      .select("chapter_id")
      .in("chapter_id", chapterIds.length > 0 ? chapterIds : ["__none__"]);

    const learnedIds = new Set(
      (summaries || []).map((s) => s.chapter_id)
    );

    const result = (chapters || []).map((ch) => ({
      ...ch,
      is_learned: learnedIds.has(ch.id),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Chapters API error:", error);
    return NextResponse.json(
      { error: "チャプター一覧の取得に失敗しました" },
      { status: 500 }
    );
  }
}
