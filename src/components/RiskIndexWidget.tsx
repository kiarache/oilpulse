"use client";

import { AlertTriangle, CheckCircle, AlertCircle, Activity, DollarSign, ArrowRightLeft } from "lucide-react";

interface RiskIndexWidgetProps {
  wtiPrice: number;
  exchangeRate: number;
  baseWti?: number;
  baseRate?: number;
  source?: "TradingView" | "Yahoo Finance";
}

/** 반원형 게이지 SVG — 글로우 효과 추가 */
function SemiCircleGauge({
  value,
  max = 170,
  color,
  bgColor,
}: {
  value: number;
  max?: number;
  color: string;
  bgColor: string;
}) {
  const radius = 70;
  const strokeWidth = 10;
  const cx = 80;
  const cy = 80;
  const halfCircumference = Math.PI * radius;
  const clampedValue = Math.min(Math.max(value, 0), max);
  const progress = (clampedValue / max) * halfCircumference;
  const filterId = `glow-${color.replace('#', '')}`;

  return (
    <svg width="160" height="95" viewBox="0 0 160 95" className="mx-auto">
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* 배경 호 */}
      <path
        d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
        fill="none"
        stroke={bgColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* 진행 호 — 글로우 */}
      <path
        d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${halfCircumference}`}
        strokeDashoffset={`${halfCircumference - progress}`}
        className="transition-all duration-1000 ease-out"
        filter={`url(#${filterId})`}
      />
      {/* 눈금 라벨 */}
      <text x="6" y="92" className="fill-slate-600" fontSize="9" textAnchor="middle">0</text>
      <text x="80" y="12" className="fill-slate-600" fontSize="9" textAnchor="middle">85</text>
      <text x="154" y="92" className="fill-slate-600" fontSize="9" textAnchor="middle">170</text>
    </svg>
  );
}

export default function RiskIndexWidget({
  wtiPrice,
  exchangeRate,
  baseWti = 70,
  baseRate = 1300,
  source = "Yahoo Finance",
}: RiskIndexWidgetProps) {
  const riskIndex = (wtiPrice / baseWti) * (exchangeRate / baseRate) * 100;

  const wtiRatio = ((wtiPrice / baseWti - 1) * 100);
  const rateRatio = ((exchangeRate / baseRate - 1) * 100);

  const level =
    riskIndex >= 130
      ? {
          label: "위험",
          color: "text-red-400",
          bg: "bg-red-500/10",
          border: "border-red-500/25",
          gaugeColor: "#ef4444",
          gaugeBg: "#7f1d1d30",
          Icon: AlertTriangle,
          badgeBg: "bg-red-500/15",
          badgeBorder: "border-red-500/20",
          pulseColor: "bg-red-500",
        }
      : riskIndex >= 110
      ? {
          label: "주의",
          color: "text-amber-400",
          bg: "bg-amber-500/10",
          border: "border-amber-500/25",
          gaugeColor: "#f59e0b",
          gaugeBg: "#78350f30",
          Icon: AlertCircle,
          badgeBg: "bg-amber-500/15",
          badgeBorder: "border-amber-500/20",
          pulseColor: "bg-amber-500",
        }
      : {
          label: "안전",
          color: "text-emerald-400",
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/25",
          gaugeColor: "#10b981",
          gaugeBg: "#06523630",
          Icon: CheckCircle,
          badgeBg: "bg-emerald-500/15",
          badgeBorder: "border-emerald-500/20",
          pulseColor: "bg-emerald-500",
        };

  const { Icon } = level;

  return (
    <div className={`rounded-2xl px-5 py-3 border backdrop-blur-md ${level.bg} ${level.border} flex flex-col gap-2`}
      style={{ boxShadow: `0 0 0 1px rgba(148, 163, 184, 0.05), 0 4px 24px -4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(148, 163, 184, 0.06)` }}>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="widget-header">
          <Activity size={15} className={level.color} />
          <span>복합 리스크 지수</span>
          <span className={`ml-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded ${
            source === "TradingView"
              ? "text-blue-400 bg-blue-500/10 border border-blue-500/20"
              : "text-slate-500 bg-slate-700/30 border border-slate-600/20"
          }`}>{source}</span>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${level.badgeBg} ${level.badgeBorder}`}>
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${level.pulseColor} opacity-75`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${level.pulseColor}`} />
          </span>
          <Icon size={14} className={level.color} />
          <span className={`text-xs font-bold ${level.color}`}>{level.label}</span>
        </div>
      </div>

      {/* 게이지 + 중앙 수치 */}
      <div className="relative flex flex-col items-center -mb-1">
        <SemiCircleGauge
          value={riskIndex}
          color={level.gaugeColor}
          bgColor={level.gaugeBg}
        />
        <div className="absolute bottom-0 flex flex-col items-center">
          <span className={`text-3xl font-extrabold tabular-nums ${level.color}`}>
            {riskIndex.toFixed(1)}
          </span>
          <span className="text-[10px] text-slate-500 -mt-0.5">/ 100 기준</span>
        </div>
      </div>

      {/* 3단계 인디케이터 바 */}
      <div className="flex gap-1.5 w-full mt-1">
        <div className="flex-1 flex flex-col items-center gap-1">
          <div className={`h-1.5 w-full rounded-full transition-colors duration-500 ${riskIndex < 110 ? "bg-emerald-500 shadow-sm shadow-emerald-500/30" : "bg-emerald-500/15"}`} />
          <span className={`text-[10px] ${riskIndex < 110 ? "text-emerald-400 font-semibold" : "text-slate-600"}`}>
            안전 &lt;110
          </span>
        </div>
        <div className="flex-1 flex flex-col items-center gap-1">
          <div className={`h-1.5 w-full rounded-full transition-colors duration-500 ${riskIndex >= 110 && riskIndex < 130 ? "bg-amber-500 shadow-sm shadow-amber-500/30" : "bg-amber-500/15"}`} />
          <span className={`text-[10px] ${riskIndex >= 110 && riskIndex < 130 ? "text-amber-400 font-semibold" : "text-slate-600"}`}>
            주의 110–130
          </span>
        </div>
        <div className="flex-1 flex flex-col items-center gap-1">
          <div className={`h-1.5 w-full rounded-full transition-colors duration-500 ${riskIndex >= 130 ? "bg-red-500 shadow-sm shadow-red-500/30" : "bg-red-500/15"}`} />
          <span className={`text-[10px] ${riskIndex >= 130 ? "text-red-400 font-semibold" : "text-slate-600"}`}>
            위험 &gt;130
          </span>
        </div>
      </div>

      {/* 세부 지표 카드 2개 */}
      <div className="grid grid-cols-2 gap-2.5 mt-0">
        <div className="rounded-xl bg-slate-800/40 border border-slate-700/30 px-4 py-2.5 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-slate-500">
            <DollarSign size={13} />
            <span className="text-[11px] font-medium">WTI 유가</span>
          </div>
          <span className="text-base font-bold text-white tabular-nums">${wtiPrice.toFixed(1)}</span>
          <div className={`inline-flex items-center text-[11px] tabular-nums font-medium w-fit px-1.5 py-0.5 rounded ${wtiRatio >= 0 ? "text-red-400 bg-red-500/10" : "text-emerald-400 bg-emerald-500/10"}`}>
            기준 대비 {wtiRatio >= 0 ? "+" : ""}{wtiRatio.toFixed(1)}%
          </div>
        </div>
        <div className="rounded-xl bg-slate-800/40 border border-slate-700/30 px-4 py-2.5 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-slate-500">
            <ArrowRightLeft size={13} />
            <span className="text-[11px] font-medium">원/달러 환율</span>
          </div>
          <span className="text-base font-bold text-white tabular-nums">₩{exchangeRate.toFixed(0)}</span>
          <div className={`inline-flex items-center text-[11px] tabular-nums font-medium w-fit px-1.5 py-0.5 rounded ${rateRatio >= 0 ? "text-red-400 bg-red-500/10" : "text-emerald-400 bg-emerald-500/10"}`}>
            기준 대비 {rateRatio >= 0 ? "+" : ""}{rateRatio.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}
