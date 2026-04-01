"use client";

import {
  Landmark,
  TrendingUp,
  TrendingDown,
  Minus,
  ShieldCheck,
  Banknote,
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
      <div className="flex items-center gap-2.5">
        <div className={`w-7 h-7 rounded-lg ${accentColor} flex items-center justify-center`}>
          {icon}
        </div>
        <span className="text-sm text-slate-300 font-semibold">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <span className="text-base font-bold text-white tabular-nums">
            {value.toLocaleString("ko-KR", { maximumFractionDigits: 1 })}
          </span>
          <span className="text-xs text-slate-500 ml-1">억$</span>
        </div>
        {ratio !== undefined && (
          <span className="text-[10px] text-slate-500 font-medium min-w-[40px] text-right">
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
    { value: data.gold, color: "bg-yellow-400", label: "금" },
    { value: data.sdr, color: "bg-violet-500", label: "SDR" },
    { value: data.imfPosition, color: "bg-emerald-500", label: "IMF포지션" },
  ];
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;

  return (
    <div className="mt-1 mb-1">
      {/* 바 */}
      <div className="flex h-2 rounded-full overflow-hidden gap-[1px]">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className={`${seg.color} opacity-80 transition-all duration-700`}
            style={{ width: `${(seg.value / total) * 100}%` }}
          />
        ))}
      </div>
      {/* 범례 */}
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${seg.color} opacity-80`} />
            <span className="text-[10px] text-slate-500">{seg.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ForexReservesWidget({ data }: Props) {
  if (!data) {
    return (
      <div className="glass-card px-4 py-2">
        <div className="widget-header mb-2">
          <div className="h-4 bg-slate-700 rounded w-28 animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-10 bg-slate-800/60 rounded-lg animate-pulse" />
          <div className="h-2 bg-slate-800/60 rounded-lg animate-pulse" />
          <div className="h-8 bg-slate-800/60 rounded-lg animate-pulse" />
          <div className="h-8 bg-slate-800/60 rounded-lg animate-pulse" />
          <div className="h-8 bg-slate-800/60 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  const isPositive = data.change > 0;
  const isNegative = data.change < 0;
  const changeColor = isPositive
    ? "text-emerald-400"
    : isNegative
    ? "text-red-400"
    : "text-slate-500";
  const changeBg = isPositive
    ? "bg-emerald-500/10"
    : isNegative
    ? "bg-red-500/10"
    : "bg-slate-500/10";
  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  const total = data.total || 1;

  return (
    <div className="glass-card px-4 py-2 flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-0.5">
        <div className="widget-header">
          <Landmark size={15} className="text-sky-400" />
          <span>외환보유고</span>
        </div>
        <span className="text-[10px] text-slate-600 font-medium">
          {data.month} 기준 · {data.source}
        </span>
      </div>

      {/* 총액 + 변동 */}
      <div className="flex items-end justify-between mb-1 mt-1">
        <div>
          <span className="text-2xl font-extrabold text-white tabular-nums tracking-tight">
            {data.total.toLocaleString("ko-KR", { maximumFractionDigits: 1 })}
          </span>
          <span className="text-sm text-slate-400 ml-1.5">억 달러</span>
        </div>
        <div
          className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md ${changeBg} ${changeColor}`}
        >
          <TrendIcon size={12} />
          <span>
            {isPositive ? "+" : ""}
            {data.change.toLocaleString("ko-KR", { maximumFractionDigits: 1 })}
          </span>
          <span className="text-[10px] opacity-70">전월비</span>
        </div>
      </div>

      {/* 구성 비율 바 */}
      <CompositionBar data={data} />

      {/* 항목별 내역 */}
      <div className="divide-y divide-slate-700/30">
        <ReserveRow
          label="외환"
          value={data.forex}
          icon={<DollarSign size={14} className="text-sky-300" />}
          accentColor="bg-sky-500/15"
          ratio={data.forex / total}
        />
        <ReserveRow
          label="금"
          value={data.gold}
          icon={<Coins size={14} className="text-yellow-300" />}
          accentColor="bg-yellow-400/15"
          ratio={data.gold / total}
        />
        <ReserveRow
          label="SDR"
          value={data.sdr}
          icon={<BadgeDollarSign size={14} className="text-violet-300" />}
          accentColor="bg-violet-500/15"
          ratio={data.sdr / total}
        />
        <ReserveRow
          label="IMF 포지션"
          value={data.imfPosition}
          icon={<ShieldCheck size={14} className="text-emerald-300" />}
          accentColor="bg-emerald-500/15"
          ratio={data.imfPosition / total}
        />
      </div>
    </div>
  );
}
