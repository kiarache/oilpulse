"use client";

import {
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Activity,
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

// ── 반원형 게이지 SVG (개선) ─────────────────────────────────
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
  const strokeWidth = 12;
  const cx = 80;
  const cy = 80;
  const halfCircumference = Math.PI * radius;
  const clampedValue = Math.min(Math.max(value, 0), max);
  const progress = (clampedValue / max) * halfCircumference;
  const filterId = `glow-${color.replace("#", "")}`;

  // 니들 각도 계산 (180° = 왼쪽 → 0° = 오른쪽)
  const needleAngle = 180 - (clampedValue / max) * 180;
  const needleLen = radius - 18;
  const needleRad = (needleAngle * Math.PI) / 180;
  const nx = cx + needleLen * Math.cos(needleRad);
  const ny = cy - needleLen * Math.sin(needleRad);

  return (
    <svg width="160" height="100" viewBox="0 0 160 100" className="mx-auto">
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id={`grad-${filterId}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      {/* 배경 트랙 */}
      <path
        d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
        fill="none"
        stroke={bgColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* 메인 게이지 */}
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
      {/* 니들 */}
      <line
        x1={cx}
        y1={cy}
        x2={nx}
        y2={ny}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
        opacity="0.8"
      />
      <circle cx={cx} cy={cy} r="4" fill={color} opacity="0.9" />
      <circle cx={cx} cy={cy} r="2" fill="#0f172a" />
      {/* 눈금 라벨 */}
      <text x="6" y="92" className="fill-slate-600" fontSize="9" textAnchor="middle">0</text>
      <text x="80" y="12" className="fill-slate-600" fontSize="9" textAnchor="middle">85</text>
      <text x="154" y="92" className="fill-slate-600" fontSize="9" textAnchor="middle">170</text>
    </svg>
  );
}

// ── 기여도 바 ────────────────────────────────────────────────
function ContributionBar({
  label,
  value,
  maxValue = 50,
  color,
}: {
  label: string;
  value: number;
  maxValue?: number;
  color: string;
}) {
  const absVal = Math.abs(value);
  const width = Math.min((absVal / maxValue) * 100, 100);
  const isPositive = value >= 0;

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-slate-500 w-12 text-right shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-800/60 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
      <span className={`text-[10px] tabular-nums font-medium w-12 ${isPositive ? "text-red-400" : "text-emerald-400"}`}>
        {isPositive ? "+" : ""}{value.toFixed(1)}%
      </span>
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

  // ── 리스크 레벨 계산 ──────────────────────────────────────
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

  // WTI / 환율 중 어느 쪽이 리스크에 더 기여하는지
  const wtiContrib = Math.abs(wtiRatio);
  const rateContrib = Math.abs(rateRatio);
  const dominant = wtiContrib > rateContrib ? "WTI" : "환율";

  return (
    <div
      className={`rounded-2xl px-5 py-3 border backdrop-blur-md ${level.bg} ${level.border} flex flex-col gap-2`}
      style={{
        boxShadow:
          "0 0 0 1px rgba(148, 163, 184, 0.05), 0 4px 24px -4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(148, 163, 184, 0.06)",
      }}
    >
      {/* ── 헤더 ─ */}
      <div className="flex items-center justify-between">
        <div className="widget-header">
          <Activity size={15} className={level.color} />
          <span>복합 리스크 지수</span>
          <span
            className={`ml-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded ${
              source === "TradingView"
                ? "text-blue-400 bg-blue-500/10 border border-blue-500/20"
                : "text-slate-500 bg-slate-700/30 border border-slate-600/20"
            }`}
          >
            {source}
          </span>
        </div>
        {/* 레벨 뱃지 */}
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${level.badgeBg} ${level.badgeBorder}`}>
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${level.pulseColor} opacity-75`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${level.pulseColor}`} />
          </span>
          <Icon size={14} className={level.color} />
          <span className={`text-xs font-bold ${level.color}`}>{level.label}</span>
        </div>
      </div>

      {/* ── 게이지 + 지수 값 ─ */}
      <div className="relative flex flex-col items-center -mb-1">
        <SemiCircleGauge value={riskIndex} color={level.gaugeColor} bgColor={level.gaugeBg} />
        <div className="absolute bottom-0 flex flex-col items-center">
          <span className={`text-3xl font-extrabold tabular-nums ${level.color}`}>
            {riskIndex.toFixed(1)}
          </span>
          <span className="text-[10px] text-slate-500 -mt-0.5">/ 100 기준</span>
        </div>
      </div>

      {/* ── 3단계 인디케이터 바 ─ */}
      <div className="flex gap-1.5 w-full mt-1">
        {[
          { active: riskIndex < 110, label: "안전 <110", activeColor: "bg-emerald-500", shadow: "shadow-emerald-500/30", textActive: "text-emerald-400" },
          { active: riskIndex >= 110 && riskIndex < 130, label: "주의 110–130", activeColor: "bg-amber-500", shadow: "shadow-amber-500/30", textActive: "text-amber-400" },
          { active: riskIndex >= 130, label: "위험 >130", activeColor: "bg-red-500", shadow: "shadow-red-500/30", textActive: "text-red-400" },
        ].map((seg) => (
          <div key={seg.label} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`h-1.5 w-full rounded-full transition-colors duration-500 ${
                seg.active ? `${seg.activeColor} shadow-sm ${seg.shadow}` : `${seg.activeColor}/15`
              }`}
            />
            <span className={`text-[10px] ${seg.active ? `${seg.textActive} font-semibold` : "text-slate-600"}`}>
              {seg.label}
            </span>
          </div>
        ))}
      </div>

      {/* ── 리스크 기여도 분석 ─ */}
      <div className="rounded-xl bg-slate-800/30 border border-slate-700/20 px-3 py-2 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium text-slate-500">리스크 기여도</span>
          <span className="text-[10px] text-slate-600">
            주요 원인: <span className={level.color}>{dominant}</span>
          </span>
        </div>
        <ContributionBar label="WTI" value={wtiRatio} color={wtiRatio >= 0 ? "#ef4444" : "#10b981"} />
        <ContributionBar label="환율" value={rateRatio} color={rateRatio >= 0 ? "#ef4444" : "#10b981"} />
      </div>

      {/* ── 세부 지표 카드 ─ */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-xl bg-slate-800/40 border border-slate-700/30 px-3.5 py-2.5 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-500">
              <DollarSign size={13} />
              <span className="text-[11px] font-medium">WTI 유가</span>
            </div>
            {wtiRatio >= 0
              ? <TrendingUp size={12} className="text-red-400" />
              : <TrendingDown size={12} className="text-emerald-400" />}
          </div>
          <span className="text-base font-bold text-white tabular-nums">${wtiPrice.toFixed(1)}</span>
          <div
            className={`inline-flex items-center text-[11px] tabular-nums font-medium w-fit px-1.5 py-0.5 rounded ${
              wtiRatio >= 0 ? "text-red-400 bg-red-500/10" : "text-emerald-400 bg-emerald-500/10"
            }`}
          >
            기준 대비 {wtiRatio >= 0 ? "+" : ""}{wtiRatio.toFixed(1)}%
          </div>
        </div>
        <div className="rounded-xl bg-slate-800/40 border border-slate-700/30 px-3.5 py-2.5 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-500">
              <ArrowRightLeft size={13} />
              <span className="text-[11px] font-medium">원/달러 환율</span>
            </div>
            {rateRatio >= 0
              ? <TrendingUp size={12} className="text-red-400" />
              : <TrendingDown size={12} className="text-emerald-400" />}
          </div>
          <span className="text-base font-bold text-white tabular-nums">₩{exchangeRate.toFixed(0)}</span>
          <div
            className={`inline-flex items-center text-[11px] tabular-nums font-medium w-fit px-1.5 py-0.5 rounded ${
              rateRatio >= 0 ? "text-red-400 bg-red-500/10" : "text-emerald-400 bg-emerald-500/10"
            }`}
          >
            기준 대비 {rateRatio >= 0 ? "+" : ""}{rateRatio.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* ── 산출 공식 안내 ─ */}
      <div className="text-center">
        <span className="text-[9px] text-slate-600">
          산출식: (WTI ÷ {baseWti}) × (환율 ÷ {baseRate.toLocaleString()}) × 100
        </span>
      </div>
    </div>
  );
}
