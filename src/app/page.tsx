import DashboardClient from "@/components/DashboardClient";
import { getOilPrice, getExchangeRate, getKoreaFuel, getForexReserves, getCheapestStations, getNews, getTradingViewQuotes } from "@/lib/fetchData";

async function getInitialData() {
  const [oilPrice, exchangeRate, koreaFuel, forexReserves, cheapestStation, tradingView, news] = await Promise.all([
    getOilPrice(),
    getExchangeRate(),
    getKoreaFuel(),
    getForexReserves().catch(() => null),
    getCheapestStations().catch(() => null),
    getTradingViewQuotes().catch(() => null),
    getNews(),
  ]);
  return { oilPrice, exchangeRate, koreaFuel, forexReserves, cheapestStation, tradingView, news };
}

export default async function HomePage() {
  const initial = await getInitialData();

  return (
    <main className="h-screen max-h-screen bg-[#050a14] bg-grid-pattern px-6 py-3 flex flex-col overflow-hidden relative">
      {/* 상단 그라데이션 글로우 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <header className="mb-3 flex items-center justify-between shrink-0 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <span className="text-lg">🛢</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white leading-tight tracking-tight">
              오일펄스
              <span className="text-sm font-medium text-slate-400 ml-2">OilPulse</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              중동 지정학 리스크 · 유가 · 환율 · 에너지 시장 실시간 모니터링
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 bg-red-500/10 text-red-400 text-xs font-semibold px-4 py-1.5 rounded-full border border-red-500/20 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400" />
            </span>
            실시간 모니터링
          </span>
        </div>
      </header>

      <div className="flex-1 min-h-0 relative z-10">
        <DashboardClient initial={initial} />
      </div>
    </main>
  );
}
