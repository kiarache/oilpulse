"use client";

import { useEffect, useRef } from "react";

interface TradingViewChartProps {
  symbol: string;
  label: string;
  dateRange?: string;
}

export default function TradingViewChart({
  symbol,
  label,
  dateRange = "1M",
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 이전 위젯 안전하게 제거
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    container.appendChild(widgetDiv);

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.async = true;
    // textContent 사용 (XSS 안전 — 신뢰된 하드코딩 JSON 설정값)
    script.textContent = JSON.stringify({
      symbol,
      width: "100%",
      height: 170,
      locale: "kr",
      dateRange,
      colorTheme: "dark",
      isTransparent: true,
      autosize: true,
      chartOnly: false,
    });
    container.appendChild(script);

    return () => {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, [symbol, dateRange]);

  return (
    <div className="card px-3 py-2 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--text-secondary)]">{label}</span>
        <span className="text-[10px] text-[var(--text-muted)]">TradingView</span>
      </div>
      <div ref={containerRef} className="tradingview-widget-container w-full" />
    </div>
  );
}
