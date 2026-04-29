import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("courses")
      .select("id, name, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Courses API error:", error);
    return NextResponse.json(
      { error: "コース一覧の取得に失敗しました" },
      { status: 500 }
    );
  }
}
