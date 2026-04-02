import DashboardClient from "@/components/DashboardClient";
import { getOilPrice, getExchangeRate, getKoreaFuel, getForexReserves, getCheapestStations, getNews, getTradingViewQuotes, getNaphthaPrice } from "@/lib/fetchData";

async function getInitialData() {
  const [oilPrice, exchangeRate, koreaFuel, forexReserves, cheapestStation, tradingView, naphtha, news] = await Promise.all([
    getOilPrice(),
    getExchangeRate(),
    getKoreaFuel(),
    getForexReserves().catch(() => null),
    getCheapestStations().catch(() => null),
    getTradingViewQuotes().catch(() => null),
    getNaphthaPrice().catch(() => null),
    getNews(),
  ]);
  return { oilPrice, exchangeRate, koreaFuel, forexReserves, cheapestStation, tradingView, naphtha, news };
}

export default async function HomePage() {
  const initial = await getInitialData();

  return (
    <main className="h-screen max-h-screen bg-[var(--bg-primary)] px-5 py-3 flex flex-col overflow-hidden">
      <header className="mb-2.5 flex items-center justify-between shrink-0 border-b border-[var(--border-subtle)] pb-2.5">
        <div className="flex items-baseline gap-3">
          <h1 className="text-lg font-bold text-white tracking-tight">
            OilPulse
          </h1>
          <div className="h-4 w-px bg-[var(--border-muted)]" />
          <p className="text-xs text-[var(--text-muted)]">
            유가 · 환율 · 에너지 대시보드
          </p>
        </div>
      </header>

      <div className="flex-1 min-h-0">
        <DashboardClient initial={initial} />
      </div>
    </main>
  );
}
