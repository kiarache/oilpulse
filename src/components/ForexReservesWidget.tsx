"use client";

import {
  TrendingUp,
  TrendingDown,
  Minus,
  ShieldCheck,
  Coins,
  BadgeDollarSign,
  DollarSign,
} from "lucide-react";
import type { ForexReservesData } from "@/lib/types";

interface Props {
  data: ForexReservesData | null;
}

interface ReserveRowProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  accentColor: string;
  /** 전체 대비 비중 (0-1) */
  ratio?: number;
}

function ReserveRow({ label, value, icon, accentColor, ratio }: ReserveRowProps) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2">
        <div className={`w-6 h-6 rounded ${accentColor} flex items-center justify-center`}>
          {icon}
        </div>
        <span className="text-[13px] text-[var(--text-primary)] font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <span className="text-sm font-bold text-white tabular-nums">
            {value.toLocaleString("ko-KR", { maximumFractionDigits: 1 })}
          </span>
          <span className="text-[10px] text-[var(--text-muted)] ml-1">억$</span>
        </div>
        {ratio !== undefined && (
          <span className="text-[10px] text-[var(--text-muted)] min-w-[36px] text-right tabular-nums">
            {(ratio * 100).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}

/** 소형 바 차트로 보유고 구성 비율 시각화 */
function CompositionBar({ data }: { data: ForexReservesData }) {
  const segments = [
    { value: data.forex, color: "bg-sky-500", label: "외환" },
    { value: data.gold, color: "bg-amber-400", label: "금" },
    { value: data.sdr, color: "bg-violet-500", label: "SDR" },
    { value: data.imfPosition, color: "bg-[var(--accent-down)]", label: "IMF포지션" },
  ];
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;

  return (
    <div className="mt-1 mb-1">
      {/* 바 */}
      <div className="flex h-1.5 rounded-full overflow-hidden gap-px">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className={`${seg.color} opacity-70 transition-all duration-700`}
            style={{ width: `${(seg.value / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${seg.color} opacity-70`} />
            <span className="text-[10px] text-[var(--text-muted)]">{seg.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ForexReservesWidget({ data }: Props) {
  if (!data) {
    return (
      <div className="card px-3.5 py-2">
        <div className="widget-header mb-2">
          <div className="h-3.5 bg-[var(--bg-card-alt)] rounded w-28 animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-10 bg-[var(--bg-card-alt)] rounded animate-pulse" />
          <div className="h-1.5 bg-[var(--bg-card-alt)] rounded animate-pulse" />
          <div className="h-8 bg-[var(--bg-card-alt)] rounded animate-pulse" />
          <div className="h-8 bg-[var(--bg-card-alt)] rounded animate-pulse" />
          <div className="h-8 bg-[var(--bg-card-alt)] rounded animate-pulse" />
        </div>
      </div>
    );
  }

  const isPositive = data.change > 0;
  const isNegative = data.change < 0;
  const changeColor = isPositive
    ? "text-[var(--accent-down)]"
    : isNegative
    ? "text-[var(--accent-up)]"
    : "text-[var(--text-muted)]";
  const changeBg = isPositive
    ? "bg-[var(--accent-down)]/10"
    : isNegative
    ? "bg-[var(--accent-up)]/10"
    : "bg-[var(--bg-card-alt)]";
  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  const total = data.total || 1;

  return (
    <div className="card px-3.5 py-2 flex flex-col">
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-xs font-medium text-[var(--text-secondary)]">외환보유고</span>
        <span className="text-[10px] text-[var(--text-muted)]">
          {data.month} · {data.source}
        </span>
      </div>

      <div className="flex items-end justify-between mb-1 mt-1">
        <div>
          <span className="text-xl font-bold text-white tabular-nums">
            {data.total.toLocaleString("ko-KR", { maximumFractionDigits: 1 })}
          </span>
          <span className="text-xs text-[var(--text-muted)] ml-1">억 달러</span>
        </div>
        <div
          className={`flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded ${changeBg} ${changeColor}`}
        >
          <TrendIcon size={11} />
          <span>
            {isPositive ? "+" : ""}
            {data.change.toLocaleString("ko-KR", { maximumFractionDigits: 1 })}
          </span>
          <span className="text-[10px] opacity-70">전월비</span>
        </div>
      </div>

      {/* 구성 비율 바 */}
      <CompositionBar data={data} />

      <div className="divide-y divide-[var(--border-subtle)]">
        <ReserveRow
          label="외환"
          value={data.forex}
          icon={<DollarSign size={12} className="text-sky-400" />}
          accentColor="bg-sky-500/10"
          ratio={data.forex / total}
        />
        <ReserveRow
          label="금"
          value={data.gold}
          icon={<Coins size={12} className="text-amber-400" />}
          accentColor="bg-amber-400/10"
          ratio={data.gold / total}
        />
        <ReserveRow
          label="SDR"
          value={data.sdr}
          icon={<BadgeDollarSign size={12} className="text-violet-400" />}
          accentColor="bg-violet-500/10"
          ratio={data.sdr / total}
        />
        <ReserveRow
          label="IMF 포지션"
          value={data.imfPosition}
          icon={<ShieldCheck size={12} className="text-[var(--accent-down)]" />}
          accentColor="bg-[var(--accent-down)]/10"
          ratio={data.imfPosition / total}
        />
      </div>
    </div>
  );
}
