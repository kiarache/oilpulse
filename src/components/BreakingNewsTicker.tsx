"use client";

import { Zap } from "lucide-react";
import type { NewsItem } from "@/app/api/news/route";

interface BreakingNewsTickerProps {
  items: NewsItem[];
}

export default function BreakingNewsTicker({ items }: BreakingNewsTickerProps) {
  if (items.length === 0) return null;

  // 끊김 없는 루프를 위해 아이템을 3번 반복
  const repeated = [...items, ...items, ...items];

  return (
    <div className="flex items-center rounded-xl overflow-hidden h-10 border border-slate-700/40 bg-slate-900/60 backdrop-blur-md">
      {/* 속보 라벨 */}
      <div className="shrink-0 flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-500 px-5 h-full shadow-lg shadow-red-500/10">
        <Zap size={14} className="text-white" fill="white" />
        <span className="text-white text-xs font-bold tracking-wider whitespace-nowrap">
          속보
        </span>
      </div>

      {/* 흐르는 텍스트 영역 */}
      <div className="flex-1 overflow-hidden relative">
        {/* 좌우 페이드 */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-900/90 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-900/90 to-transparent z-10 pointer-events-none" />
        
        <div className="ticker-track flex items-center gap-0 whitespace-nowrap">
          {repeated.map((item, i) => (
            <span key={i} className="inline-flex items-center text-sm text-slate-300">
              <span className="px-6">{item.title}</span>
              <span className="text-red-500/60 text-xs">◆</span>
            </span>
          ))}
        </div>
      </div>

      <style>{`
        .ticker-track {
          animation: ticker-scroll 40s linear infinite;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}
