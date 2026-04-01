export interface OilPriceData {
  wti: { price: number; change: number; changePercent: number };
  brent: { price: number; change: number; changePercent: number };
  timestamp: string;
  source: string;
}

export interface ExchangeRateData {
  usdKrw: { rate: number; change: number; changePercent: number };
  timestamp: string;
  source: string;
}

export interface KoreaFuelData {
  gasoline: { price: number; change: number };
  diesel: { price: number; change: number };
  lpg: { price: number; change: number };
  timestamp: string;
  source: string;
}

export interface NewsItem {
  title: string;
  summary: string;
  url: string;
  publishedAt: string;
  source: string;
}

export interface ForexReservesData {
  total: number;          // 총 외환보유고 (억 달러)
  change: number;         // 전월 대비 변동 (억 달러)
  forex: number;          // 외환 (유가증권+예치금 등)
  sdr: number;            // 특별인출권 (SDR)
  imfPosition: number;    // IMF 포지션
  gold: number;           // 금
  month: string;          // 기준월 (예: 2026-03)
  timestamp: string;
  source: string;
}

export interface CheapestStation {
  name: string;           // 주유소 상호 (OS_NM)
  price: number;          // 판매가격
  brand: string;          // 상표코드 (POLL_DIV_CD)
  address: string;        // 도로명주소 또는 지번주소
  region: string;         // 지역 (시/도 + 시/군/구)
}

export interface CheapestStationData {
  gasoline: CheapestStation | null;
  diesel: CheapestStation | null;
  lpg: CheapestStation | null;
  timestamp: string;
  source: string;
}

export interface TradingViewQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface TradingViewQuoteData {
  wti: TradingViewQuote;
  usdKrw: TradingViewQuote;
  timestamp: string;
  source: string;
}
