"use client";

import {
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  DollarSign,
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

// ── 타입 ──────────────────────────────────────────────────────
interface RiskIndexWidgetProps {
  wtiPrice: number;
  exchangeRate: number;
  baseWti?: number;
  baseRate?: number;
  source?: "TradingView" | "Yahoo Finance";
}

// ── 게이지 바 (수평) ────────────────────────────────────────
function HorizontalGauge({
  value,
  max = 170,
  color,
}: {
  value: number;
  max?: number;
  color: string;
}) {
  const clampedValue = Math.min(Math.max(value, 0), max);
  const pct = (clampedValue / max) * 100;

  return (
    <div className="w-full">
      <div className="relative h-2 bg-[var(--bg-card-alt)] rounded-full overflow-hidden">
        {/* 구간 표시 */}
        <div className="absolute left-0 top-0 h-full w-full flex">
          <div className="flex-1 border-r border-[var(--bg-primary)]" />
          <div className="flex-1 border-r border-[var(--bg-primary)]" />
          <div className="flex-1" />
        </div>
        {/* 프로그레스 */}
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <div className="flex justify-between mt-1 text-[9px] text-[var(--text-muted)] tabular-nums">
        <span>0</span>
        <span>110</span>
        <span>130</span>
        <span>170</span>
      </div>
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────
export default function RiskIndexWidget({
  wtiPrice,
  exchangeRate,
  baseWti = 70,
  baseRate = 1300,
  source = "Yahoo Finance",
}: RiskIndexWidgetProps) {
  const riskIndex = (wtiPrice / baseWti) * (exchangeRate / baseRate) * 100;
  const wtiRatio = (wtiPrice / baseWti - 1) * 100;
  const rateRatio = (exchangeRate / baseRate - 1) * 100;

  const level =
    riskIndex >= 130
      ? {
          label: "위험",
          color: "text-[var(--accent-up)]",
          gaugeColor: "#e85d5d",
          Icon: AlertTriangle,
        }
      : riskIndex >= 110
      ? {
          label: "주의",
          color: "text-amber-400",
          gaugeColor: "#f59e0b",
          Icon: AlertCircle,
        }
      : {
          label: "안전",
          color: "text-[var(--accent-down)]",
          gaugeColor: "#2dbc7f",
          Icon: CheckCircle,
        };

  const { Icon } = level;

  return (
    <div className="card px-3.5 py-2 flex flex-col gap-2">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--text-secondary)]">복합 리스크 지수</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[var(--text-muted)]">{source}</span>
          <span className={`text-[11px] font-medium ${level.color}`}>
            {level.label}
          </span>
        </div>
      </div>

      {/* 지수 값 */}
      <div className="flex items-end gap-2">
        <span className={`text-2xl font-bold tabular-nums ${level.color}`}>
          {riskIndex.toFixed(1)}
        </span>
        <span className="text-[11px] text-[var(--text-muted)] mb-0.5">/ 100 기준</span>
      </div>

      {/* 게이지 */}
      <HorizontalGauge value={riskIndex} color={level.gaugeColor} />

      {/* 세부 지표 */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[var(--bg-card-alt)] rounded px-3 py-2 flex flex-col gap-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[var(--text-muted)]">WTI</span>
            {wtiRatio >= 0
              ? <TrendingUp size={11} className="text-[var(--accent-up)]" />
              : <TrendingDown size={11} className="text-[var(--accent-down)]" />}
          </div>
          <span className="text-sm font-bold text-white tabular-nums">${wtiPrice.toFixed(1)}</span>
          <span className={`text-[10px] tabular-nums ${wtiRatio >= 0 ? "text-[var(--accent-up)]" : "text-[var(--accent-down)]"}`}>
            {wtiRatio >= 0 ? "+" : ""}{wtiRatio.toFixed(1)}%
          </span>
        </div>
        <div className="bg-[var(--bg-card-alt)] rounded px-3 py-2 flex flex-col gap-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[var(--text-muted)]">원/달러</span>
            {rateRatio >= 0
              ? <TrendingUp size={11} className="text-[var(--accent-up)]" />
              : <TrendingDown size={11} className="text-[var(--accent-down)]" />}
          </div>
          <span className="text-sm font-bold text-white tabular-nums">₩{exchangeRate.toFixed(0)}</span>
          <span className={`text-[10px] tabular-nums ${rateRatio >= 0 ? "text-[var(--accent-up)]" : "text-[var(--accent-down)]"}`}>
            {rateRatio >= 0 ? "+" : ""}{rateRatio.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}
