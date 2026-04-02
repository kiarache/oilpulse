"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Activity,
  DollarSign,
  ArrowRightLeft,
  TrendingUp,
  ChartLine,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from "recharts";

// ── 타입 ──────────────────────────────────────────────────────
interface RiskHistoryEntry {
  timestamp: string;
  riskIndex: number;
  wtiPrice: number;
  exchangeRate: number;
  source: string;
}

interface RiskIndexWidgetProps {
  wtiPrice: number;
  exchangeRate: number;
  baseWti?: number;
  baseRate?: number;
  source?: "TradingView" | "Yahoo Finance";
}

// ── 반원형 게이지 SVG ────────────────────────────────────────
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
  const filterId = `glow-${color.replace("#", "")}`;

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
      <path
        d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
        fill="none"
        stroke={bgColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
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
      <text x="6" y="92" className="fill-slate-600" fontSize="9" textAnchor="middle">0</text>
      <text x="80" y="12" className="fill-slate-600" fontSize="9" textAnchor="middle">85</text>
      <text x="154" y="92" className="fill-slate-600" fontSize="9" textAnchor="middle">170</text>
    </svg>
  );
}

// ── 차트 커스텀 툴팁 ─────────────────────────────────────────
interface TooltipProps {
  active?: boolean;
  payload?: { value: number; payload: { wti: number; 환율: number } }[];
  label?: string;
}

function ChartTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  const detail = payload[0].payload;
  const levelColor = val >= 130 ? "text-red-400" : val >= 110 ? "text-amber-400" : "text-emerald-400";
  return (
    <div className="bg-slate-900/95 border border-slate-700/50 rounded-lg px-3 py-2 shadow-xl backdrop-blur-sm">
      <p className="text-[10px] text-slate-500 mb-1">{label}</p>
      <p className={`text-sm font-bold tabular-nums ${levelColor}`}>
        리스크 {val.toFixed(1)}
      </p>
      <div className="flex gap-3 mt-1">
        <span className="text-[10px] text-slate-500">WTI ${detail.wti?.toFixed(1)}</span>
        <span className="text-[10px] text-slate-500">환율 ₩{detail.환율?.toFixed(0)}</span>
      </div>
    </div>
  );
}

// ── 보기 모드 ─────────────────────────────────────────────────
type ViewMode = "gauge" | "chart";

// ── 메인 컴포넌트 ─────────────────────────────────────────────
export default function RiskIndexWidget({
  wtiPrice,
  exchangeRate,
  baseWti = 70,
  baseRate = 1300,
  source = "Yahoo Finance",
}: RiskIndexWidgetProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("gauge");
  const [history, setHistory] = useState<RiskHistoryEntry[]>([]);
  const savedRef = useRef(false);

  const riskIndex = (wtiPrice / baseWti) * (exchangeRate / baseRate) * 100;
  const wtiRatio = (wtiPrice / baseWti - 1) * 100;
  const rateRatio = (exchangeRate / baseRate - 1) * 100;

  // ── 이력 기록 (폴링마다 1회) ──────────────────────────────
  const saveToHistory = useCallback(async () => {
    if (savedRef.current) return;
    savedRef.current = true;
    try {
      await fetch("/api/risk-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ riskIndex, wtiPrice, exchangeRate, source }),
      });
    } catch {
      // 저장 실패는 무시
    }
  }, [riskIndex, wtiPrice, exchangeRate, source]);

  // WTI/환율 변경 시 저장 플래그 리셋
  useEffect(() => {
    savedRef.current = false;
  }, [wtiPrice, exchangeRate]);

  useEffect(() => {
    saveToHistory();
  }, [saveToHistory]);

  // ── 이력 조회 ─────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/risk-history?count=100");
        const json = await res.json();
        if (json.data) setHistory(json.data);
      } catch {
        // 무시
      }
    })();
  }, [wtiPrice, exchangeRate]);

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
          chartStroke: "#ef4444",
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
          chartStroke: "#f59e0b",
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
          chartStroke: "#10b981",
        };

  const { Icon } = level;

  // ── 차트 데이터 가공 ──────────────────────────────────────
  const chartData = history.map((h) => ({
    time: new Date(h.timestamp).toLocaleString("ko-KR", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    리스크: Math.round(h.riskIndex * 10) / 10,
    wti: h.wtiPrice,
    환율: h.exchangeRate,
  }));

  // 현재 값이 마지막 이력과 다르면 추가
  const currentRisk = Math.round(riskIndex * 10) / 10;
  const lastEntry = chartData[chartData.length - 1];
  if (!lastEntry || Math.abs(lastEntry.리스크 - currentRisk) > 0.05) {
    chartData.push({ time: "현재", 리스크: currentRisk, wti: wtiPrice, 환율: exchangeRate });
  }

  // Y축 범위
  const riskValues = chartData.map((d) => d.리스크);
  const yMin = Math.max(0, Math.floor(Math.min(...riskValues) / 5) * 5 - 5);
  const yMax = Math.ceil(Math.max(...riskValues) / 5) * 5 + 5;

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
        <div className="flex items-center gap-2">
          {/* 게이지 ↔ 차트 토글 */}
          <button
            onClick={() => setViewMode((m) => (m === "gauge" ? "chart" : "gauge"))}
            className="flex items-center gap-1 text-[10px] font-medium text-slate-500 hover:text-slate-300
                       px-2 py-1 rounded-md hover:bg-slate-700/40 transition-all border border-slate-700/30"
            title={viewMode === "gauge" ? "차트 보기" : "게이지 보기"}
          >
            {viewMode === "gauge" ? <ChartLine size={12} /> : <Activity size={12} />}
            <span>{viewMode === "gauge" ? "차트" : "게이지"}</span>
          </button>
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
      </div>

      {/* ── 게이지 뷰 ─ */}
      {viewMode === "gauge" && (
        <>
          <div className="relative flex flex-col items-center -mb-1">
            <SemiCircleGauge value={riskIndex} color={level.gaugeColor} bgColor={level.gaugeBg} />
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
              <div
                className={`h-1.5 w-full rounded-full transition-colors duration-500 ${
                  riskIndex < 110 ? "bg-emerald-500 shadow-sm shadow-emerald-500/30" : "bg-emerald-500/15"
                }`}
              />
              <span className={`text-[10px] ${riskIndex < 110 ? "text-emerald-400 font-semibold" : "text-slate-600"}`}>
                안전 &lt;110
              </span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`h-1.5 w-full rounded-full transition-colors duration-500 ${
                  riskIndex >= 110 && riskIndex < 130 ? "bg-amber-500 shadow-sm shadow-amber-500/30" : "bg-amber-500/15"
                }`}
              />
              <span className={`text-[10px] ${riskIndex >= 110 && riskIndex < 130 ? "text-amber-400 font-semibold" : "text-slate-600"}`}>
                주의 110–130
              </span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`h-1.5 w-full rounded-full transition-colors duration-500 ${
                  riskIndex >= 130 ? "bg-red-500 shadow-sm shadow-red-500/30" : "bg-red-500/15"
                }`}
              />
              <span className={`text-[10px] ${riskIndex >= 130 ? "text-red-400 font-semibold" : "text-slate-600"}`}>
                위험 &gt;130
              </span>
            </div>
          </div>
        </>
      )}

      {/* ── 차트 뷰 ─ */}
      {viewMode === "chart" && (
        <div className="flex flex-col gap-1">
          {/* 현재 지수 요약 */}
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-extrabold tabular-nums ${level.color}`}>
                {riskIndex.toFixed(1)}
              </span>
              <span className="text-[10px] text-slate-500">/ 100 기준</span>
            </div>
            <span className="text-[10px] text-slate-600">{chartData.length}건 이력</span>
          </div>

          {/* Area Chart */}
          {chartData.length >= 2 ? (
            <div className="w-full h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="riskAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={level.chartStroke} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={level.chartStroke} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.3} />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 9, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={[yMin, yMax]}
                    tick={{ fontSize: 9, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <RTooltip content={<ChartTooltip />} />
                  <ReferenceLine y={130} stroke="#ef4444" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: "위험", position: "right", fontSize: 8, fill: "#ef4444" }} />
                  <ReferenceLine y={110} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: "주의", position: "right", fontSize: 8, fill: "#f59e0b" }} />
                  <Area
                    type="monotone"
                    dataKey="리스크"
                    stroke={level.chartStroke}
                    strokeWidth={2}
                    fill="url(#riskAreaGrad)"
                    dot={false}
                    activeDot={{ r: 4, stroke: level.chartStroke, strokeWidth: 2, fill: "#0f172a" }}
                    animationDuration={800}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[120px] rounded-xl bg-slate-800/30 border border-slate-700/20">
              <div className="text-center">
                <TrendingUp size={20} className="mx-auto text-slate-600 mb-1" />
                <p className="text-[11px] text-slate-600">
                  데이터 수집 중…
                  <br />
                  <span className="text-[10px] text-slate-700">2분 간격 자동 저장</span>
                </p>
              </div>
            </div>
          )}

          {/* 범례 */}
          <div className="flex items-center gap-3 justify-center">
            <div className="flex items-center gap-1">
              <div className="w-4 border-t-2 border-dashed border-amber-500 opacity-60" />
              <span className="text-[9px] text-slate-600">주의 110</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 border-t-2 border-dashed border-red-500 opacity-60" />
              <span className="text-[9px] text-slate-600">위험 130</span>
            </div>
          </div>
        </div>
      )}

      {/* ── 세부 지표 카드 ─ */}
      <div className="grid grid-cols-2 gap-2.5 mt-0">
        <div className="rounded-xl bg-slate-800/40 border border-slate-700/30 px-4 py-2.5 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-slate-500">
            <DollarSign size={13} />
            <span className="text-[11px] font-medium">WTI 유가</span>
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
        <div className="rounded-xl bg-slate-800/40 border border-slate-700/30 px-4 py-2.5 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-slate-500">
            <ArrowRightLeft size={13} />
            <span className="text-[11px] font-medium">원/달러 환율</span>
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
    </div>
  );
}
