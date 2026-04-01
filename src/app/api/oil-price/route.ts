import { NextResponse } from "next/server";
import { getOilPrice } from "@/lib/fetchData";
export type { OilPriceData } from "@/lib/types";

export async function GET() {
  try {
    const data = await getOilPrice();
    return NextResponse.json({ data, error: null, timestamp: data.timestamp });
  } catch (e) {
    const message = e instanceof Error ? e.message : "유가 조회 실패";
    return NextResponse.json(
      { data: null, error: message, timestamp: new Date().toISOString() },
      { status: 500 },
    );
  }
}
