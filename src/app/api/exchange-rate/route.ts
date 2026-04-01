import { NextResponse } from "next/server";
import { getExchangeRate } from "@/lib/fetchData";
export type { ExchangeRateData } from "@/lib/types";

export async function GET() {
  try {
    const data = await getExchangeRate();
    return NextResponse.json({ data, error: null, timestamp: data.timestamp });
  } catch (e) {
    const message = e instanceof Error ? e.message : "환율 조회 실패";
    return NextResponse.json(
      { data: null, error: message, timestamp: new Date().toISOString() },
      { status: 500 },
    );
  }
}
