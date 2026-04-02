"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Clock } from "lucide-react";
import MetricCard from "./MetricCard";
import RiskIndexWidget from "./RiskIndexWidget";
import NewsFeed from "./NewsFeed";
import YonhapLiveWidget from "./YonhapLiveWidget";
import BreakingNewsTicker from "./BreakingNewsTicker";
import TradingViewChart from "./TradingViewChart";
import DomesticFuelWidget from "./DomesticFuelWidget";
import CheapestStationWidget from "./CheapestStationWidget";
import ForexReservesWidget from "./ForexReservesWidget";
import type { OilPriceData, ExchangeRateData, KoreaFuelData, NewsItem, ForexReservesData, CheapestStationData, TradingViewQuoteData, NaphthaData } from "@/lib/types";

interface DashboardData {
  oilPrice: OilPriceData | null;
  exchangeRate: ExchangeRateData | null;
  koreaFuel: KoreaFuelData | null;
  forexReserves: ForexReservesData | null;
  cheapestStation: CheapestStationData | null;
  tradingView: TradingViewQuoteData | null;
  naphtha: NaphthaData | null;
  news: NewsItem[];
}

const POLL_INTERVAL = 2 * 60 * 1000; // 2분

async function fetchAll(): Promise<DashboardData> {
  const [oilRes, rateRes, fuelRes, forexRes, cheapRes, tvRes, naphthaRes, newsRes] = await Promise.all([
    fetch("/api/oil-price"),
    fetch("/api/exchange-rate"),
    fetch("/api/korea-fuel"),
    fetch("/api/forex-reserves"),
    fetch("/api/cheapest-station"),
    fetch("/api/tradingview-quote").catch(() => null),
    fetch("/api/naphtha-price").catch(() => null),
    fetch("/api/news", { cache: "no-store" }),
  ]);
  const [oil, rate, fuel, forex, cheap, news] = await Promise.all([
    oilRes.json(),
    rateRes.json(),
    fuelRes.json(),
    forexRes.json(),
    cheapRes.json(),
    newsRes.json(),
  ]);
  const tv = tvRes ? await tvRes.json().catch(() => ({ data: null })) : { data: null };
  const naphtha = naphthaRes ? await naphthaRes.json().catch(() => ({ data: null })) : { data: null };
  return {
    oilPrice: oil.data,
    exchangeRate: rate.data,
    koreaFuel: fuel.data,
    forexReserves: forex.data ?? null,
    cheapestStation: cheap.data ?? null,
    tradingView: tv.data ?? null,
    naphtha: naphtha.data ?? null,
    news: news.data ?? [],
  };
}

interface Props {
  initial: DashboardData;
}

const MANUAL_COOLDOWN = 30; // 수동 갱신 쿨다운(초)

export default function DashboardClient({ initial }: Props) {
  const [data, setData] = useState<DashboardData>(initial);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const refresh = useCallback(async (manual = false) => {
    setIsRefreshing(true);
    try {
      const next = await fetchAll();
      setData(next);
      setLastUpdated(new Date());
      if (manual) setCooldown(MANUAL_COOLDOWN);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // 쿨다운 카운트다운
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  // 자동 폴링 (쿨다운 무관)
  useEffect(() => {
    const timer = setInterval(() => refresh(false), POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [refresh]);

  const wti = data.oilPrice?.wti;
  const brent = data.oilPrice?.brent;
  const rate = data.exchangeRate?.usdKrw;
  const fuel = data.koreaFuel;
  const tv = data.tradingView;

  // TradingView 데이터가 있으면 우선 사용, 없으면 Yahoo Finance 폴백
  const riskWti = tv ? tv.wti.price : wti?.price;
  const riskRate = tv ? tv.usdKrw.price : rate?.rate;
  const riskSource = tv ? "TradingView" as const : "Yahoo Finance" as const;

  return (
    <div className="flex flex-col gap-2 h-full">
      {/* 속보 티커 */}
      <div className="shrink-0">
        <BreakingNewsTicker items={data.news} />
      </div>

      {/* TradingView 차트 4개 */}
      <div className="grid grid-cols-4 gap-2 shrink-0">
        <TradingViewChart symbol="TVC:USOIL" label="WTI 원유" dateRange="1M" />
        <TradingViewChart symbol="TVC:UKOIL" label="브렌트 원유" dateRange="1M" />
        <TradingViewChart symbol="FX_IDC:USDKRW" label="원/달러 환율" dateRange="1M" />
        <TradingViewChart symbol="FX_IDC:JPYKRW" label="원/엔 환율" dateRange="1M" />
      </div>

      {/* 중단: 유류가 + 최저가 주유소 + 리스크 지수 + 외환보유고 */}
      <div className="grid grid-cols-4 gap-2 shrink-0">
        <DomesticFuelWidget data={fuel} />
        <CheapestStationWidget data={data.cheapestStation} />
        {riskWti && riskRate && (
          <RiskIndexWidget wtiPrice={riskWti} exchangeRate={riskRate} source={riskSource} />
        )}
        <ForexReservesWidget data={data.forexReserves} />
      </div>

      {/* 하단: 뉴스 | 연합뉴스TV */}
      <div className="grid grid-cols-2 gap-2 flex-1 min-h-0">
        <NewsFeed items={data.news} />
        <YonhapLiveWidget />
      </div>

      {/* 하단: 출처 + 갱신 */}
      <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] shrink-0 py-0.5">
        <div className="flex items-center gap-1.5">
          <Clock size={11} />
          <span suppressHydrationWarning>
            TradingView · Yahoo Finance · 오피넷 · 한국은행 · 연합뉴스 — {lastUpdated.toLocaleTimeString("ko-KR")}
          </span>
        </div>
        <button
          onClick={() => refresh(true)}
          disabled={isRefreshing || cooldown > 0}
          className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] hover:text-white 
                     px-2 py-1 rounded transition-colors duration-150 disabled:opacity-40
                     hover:bg-[var(--bg-card)]"
        >
          <RefreshCw size={11} className={isRefreshing ? "animate-spin" : ""} />
          <span>
            {isRefreshing
              ? "갱신 중…"
              : cooldown > 0
                ? `${cooldown}s`
                : "새로고침"}
          </span>
        </button>
      </div>
    </div>
  );
}
