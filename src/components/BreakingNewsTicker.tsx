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
    <div className="flex items-center overflow-hidden h-9 card">
      <div className="shrink-0 flex items-center gap-1.5 bg-[var(--accent-up)] px-3 h-full">
        <Zap size={11} className="text-white" fill="white" />
        <span className="text-white text-[11px] font-semibold whitespace-nowrap">
          속보
        </span>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[var(--bg-card)] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[var(--bg-card)] to-transparent z-10 pointer-events-none" />
        
        <div className="ticker-track flex items-center gap-0 whitespace-nowrap">
          {repeated.map((item, i) => (
            <span key={i} className="inline-flex items-center text-[13px] text-[var(--text-secondary)]">
              <span className="px-5">{item.title}</span>
              <span className="text-[var(--text-muted)] text-[10px]">·</span>
            </span>
          ))}
        </div>
      </div>

      <style>{`
        .ticker-track {
          animation: ticker-scroll 45s linear infinite;
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
