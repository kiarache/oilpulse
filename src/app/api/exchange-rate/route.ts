import { NextResponse } from "next/server";
import { getExchangeRate } from "@/lib/fetchData";
export type { ExchangeRateData } from "@/lib/types";

export async function GET() {
  const data = await getExchangeRate();
  return NextResponse.json({ data, error: null, timestamp: data.timestamp });
}
