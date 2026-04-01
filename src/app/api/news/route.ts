import { NextResponse } from "next/server";
import { getNews } from "@/lib/fetchData";
export type { NewsItem } from "@/lib/types";

export const dynamic = "force-dynamic"; // 항상 최신 데이터
export const revalidate = 0;

export async function GET() {
  try {
    const data = await getNews();
    return NextResponse.json(
      { data, error: null, timestamp: new Date().toISOString() },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
        },
      }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "뉴스 조회 실패";
    return NextResponse.json(
      { data: [], error: message, timestamp: new Date().toISOString() },
      { status: 500 },
    );
  }
}
