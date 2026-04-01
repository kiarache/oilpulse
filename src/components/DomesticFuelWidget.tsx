"use client";

import { TrendingUp, TrendingDown, Minus, Fuel, Droplets } from "lucide-react";
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
    ? "text-red-400"
    : isNegative
    ? "text-emerald-400"
    : "text-slate-500";
  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <div className="flex items-center justify-between py-2.5 gap-2">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`w-7 h-7 rounded-lg ${accentColor} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
        <div className="min-w-0">
          <span className="text-sm text-slate-300 font-semibold block">{label}</span>
          <span className="text-[11px] text-slate-500 block">전국 평균</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="flex items-center gap-1">
          <span className="text-lg font-bold text-white tabular-nums">
            {price.toLocaleString()}
          </span>
          <span className="text-xs text-slate-500">{unit}</span>
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium justify-end ${changeColor}`}>
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
      <div className="glass-card px-4 py-2">
        <div className="widget-header mb-2">
          <div className="h-4 bg-slate-700 rounded w-24 animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-8 bg-slate-800/60 rounded-lg animate-pulse" />
          <div className="h-8 bg-slate-800/60 rounded-lg animate-pulse" />
          <div className="h-8 bg-slate-800/60 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card px-4 py-2 flex flex-col">
      <div className="flex items-center justify-between mb-0.5">
        <div className="widget-header">
          <Fuel size={15} className="text-orange-400" />
          <span>국내 평균 유가</span>
        </div>
        <span className="text-[10px] text-slate-600 font-medium">오피넷</span>
      </div>
      <div className="divide-y divide-slate-700/30">
        <FuelRow
          label="휘발유"
          price={data.gasoline.price}
          change={data.gasoline.change}
          unit="원/ℓ"
          icon={<Droplets size={14} className="text-orange-300" />}
          accentColor="bg-orange-500/15"
        />
        <FuelRow
          label="경유"
          price={data.diesel.price}
          change={data.diesel.change}
          unit="원/ℓ"
          icon={<Droplets size={14} className="text-blue-300" />}
          accentColor="bg-blue-500/15"
        />
        <FuelRow
          label="LPG"
          price={data.lpg.price}
          change={data.lpg.change}
          unit="원/ℓ"
          icon={<Droplets size={14} className="text-emerald-300" />}
          accentColor="bg-emerald-500/15"
        />
      </div>
    </div>
  );
}
