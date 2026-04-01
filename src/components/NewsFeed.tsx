"use client";

import { ExternalLink, Clock, Newspaper } from "lucide-react";
import type { NewsItem } from "@/app/api/news/route";

interface NewsFeedProps {
  items: NewsItem[];
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}분 전`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}시간 전`;
  return `${Math.floor(hrs / 24)}일 전`;
}

const TAG_MAP: Record<string, { label: string; color: string }> = {
  유가: { label: "유가", color: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  OPEC: { label: "OPEC", color: "bg-orange-500/15 text-orange-400 border-orange-500/20" },
  환율: { label: "환율", color: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
  정유: { label: "정유", color: "bg-purple-500/15 text-purple-400 border-purple-500/20" },
  중동: { label: "중동", color: "bg-red-500/15 text-red-400 border-red-500/20" },
  에너지: { label: "에너지", color: "bg-green-500/15 text-green-400 border-green-500/20" },
};

function detectTag(title: string): { label: string; color: string } | null {
  for (const [keyword, tag] of Object.entries(TAG_MAP)) {
    if (title.includes(keyword)) return tag;
  }
  if (/원유|WTI|브렌트|배럴/.test(title)) return TAG_MAP["유가"];
  if (/주유소|휘발유|경유/.test(title)) return TAG_MAP["정유"];
  return null;
}

export default function NewsFeed({ items }: NewsFeedProps) {
  return (
    <div className="glass-card px-5 py-3 flex flex-col gap-2 min-h-0 overflow-hidden">
      <div className="widget-header shrink-0">
        <Newspaper size={14} className="text-amber-400" />
        <span>에너지·유가 시장 뉴스</span>
      </div>
      {items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse" />
            <p className="text-sm">뉴스를 불러오는 중...</p>
          </div>
        </div>
      ) : (
        <ul className="space-y-0.5 overflow-y-auto flex-1 min-h-0 pr-1">
          {items.map((item, i) => {
            const tag = detectTag(item.title);
            return (
              <li key={i} className="group">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-3 py-2 rounded-lg hover:bg-slate-800/60 transition-all duration-200 border border-transparent hover:border-slate-700/30"
                >
                  <div className="flex items-start gap-2">
                    <span className="flex-1 text-sm text-slate-300 group-hover:text-white leading-snug transition-colors duration-200">
                      {item.title}
                    </span>
                    <ExternalLink
                      size={13}
                      className="shrink-0 mt-0.5 text-slate-600 group-hover:text-slate-400 transition-colors duration-200"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                    <Clock size={10} />
                    <span>{timeAgo(item.publishedAt)}</span>
                    <span className="text-slate-700">·</span>
                    <span>{item.source}</span>
                    {tag && (
                      <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium border ${tag.color}`}>
                        {tag.label}
                      </span>
                    )}
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
