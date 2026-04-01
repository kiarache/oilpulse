import { NextResponse } from "next/server";
import { getKoreaFuel } from "@/lib/fetchData";
export type { KoreaFuelData } from "@/lib/types";

export async function GET() {
  const data = await getKoreaFuel();
  return NextResponse.json({ data, error: null, timestamp: data.timestamp });
}
