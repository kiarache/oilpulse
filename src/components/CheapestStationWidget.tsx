"use client";

import { Droplets, MapPin } from "lucide-react";
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
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded ${accentColor} flex items-center justify-center`}>
            {icon}
          </div>
          <span className="text-[13px] text-[var(--text-primary)] font-medium">{label}</span>
        </div>
        <span className="text-[11px] text-[var(--text-muted)]">데이터 없음</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-2 gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <div className={`w-6 h-6 rounded ${accentColor} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
        <div className="min-w-0">
          <span className="text-[13px] text-[var(--text-primary)] font-medium block">{label}</span>
          <span className="text-[10px] text-[var(--text-muted)] truncate block" title={station.name}>
            {station.name}
          </span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="flex items-center gap-1">
          <span className="text-base font-bold text-white tabular-nums">
            {station.price.toLocaleString()}
          </span>
          <span className="text-[10px] text-[var(--text-muted)]">원</span>
        </div>
        <div className="flex items-center gap-0.5 justify-end">
          <MapPin size={9} className="text-[var(--text-muted)]" />
          <span className="text-[10px] text-[var(--text-muted)]">{station.region}</span>
        </div>
      </div>
    </div>
  );
}

export default function CheapestStationWidget({ data }: Props) {
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
        <span className="text-xs font-medium text-[var(--text-secondary)]">최저가 주유소</span>
        <span className="text-[10px] text-[var(--text-muted)]">전국 TOP1</span>
      </div>
      <div className="divide-y divide-[var(--border-subtle)]">
        <StationRow
          label="휘발유"
          station={data.gasoline}
          icon={<Droplets size={12} className="text-[var(--accent-brand)]" />}
          accentColor="bg-[var(--accent-brand)]/10"
        />
        <StationRow
          label="경유"
          station={data.diesel}
          icon={<Droplets size={12} className="text-sky-400" />}
          accentColor="bg-sky-500/10"
        />
        <StationRow
          label="LPG"
          station={data.lpg}
          icon={<Droplets size={12} className="text-[var(--accent-down)]" />}
          accentColor="bg-[var(--accent-down)]/10"
        />
      </div>
    </div>
  );
}
