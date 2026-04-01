import { NextResponse } from "next/server";
import { getForexReserves } from "@/lib/fetchData";

export async function GET() {
  try {
    const data = await getForexReserves();
    return NextResponse.json({ data, error: null, timestamp: data.timestamp });
  } catch (err) {
    const message = err instanceof Error ? err.message : "외환보유고 조회 실패";
    return NextResponse.json(
      { data: null, error: message, timestamp: new Date().toISOString() },
      { status: 500 },
    );
  }
}
