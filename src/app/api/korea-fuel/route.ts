import { NextResponse } from "next/server";
import { getKoreaFuel } from "@/lib/fetchData";
export type { KoreaFuelData } from "@/lib/types";

export async function GET() {
  try {
    const data = await getKoreaFuel();
    return NextResponse.json({ data, error: null, timestamp: data.timestamp });
  } catch (e) {
    const message = e instanceof Error ? e.message : "국내 유류가 조회 실패";
    return NextResponse.json(
      { data: null, error: message, timestamp: new Date().toISOString() },
      { status: 500 },
    );
  }
}
