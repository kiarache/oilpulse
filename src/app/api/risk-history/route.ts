import { NextResponse } from "next/server";
import { appendRiskHistory, getRecentRiskHistory, type RiskHistoryEntry } from "@/lib/riskHistory";

/** GET — 리스크 지수 이력 조회 (최근 N건, 기본 100) */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const count = Math.min(Number(searchParams.get("count") ?? 100), 500);
    const history = await getRecentRiskHistory(count);
    return NextResponse.json({ data: history, error: null });
  } catch (e) {
    const message = e instanceof Error ? e.message : "리스크 이력 조회 실패";
    return NextResponse.json({ data: [], error: message }, { status: 500 });
  }
}

/** POST — 리스크 지수 이력 기록 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { riskIndex, wtiPrice, exchangeRate, source } = body as Partial<RiskHistoryEntry>;

    if (riskIndex == null || wtiPrice == null || exchangeRate == null) {
      return NextResponse.json(
        { error: "riskIndex, wtiPrice, exchangeRate 필수" },
        { status: 400 },
      );
    }

    const entry: RiskHistoryEntry = {
      timestamp: new Date().toISOString(),
      riskIndex,
      wtiPrice,
      exchangeRate,
      source: source ?? "unknown",
    };

    await appendRiskHistory(entry);
    return NextResponse.json({ ok: true, entry });
  } catch (e) {
    const message = e instanceof Error ? e.message : "리스크 이력 저장 실패";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
