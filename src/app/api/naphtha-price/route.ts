import { NextResponse } from "next/server";
import { getNaphthaPrice } from "@/lib/fetchData";
export type { NaphthaData } from "@/lib/types";

export async function GET() {
  try {
    const data = await getNaphthaPrice();
    return NextResponse.json({ data, error: null, timestamp: data.timestamp });
  } catch (e) {
    const message = e instanceof Error ? e.message : "나프타 가격 조회 실패";
    return NextResponse.json(
      { data: null, error: message, timestamp: new Date().toISOString() },
      { status: 500 },
    );
  }
}
