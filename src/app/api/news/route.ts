import { NextResponse } from "next/server";
import { getNews } from "@/lib/fetchData";
export type { NewsItem } from "@/lib/types";

export const dynamic = "force-dynamic"; // 항상 최신 데이터
export const revalidate = 0;

export async function GET() {
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
}
