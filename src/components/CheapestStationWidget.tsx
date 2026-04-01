"use client";

import { Trophy, Droplets, MapPin } from "lucide-react";
import type { CheapestStationData, CheapestStation } from "@/lib/types";

interface Props {
  data: CheapestStationData | null;
}

interface StationRowProps {
  label: string;
  station: CheapestStation | null;
  icon: React.ReactNode;
  accentColor: string;
}

function StationRow({ label, station, icon, accentColor }: StationRowProps) {
  if (!station) {
    return (
      <div className="flex items-center justify-between py-2.5">
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg ${accentColor} flex items-center justify-center`}>
            {icon}
          </div>
          <span className="text-sm text-slate-300 font-semibold">{label}</span>
        </div>
        <span className="text-xs text-slate-500">데이터 없음</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-2.5 gap-2">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`w-7 h-7 rounded-lg ${accentColor} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
        <div className="min-w-0">
          <span className="text-sm text-slate-300 font-semibold block">{label}</span>
          <span className="text-[11px] text-slate-500 truncate block" title={station.name}>
            {station.name}
          </span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="flex items-center gap-1">
          <span className="text-lg font-bold text-white tabular-nums">
            {station.price.toLocaleString()}
          </span>
          <span className="text-xs text-slate-500">원</span>
        </div>
        <div className="flex items-center gap-1 justify-end">
          <MapPin size={9} className="text-slate-500" />
          <span className="text-[10px] text-slate-500">{station.region}</span>
        </div>
      </div>
    </div>
  );
}

export default function CheapestStationWidget({ data }: Props) {
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
          <Trophy size={15} className="text-yellow-400" />
          <span>최저가 주유소</span>
        </div>
        <span className="text-[10px] text-slate-600 font-medium">전국 TOP1</span>
      </div>
      <div className="divide-y divide-slate-700/30">
        <StationRow
          label="휘발유"
          station={data.gasoline}
          icon={<Droplets size={14} className="text-orange-300" />}
          accentColor="bg-orange-500/15"
        />
        <StationRow
          label="경유"
          station={data.diesel}
          icon={<Droplets size={14} className="text-blue-300" />}
          accentColor="bg-blue-500/15"
        />
        <StationRow
          label="LPG"
          station={data.lpg}
          icon={<Droplets size={14} className="text-emerald-300" />}
          accentColor="bg-emerald-500/15"
        />
      </div>
    </div>
  );
}
