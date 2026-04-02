"use client";

import {
  TrendingUp,
  TrendingDown,
  Minus,
  Droplets,
  FlaskConical,
  BarChart3,
  ExternalLink,
} from "lucide-react";
import type { NaphthaData } from "@/lib/types";

interface Props {
  data: NaphthaData | null;
}

/**
 * 나프타(싱가포르 MOP) 주간 가격 위젯
 * 다중 소스 폴백: KPIA(한국석유화학공업협회) → CME Group → TradingView → Yahoo Finance
 */
export default function NaphthaWidget({ data }: Props) {
  if (!data) {
    return (
      <div className="glass-card px-4 py-2">
        <div className="widget-header mb-2">
          <FlaskConical size={15} className="text-purple-400" />
          <span>나프타 싱가포르 MOP</span>
        </div>
        <div className="flex items-center justify-center py-4">
          <span className="text-xs text-slate-500">데이터 대기 중...</span>
        </div>
      </div>
    );
  }

  const isPositive = data.change > 0;
  const isNegative = data.change < 0;
  const changeColor = isPositive
    ? "text-red-400"
    : isNegative
    ? "text-emerald-400"
    : "text-slate-500";
  const changeBg = isPositive
    ? "bg-red-500/10"
    : isNegative
    ? "bg-emerald-500/10"
    : "bg-slate-500/10";
  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  // 소스 단축 표시
  const sourceShort = data.source.includes("KPIA")
    ? "KPIA"
    : data.source.includes("CME")
    ? "CME"
    : data.source.includes("TradingView")
    ? "TradingView"
    : data.source.includes("Yahoo")
    ? "Yahoo"
    : data.source;

  return (
    <div className="glass-card px-4 py-2 flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-1">
        <div className="widget-header">
          <FlaskConical size={15} className="text-purple-400" />
          <span>나프타 싱가포르 MOP</span>
        </div>
        <span className="text-[10px] text-slate-600 font-medium">{sourceShort}</span>
      </div>

      {/* 메인 가격 ($/MT) */}
      <div className="flex items-end justify-between mt-1">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-white tabular-nums tracking-tight">
              {data.priceMT.toLocaleString("ko-KR", { maximumFractionDigits: 1 })}
            </span>
            <span className="text-xs text-slate-500 font-medium">$/MT</span>
          </div>
          {/* 변동 */}
          <div className={`flex items-center gap-1 mt-0.5 ${changeColor}`}>
            <TrendIcon size={12} />
            <span className="text-xs font-semibold tabular-nums">
              {isPositive ? "+" : ""}
              {data.change.toLocaleString("ko-KR", { maximumFractionDigits: 1 })} $/MT
            </span>
            {data.changePercent !== 0 && (
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${changeBg} ${changeColor}`}>
                {isPositive ? "+" : ""}
                {data.changePercent.toFixed(2)}%
              </span>
            )}
          </div>
        </div>

        {/* 우측: 배럴 환산 */}
        <div className="text-right">
          <div className="flex items-center gap-1 justify-end">
            <Droplets size={11} className="text-purple-300/60" />
            <span className="text-xs text-slate-500">배럴 환산</span>
          </div>
          <div className="flex items-baseline gap-1 justify-end mt-0.5">
            <span className="text-sm font-semibold text-slate-300 tabular-nums">
              {data.priceBbl.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-600">$/bbl</span>
          </div>
          {data.changeBbl !== 0 && (
            <span className={`text-[10px] font-medium ${changeColor}`}>
              {data.changeBbl > 0 ? "+" : ""}{data.changeBbl.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {/* 하단 정보 */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/30">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
          <BarChart3 size={10} />
          <span>주간 · {data.weekDate}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-600">
          <span>1MT ≈ 8.9bbl</span>
        </div>
      </div>
    </div>
  );
}
