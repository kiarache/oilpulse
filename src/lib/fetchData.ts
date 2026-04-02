import type { OilPriceData, ExchangeRateData, KoreaFuelData, NewsItem, ForexReservesData, CheapestStationData, CheapestStation, TradingViewQuoteData, NaphthaData } from "@/lib/types";

// ── 유가 (Yahoo Finance) ─────────────────────────────────────
async function fetchYahooFinance(symbol: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=2d`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; DashboardBot/1.0)" },
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`Yahoo Finance 실패: ${symbol} (${res.status})`);
  const json = await res.json();
  const result = json?.chart?.result?.[0];
  if (!result) throw new Error(`Yahoo Finance 응답 없음: ${symbol}`);
  const meta = result.meta;
  const closes: (number | null)[] = result.indicators?.quote?.[0]?.close ?? [];
  const validCloses = closes.filter((v): v is number => v != null);
  const prevClose = validCloses[validCloses.length - 2] ?? meta.previousClose ?? meta.chartPreviousClose;
  const currentPrice: number = meta.regularMarketPrice;
  const change = prevClose ? currentPrice - prevClose : 0;
  const changePercent = prevClose ? (change / prevClose) * 100 : 0;
  return { price: currentPrice, change, changePercent };
}

export async function getOilPrice(): Promise<OilPriceData> {
  const [wti, brent] = await Promise.all([
    fetchYahooFinance("CL=F"),
    fetchYahooFinance("BZ=F"),
  ]);
  return { wti, brent, timestamp: new Date().toISOString(), source: "Yahoo Finance" };
}

// ── 환율 (Yahoo Finance) ─────────────────────────────────────
export async function getExchangeRate(): Promise<ExchangeRateData> {
  const url = "https://query1.finance.yahoo.com/v8/finance/chart/KRW%3DX?interval=1d&range=2d";
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; DashboardBot/1.0)" },
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`환율 API 실패 (${res.status})`);
  const json = await res.json();
  const result = json?.chart?.result?.[0];
  if (!result) throw new Error("환율 응답 없음");
  const meta = result.meta;
  const closes: (number | null)[] = result.indicators?.quote?.[0]?.close ?? [];
  const validCloses = closes.filter((v): v is number => v != null);
  const prevClose = validCloses[validCloses.length - 2] ?? meta.previousClose;
  const currentRate: number = meta.regularMarketPrice;
  const change = prevClose ? currentRate - prevClose : 0;
  const changePercent = prevClose ? (change / prevClose) * 100 : 0;
  return {
    usdKrw: { rate: currentRate, change, changePercent },
    timestamp: new Date().toISOString(),
    source: "Yahoo Finance",
  };
}

// ── TradingView 실시간 시세 (Scanner API) ─────────────────────
export async function getTradingViewQuotes(): Promise<TradingViewQuoteData> {
  const url = "https://scanner.tradingview.com/global/scan";
  const body = {
    symbols: {
      tickers: ["TVC:USOIL", "FX_IDC:USDKRW"],
    },
    columns: ["close", "change", "change_abs", "Perf.W"],
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; DashboardBot/1.0)",
    },
    body: JSON.stringify(body),
    next: { revalidate: 120 },
  });

  if (!res.ok) throw new Error(`TradingView Scanner API 실패 (${res.status})`);
  const json = await res.json();
  const rows: { s: string; d: number[] }[] = json?.data ?? [];

  const wtiRow = rows.find((r) => r.s === "TVC:USOIL");
  const krwRow = rows.find((r) => r.s === "FX_IDC:USDKRW");

  if (!wtiRow || !krwRow) throw new Error("TradingView 응답에서 심볼을 찾을 수 없습니다.");

  // columns: [close, change(%), change_abs, Perf.W]
  return {
    wti: {
      symbol: "TVC:USOIL",
      price: wtiRow.d[0],
      change: wtiRow.d[2],           // 절대 변동
      changePercent: wtiRow.d[1],     // % 변동
    },
    usdKrw: {
      symbol: "FX_IDC:USDKRW",
      price: krwRow.d[0],
      change: krwRow.d[2],
      changePercent: krwRow.d[1],
    },
    timestamp: new Date().toISOString(),
    source: "TradingView",
  };
}

// ── 한국 유류가 (오피넷) ──────────────────────────────────────
export async function getKoreaFuel(): Promise<KoreaFuelData> {
  const apiKey = process.env.OPINET_API_KEY;
  if (!apiKey) throw new Error("OPINET_API_KEY 환경변수가 설정되지 않았습니다.");

  const url = `https://www.opinet.co.kr/api/avgAllPrice.do?certkey=${apiKey}&out=json`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`오피넷 HTTP ${res.status}`);
  const json = await res.json();
  const items = json?.RESULT?.OIL ?? [];
  const gas = items.find((i: { PRODCD: string }) => i.PRODCD === "B027");
  const dsl = items.find((i: { PRODCD: string }) => i.PRODCD === "D047");
  const lpg = items.find((i: { PRODCD: string }) => i.PRODCD === "K015");
  if (!gas || !dsl) throw new Error("오피넷 응답에서 유종 코드를 찾을 수 없습니다.");
  return {
    gasoline: { price: Number(gas.PRICE), change: Number(gas.DIFF) },
    diesel:   { price: Number(dsl.PRICE),  change: Number(dsl.DIFF) },
    lpg:      lpg ? { price: Number(lpg.PRICE), change: Number(lpg.DIFF) } : { price: 0, change: 0 },
    timestamp: new Date().toISOString(),
    source: "오피넷 (한국석유공사)",
  };
}

// ── 유종별 최저가 주유소 (오피넷) ──────────────────────────────
const BRAND_MAP: Record<string, string> = {
  SKE: "SK에너지", GSC: "GS칼텍스", HDO: "현대오일뱅크", SOL: "S-OIL",
  RTE: "자영알뜰", RTX: "고속도로알뜰", NHO: "농협알뜰", ETC: "자가상표",
  E1G: "E1", SKG: "SK가스",
};

function extractRegion(address: string): string {
  const parts = address.split(/\s+/);
  return parts.length >= 2 ? `${parts[0]} ${parts[1]}` : address;
}

async function fetchCheapestByProduct(apiKey: string, prodcd: string): Promise<CheapestStation | null> {
  try {
    const url = `https://www.opinet.co.kr/api/lowTop10.do?certkey=${apiKey}&out=json&prodcd=${prodcd}&cnt=1`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const items = json?.RESULT?.OIL ?? [];
    if (items.length === 0) return null;
    const item = items[0];
    const addr = item.NEW_ADR || item.VAN_ADR || "";
    return {
      name: item.OS_NM ?? "알 수 없음",
      price: Number(item.PRICE),
      brand: BRAND_MAP[item.POLL_DIV_CD] ?? item.POLL_DIV_CD ?? "기타",
      address: addr,
      region: extractRegion(addr),
    };
  } catch {
    return null;
  }
}

export async function getCheapestStations(): Promise<CheapestStationData> {
  const apiKey = process.env.OPINET_API_KEY;
  if (!apiKey) throw new Error("OPINET_API_KEY 환경변수가 설정되지 않았습니다.");

  const [gasoline, diesel, lpg] = await Promise.all([
    fetchCheapestByProduct(apiKey, "B027"),  // 보통휘발유
    fetchCheapestByProduct(apiKey, "D047"),  // 자동차경유
    fetchCheapestByProduct(apiKey, "K015"),  // 자동차부탄(LPG)
  ]);

  return {
    gasoline,
    diesel,
    lpg,
    timestamp: new Date().toISOString(),
    source: "오피넷 (한국석유공사)",
  };
}

// ── 뉴스 (Google News RSS + 연합뉴스 RSS) ────────────────────
function extractTag(block: string, tag: string): string {
  return (
    (block.match(new RegExp(`<${tag}><\\!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`)) ?? [])[1] ??
    (block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`)) ?? [])[1] ??
    ""
  ).trim();
}

function parseRss(xml: string, sourceName: string, limit = 10): NewsItem[] {
  const blocks = xml.match(/<item>([\s\S]*?)<\/item>/g) ?? [];
  return blocks.slice(0, limit).map((block) => {
    const title = extractTag(block, "title").replace(/&amp;/g, "&").replace(/&quot;/g, '"');
    const rawDesc = extractTag(block, "description").replace(/<[^>]+>/g, "").slice(0, 150);
    const url = (block.match(/<link>\s*(https?:\/\/[^\s<]+)/) ?? [])[1] ?? extractTag(block, "link") ?? "#";
    const publishedAt = extractTag(block, "pubDate") || new Date().toISOString();
    return { title, summary: rawDesc, url, publishedAt, source: sourceName };
  });
}

export async function getNews(): Promise<NewsItem[]> {
  const keywords = [
    "원유", "유가", "에너지", "오일", "OPEC", "중동",
    "환율", "정유", "WTI", "브렌트", "배럴", "주유소",
    "휘발유", "경유", "LPG", "석유", "유류세", "산유국",
    "셰일", "천연가스", "LNG", "정제마진",
  ];

  const noCache = { cache: "no-store" as RequestCache };

  const results = await Promise.allSettled([
    // 1) Google News RSS – 에너지·유가 시장 종합
    (async () => {
      const q = encodeURIComponent("국제유가 에너지 원유 OPEC 석유시장");
      const res = await fetch(
        `https://news.google.com/rss/search?q=${q}&hl=ko&gl=KR&ceid=KR:ko`,
        { headers: { "User-Agent": "Mozilla/5.0" }, ...noCache }
      );
      if (!res.ok) throw new Error(`Google News RSS ${res.status}`);
      return parseRss(await res.text(), "Google 뉴스", 12);
    })(),
    // 2) 연합뉴스 RSS – 경제 섹션 필터
    (async () => {
      const res = await fetch("https://www.yna.co.kr/rss/economy.xml", {
        headers: { "User-Agent": "Mozilla/5.0" }, ...noCache,
      });
      if (!res.ok) throw new Error(`연합뉴스 RSS ${res.status}`);
      const all = parseRss(await res.text(), "연합뉴스", 40);
      return all.filter((item) => keywords.some((kw) => item.title.includes(kw))).slice(0, 10);
    })(),
    // 3) Google News RSS – 유류 가격·주유소 실시간
    (async () => {
      const q = encodeURIComponent("주유소 휘발유 경유 가격 유류세");
      const res = await fetch(
        `https://news.google.com/rss/search?q=${q}&hl=ko&gl=KR&ceid=KR:ko`,
        { headers: { "User-Agent": "Mozilla/5.0" }, ...noCache }
      );
      if (!res.ok) throw new Error(`Google News RSS fuel ${res.status}`);
      return parseRss(await res.text(), "Google 뉴스", 6);
    })(),
    // 4) 연합뉴스 RSS – 국제 섹션 (중동·지정학)
    (async () => {
      const res = await fetch("https://www.yna.co.kr/rss/international.xml", {
        headers: { "User-Agent": "Mozilla/5.0" }, ...noCache,
      });
      if (!res.ok) throw new Error(`연합뉴스 국제 RSS ${res.status}`);
      const all = parseRss(await res.text(), "연합뉴스", 30);
      return all.filter((item) =>
        ["중동", "이란", "이라크", "사우디", "OPEC", "원유", "유가", "석유", "에너지"].some((kw) => item.title.includes(kw))
      ).slice(0, 6);
    })(),
  ]);

  // 모든 소스에서 결과 수집
  const all: NewsItem[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") all.push(...r.value);
  }

  // 최신순 정렬
  all.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  // 중복 제거 + 최대 12개
  const seen = new Set<string>();
  const merged: NewsItem[] = [];
  for (const item of all) {
    const key = item.title.slice(0, 30);
    if (!seen.has(key)) { seen.add(key); merged.push(item); }
    if (merged.length >= 12) break;
  }
  return merged;
}

// ── 외환보유고 (한국은행 ECOS API) ──────────────────────────────
export async function getForexReserves(): Promise<ForexReservesData> {
  const apiKey = process.env.BOK_API_KEY;
  if (!apiKey) throw new Error("BOK_API_KEY 환경변수가 설정되지 않았습니다.");

  // 최근 2개월 데이터를 가져와 변동분 계산
  const now = new Date();
  const endDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const startYear = now.getMonth() <= 1 ? now.getFullYear() - 1 : now.getFullYear();
  const startMonth = now.getMonth() <= 1 ? 12 + now.getMonth() - 1 : now.getMonth() - 1;
  const startDate = `${startYear}${String(startMonth).padStart(2, "0")}`;

  // 통계코드: 732Y001 (외환보유액), 주기: M(월간)
  // ECOS API URL: /서비스명/인증키/요청유형/언어/시작건수/끝건수/통계표코드/주기/시작일/종료일
  const url = `https://ecos.bok.or.kr/api/StatisticSearch/${apiKey}/json/kr/1/20/732Y001/M/${startDate}/${endDate}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; DashboardBot/1.0)" },
    next: { revalidate: 300 },   // 5분 캐시 — 발표 시점 빠른 반영
  });
  if (!res.ok) throw new Error(`한국은행 ECOS API 실패 (${res.status})`);
  const json = await res.json();
  const rows = json?.StatisticSearch?.row;
  if (!rows || rows.length === 0) throw new Error("한국은행 외환보유고 데이터 없음");

  // 실제 API 항목코드 (ITEM_CODE1):
  //   "01" = 금,  "02" = 특별인출권(SDR),
  //   "03" = IMF포지션,  "04" = 외환,  "99" = 합계
  // 단위: 천달러 → 억달러 변환 (÷ 100,000)
  const THOUSAND_TO_100M = 100_000; // 천달러 → 억달러

  type FieldKey = "gold" | "sdr" | "imfPosition" | "forex" | "total";
  const codeMap: Record<string, FieldKey> = {
    "01": "gold",
    "02": "sdr",
    "03": "imfPosition",
    "04": "forex",
    "99": "total",
  };

  // 가장 최근 월과 이전 월을 분리
  const months = [...new Set(rows.map((r: { TIME: string }) => r.TIME))].sort() as string[];
  const latestMonth = months[months.length - 1];
  const prevMonth = months.length > 1 ? months[months.length - 2] : null;

  const latest: Record<string, number> = {};
  const prev: Record<string, number> = {};

  for (const row of rows) {
    const code = row.ITEM_CODE1 as string;
    const field = codeMap[code];
    if (!field) continue;
    const rawVal = parseFloat((row.DATA_VALUE ?? "0").toString().replace(/,/g, ""));
    const val = rawVal / THOUSAND_TO_100M; // 천달러 → 억달러
    if (row.TIME === latestMonth) {
      latest[field] = val;
    } else if (row.TIME === prevMonth) {
      prev[field] = val;
    }
  }

  const total = latest.total ?? 0;
  const prevTotal = prev.total ?? total;

  // 월 포맷: "202603" → "2026-03"
  const monthFormatted = `${latestMonth.slice(0, 4)}-${latestMonth.slice(4)}`;

  return {
    total: Math.round(total * 10) / 10,
    change: Math.round((total - prevTotal) * 10) / 10,
    forex: Math.round((latest.forex ?? 0) * 10) / 10,
    sdr: Math.round((latest.sdr ?? 0) * 10) / 10,
    imfPosition: Math.round((latest.imfPosition ?? 0) * 10) / 10,
    gold: Math.round((latest.gold ?? 0) * 10) / 10,
    month: monthFormatted,
    timestamp: new Date().toISOString(),
    source: "한국은행 ECOS",
  };
}

// ── 나프타 싱가포르 MOP 주간 가격 ──────────────────────────────
// 나프타 1MT ≈ 8.9 bbl (비중 약 0.68–0.72)
const NAPHTHA_BBL_PER_MT = 8.9;

/**
 * Source 1: CME Group – Singapore Naphtha (Platts) 선물 결제가
 * CME settlements 페이지를 스크래핑하여 최근 결제가를 가져옵니다.
 */
async function fetchNaphthaFromCME(): Promise<NaphthaData | null> {
  try {
    const url = "https://www.cmegroup.com/CmeWS/mvc/Settlements/Futures/Settlements/425/FUT?strategy=DEFAULT&tradeDate=&pageSize=5&isProtected&_t=" + Date.now();
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
      },
      next: { revalidate: 21600 },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;

    const json = await res.json();
    const settlements = json?.settlements;
    if (!Array.isArray(settlements) || settlements.length < 2) return null;

    // 최근 두 달 결제가 ($/bbl)
    const current = settlements[0];
    const prev = settlements[1];
    const priceBbl = parseFloat(current?.settle ?? "0");
    const prevPriceBbl = parseFloat(prev?.settle ?? "0");

    if (priceBbl <= 0) return null;

    const changeBbl = Math.round((priceBbl - prevPriceBbl) * 1000) / 1000;
    const priceMT = Math.round(priceBbl * NAPHTHA_BBL_PER_MT * 100) / 100;
    const changeMT = Math.round(changeBbl * NAPHTHA_BBL_PER_MT * 100) / 100;
    const changePercent = prevPriceBbl > 0 ? Math.round((changeBbl / prevPriceBbl) * 10000) / 100 : 0;

    return {
      priceMT,
      priceBbl,
      change: changeMT,
      changeBbl,
      changePercent,
      weekDate: current?.tradeDate ?? new Date().toISOString().split("T")[0],
      timestamp: new Date().toISOString(),
      source: "CME Group (Singapore Naphtha Platts)",
    };
  } catch {
    return null;
  }
}

/**
 * Source 2: TradingView Scanner API – 나프타 관련 심볼
 * 이미 프로젝트에서 사용 중인 TradingView Scanner API를 활용합니다.
 */
async function fetchNaphthaFromTradingView(): Promise<NaphthaData | null> {
  try {
    const url = "https://scanner.tradingview.com/global/scan";
    const body = {
      symbols: { tickers: ["NYMEX:UN1!", "NYMEX:USN1!"] },
      columns: ["close", "change", "change_abs", "Perf.W"],
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; DashboardBot/1.0)",
      },
      body: JSON.stringify(body),
      next: { revalidate: 7200 },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return null;
    const json = await res.json();
    const rows: { s: string; d: number[] }[] = json?.data ?? [];

    if (rows.length === 0) return null;
    const row = rows[0];
    const priceBbl = row.d[0];
    const changePct = row.d[1] ?? 0;
    const changeAbs = row.d[2] ?? 0;

    if (!priceBbl || priceBbl <= 0) return null;

    const priceMT = Math.round(priceBbl * NAPHTHA_BBL_PER_MT * 100) / 100;
    const changeMT = Math.round(changeAbs * NAPHTHA_BBL_PER_MT * 100) / 100;

    return {
      priceMT,
      priceBbl,
      change: changeMT,
      changeBbl: changeAbs,
      changePercent: changePct,
      weekDate: new Date().toISOString().split("T")[0],
      timestamp: new Date().toISOString(),
      source: "TradingView (Naphtha Futures)",
    };
  } catch {
    return null;
  }
}

/**
 * Source 3: Yahoo Finance – 나프타 선물 프록시
 * CME Singapore Naphtha (Platts) Calendar Swap가 Yahoo에 상장되어 있을 수 있습니다.
 */
async function fetchNaphthaFromYahoo(): Promise<NaphthaData | null> {
  // Yahoo Finance 나프타 관련 티커 시도
  const tickers = ["UN=F", "ASP=F"];
  for (const ticker of tickers) {
    try {
      const data = await fetchYahooFinance(ticker);
      if (data.price > 0) {
        const priceBbl = data.price;
        const priceMT = Math.round(priceBbl * NAPHTHA_BBL_PER_MT * 100) / 100;
        const changeMT = Math.round(data.change * NAPHTHA_BBL_PER_MT * 100) / 100;
        return {
          priceMT,
          priceBbl,
          change: changeMT,
          changeBbl: Math.round(data.change * 100) / 100,
          changePercent: Math.round(data.changePercent * 100) / 100,
          weekDate: new Date().toISOString().split("T")[0],
          timestamp: new Date().toISOString(),
          source: "Yahoo Finance (Naphtha Futures)",
        };
      }
    } catch {
      continue;
    }
  }
  return null;
}

/**
 * 나프타 싱가포르 MOP 가격 조회 (다중 소스 폴백)
 * 우선순위: CME Group → TradingView → Yahoo Finance
 */
export async function getNaphthaPrice(): Promise<NaphthaData> {
  const sources = [
    { name: "CME", fn: fetchNaphthaFromCME },
    { name: "TradingView", fn: fetchNaphthaFromTradingView },
    { name: "Yahoo", fn: fetchNaphthaFromYahoo },
  ];

  const errors: string[] = [];

  for (const { name, fn } of sources) {
    try {
      const result = await fn();
      if (result) return result;
    } catch (e) {
      errors.push(`${name}: ${e instanceof Error ? e.message : "unknown"}`);
    }
  }

  throw new Error(`나프타 가격 데이터를 가져올 수 없습니다. (시도: ${errors.join(", ") || "모든 소스 응답 없음"})`);
}
