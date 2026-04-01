import { NextResponse } from "next/server";
import { getCheapestStations } from "@/lib/fetchData";

export async function GET() {
  try {
    const data = await getCheapestStations();
    return NextResponse.json({ data, error: null, timestamp: data.timestamp });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
