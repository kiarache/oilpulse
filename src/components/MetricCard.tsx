"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  unit?: string;
  change?: number;
  changePercent?: number;
  subLabel?: string;
  highlight?: boolean;
}

export default function MetricCard({
  label,
  value,
  unit,
  change,
  changePercent,
  subLabel,
  highlight,
}: MetricCardProps) {
  const isPositive = ((change ?? 0) > 0);
  const isNegative = ((change ?? 0) < 0);
  const changeColor = isPositive
    ? "text-red-400"   // 유가/환율 상승은 위험 → 빨강
    : isNegative
    ? "text-emerald-400" // 하락은 안심 → 초록
    : "text-slate-400";
  const changeBg = isPositive
    ? "bg-red-500/10"
    : isNegative
    ? "bg-emerald-500/10"
    : "bg-slate-500/10";

  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <div
      className={`glass-card-hover p-4 flex flex-col gap-1.5 ${
        highlight
          ? "ring-1 ring-orange-500/30 shadow-lg shadow-orange-500/5"
          : ""
      }`}
    >
      <span className="widget-header">
        {label}
      </span>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-white leading-none tabular-nums">{value}</span>
        {unit && <span className="text-sm text-slate-400 mb-0.5 font-medium">{unit}</span>}
      </div>
      {change != null && (
        <div className={`inline-flex items-center gap-1 text-sm font-medium w-fit px-2 py-0.5 rounded-md ${changeBg} ${changeColor}`}>
          <TrendIcon size={14} />
          <span>
            {isPositive ? "+" : ""}
            {change.toFixed(2)}
            {changePercent != null && ` (${changePercent > 0 ? "+" : ""}${changePercent.toFixed(2)}%)`}
          </span>
        </div>
      )}
      {subLabel && <span className="text-[11px] text-slate-500 mt-0.5">{subLabel}</span>}
    </div>
  );
}
