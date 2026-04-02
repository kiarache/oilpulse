"use client";

import {
  TrendingUp,
  TrendingDown,
  Minus,
  FlaskConical,
} from "lucide-react";
import type { NaphthaData } from "@/lib/types";

interface Props {
  data: NaphthaData | null;
}

/**
 * 나프타(싱가포르 MOP) 주간 가격 위젯
 * 다중 소스 폴백: CME Group → TradingView → Yahoo Finance
 */
export default function NaphthaWidget({ data }: Props) {
  if (!data) {
    return (
      <div className="card px-3.5 py-2">
        <div className="widget-header mb-2">
          <FlaskConical size={13} className="text-violet-400" />
          <span>나프타 싱가포르 MOP</span>
        </div>
        <div className="flex items-center justify-center py-4">
          <span className="text-[11px] text-[var(--text-muted)]">데이터 대기 중...</span>
        </div>
      </div>
    );
  }

  const isPositive = data.change > 0;
  const isNegative = data.change < 0;
  const changeColor = isPositive
    ? "text-[var(--accent-up)]"
    : isNegative
    ? "text-[var(--accent-down)]"
    : "text-[var(--text-muted)]";
  const changeBg = isPositive
    ? "bg-[var(--accent-up)]/10"
    : isNegative
    ? "bg-[var(--accent-down)]/10"
    : "bg-[var(--bg-card-alt)]";
  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  // 소스 단축 표시
  const sourceShort = data.source.includes("CME")
    ? "CME"
    : data.source.includes("TradingView")
    ? "TradingView"
    : data.source.includes("Yahoo")
    ? "Yahoo"
    : data.source;

  return (
    <div className="card px-3.5 py-2 flex flex-col">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-[var(--text-secondary)]">나프타 싱가포르 MOP</span>
        <span className="text-[10px] text-[var(--text-muted)]">{sourceShort}</span>
      </div>

      {/* 메인 가격 ($/MT) */}
      <div className="flex items-end justify-between mt-1">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-white tabular-nums">
              {data.priceMT.toLocaleString("ko-KR", { maximumFractionDigits: 1 })}
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">$/MT</span>
          </div>
          <div className={`flex items-center gap-1 mt-0.5 ${changeColor}`}>
            <TrendIcon size={11} />
            <span className="text-[11px] font-medium tabular-nums">
              {isPositive ? "+" : ""}
              {data.change.toLocaleString("ko-KR", { maximumFractionDigits: 1 })} $/MT
            </span>
            {data.changePercent !== 0 && (
              <span className={`text-[10px] px-1 py-0.5 rounded ${changeBg} ${changeColor}`}>
                {isPositive ? "+" : ""}
                {data.changePercent.toFixed(2)}%
              </span>
            )}
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-[var(--text-muted)] block">배럴 환산</span>
          <div className="flex items-baseline gap-1 justify-end mt-0.5">
            <span className="text-sm font-medium text-[var(--text-secondary)] tabular-nums">
              {data.priceBbl.toFixed(2)}
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">$/bbl</span>
          </div>
          {data.changeBbl !== 0 && (
            <span className={`text-[10px] ${changeColor}`}>
              {data.changeBbl > 0 ? "+" : ""}{data.changeBbl.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {/* 하단 정보 */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--border-subtle)]">
        <span className="text-[10px] text-[var(--text-muted)]">주간 · {data.weekDate}</span>
        <span className="text-[10px] text-[var(--text-muted)]">1MT ≈ 8.9bbl</span>
      </div>
    </div>
  );
}
