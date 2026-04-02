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
    ? "text-[var(--accent-up)]"
    : isNegative
    ? "text-[var(--accent-down)]"
    : "text-[var(--text-muted)]";
  const changeBg = isPositive
    ? "bg-[#e85d5d]/10"
    : isNegative
    ? "bg-[#2dbc7f]/10"
    : "bg-[var(--bg-card-alt)]";

  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <div
      className={`card-interactive p-3.5 flex flex-col gap-1 ${
        highlight
          ? "border-[var(--accent-brand)]/30"
          : ""
      }`}
    >
      <span className="text-[11px] font-medium text-[var(--text-muted)]">
        {label}
      </span>
      <div className="flex items-end gap-1.5">
        <span className="text-2xl font-bold text-white leading-none tabular-nums">{value}</span>
        {unit && <span className="text-xs text-[var(--text-muted)] mb-0.5">{unit}</span>}
      </div>
      {change != null && (
        <div className={`inline-flex items-center gap-1 text-xs font-medium w-fit px-1.5 py-0.5 rounded ${changeBg} ${changeColor}`}>
          <TrendIcon size={12} />
          <span>
            {isPositive ? "+" : ""}
            {change.toFixed(2)}
            {changePercent != null && ` (${changePercent > 0 ? "+" : ""}${changePercent.toFixed(2)}%)`}
          </span>
        </div>
      )}
      {subLabel && <span className="text-[10px] text-[var(--text-muted)] mt-0.5">{subLabel}</span>}
    </div>
  );
}
