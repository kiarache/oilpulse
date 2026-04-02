"use client";

import { TrendingUp, TrendingDown, Minus, Droplets } from "lucide-react";
import type { KoreaFuelData } from "@/lib/types";

interface Props {
  data: KoreaFuelData | null;
}

interface FuelRowProps {
  label: string;
  price: number;
  change: number;
  unit: string;
  icon: React.ReactNode;
  accentColor: string;
}

function FuelRow({ label, price, change, unit, icon, accentColor }: FuelRowProps) {
  const isPositive = change > 0;
  const isNegative = change < 0;
  const changeColor = isPositive
    ? "text-[var(--accent-up)]"
    : isNegative
    ? "text-[var(--accent-down)]"
    : "text-[var(--text-muted)]";
  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <div className="flex items-center justify-between py-2 gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <div className={`w-6 h-6 rounded ${accentColor} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
        <div className="min-w-0">
          <span className="text-[13px] text-[var(--text-primary)] font-medium block">{label}</span>
          <span className="text-[10px] text-[var(--text-muted)] block">전국 평균</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="flex items-center gap-1">
          <span className="text-base font-bold text-white tabular-nums">
            {price.toLocaleString()}
          </span>
          <span className="text-[10px] text-[var(--text-muted)]">{unit}</span>
        </div>
        <div className={`flex items-center gap-0.5 text-[11px] font-medium justify-end ${changeColor}`}>
          <TrendIcon size={10} />
          <span>{isPositive ? "+" : ""}{change.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}

export default function DomesticFuelWidget({ data }: Props) {
  if (!data) {
    return (
      <div className="card px-3.5 py-2">
        <div className="widget-header mb-2">
          <div className="h-3.5 bg-[var(--bg-card-alt)] rounded w-24 animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-8 bg-[var(--bg-card-alt)] rounded animate-pulse" />
          <div className="h-8 bg-[var(--bg-card-alt)] rounded animate-pulse" />
          <div className="h-8 bg-[var(--bg-card-alt)] rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="card px-3.5 py-2 flex flex-col">
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-xs font-medium text-[var(--text-secondary)]">국내 평균 유가</span>
        <span className="text-[10px] text-[var(--text-muted)]">오피넷</span>
      </div>
      <div className="divide-y divide-[var(--border-subtle)]">
        <FuelRow
          label="휘발유"
          price={data.gasoline.price}
          change={data.gasoline.change}
          unit="원/ℓ"
          icon={<Droplets size={12} className="text-[var(--accent-brand)]" />}
          accentColor="bg-[var(--accent-brand)]/10"
        />
        <FuelRow
          label="경유"
          price={data.diesel.price}
          change={data.diesel.change}
          unit="원/ℓ"
          icon={<Droplets size={12} className="text-sky-400" />}
          accentColor="bg-sky-500/10"
        />
        <FuelRow
          label="LPG"
          price={data.lpg.price}
          change={data.lpg.change}
          unit="원/ℓ"
          icon={<Droplets size={12} className="text-[var(--accent-down)]" />}
          accentColor="bg-[var(--accent-down)]/10"
        />
      </div>
    </div>
  );
}
