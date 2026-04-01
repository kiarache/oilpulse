import { NextResponse } from "next/server";
import { getTradingViewQuotes } from "@/lib/fetchData";
export type { TradingViewQuoteData } from "@/lib/types";

export async function GET() {
  try {
    const data = await getTradingViewQuotes();
    return NextResponse.json({ data, error: null, timestamp: data.timestamp });
  } catch (err) {
    const message = err instanceof Error ? err.message : "TradingView 시세 조회 실패";
    return NextResponse.json({ data: null, error: message, timestamp: new Date().toISOString() }, { status: 502 });
  }
}
