import { NextResponse } from "next/server";
import { getOilPrice } from "@/lib/fetchData";
export type { OilPriceData } from "@/lib/types";

export async function GET() {
  const data = await getOilPrice();
  return NextResponse.json({ data, error: null, timestamp: data.timestamp });
}
