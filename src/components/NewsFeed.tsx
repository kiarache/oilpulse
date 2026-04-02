"use client";

import { ExternalLink } from "lucide-react";
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
  유가: { label: "유가", color: "text-[var(--accent-brand)] bg-[var(--accent-brand)]/10" },
  OPEC: { label: "OPEC", color: "text-[var(--accent-brand)] bg-[var(--accent-brand)]/10" },
  환율: { label: "환율", color: "text-sky-400 bg-sky-500/10" },
  정유: { label: "정유", color: "text-violet-400 bg-violet-500/10" },
  중동: { label: "중동", color: "text-[var(--accent-up)] bg-[var(--accent-up)]/10" },
  에너지: { label: "에너지", color: "text-[var(--accent-down)] bg-[var(--accent-down)]/10" },
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
    <div className="card px-4 py-3 flex flex-col gap-2 min-h-0 overflow-hidden">
      <span className="text-xs font-medium text-[var(--text-secondary)] shrink-0">
        에너지·유가 뉴스
      </span>
      {items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[13px] text-[var(--text-muted)]">뉴스를 불러오는 중...</p>
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
                  className="block px-2.5 py-2 rounded hover:bg-[var(--bg-card-alt)] transition-colors duration-150"
                >
                  <div className="flex items-start gap-2">
                    <span className="flex-1 text-[13px] text-[var(--text-secondary)] group-hover:text-white leading-snug transition-colors duration-150">
                      {item.title}
                    </span>
                    <ExternalLink
                      size={12}
                      className="shrink-0 mt-0.5 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[var(--text-muted)]">
                    <span>{timeAgo(item.publishedAt)}</span>
                    <span className="text-[var(--border-muted)]">·</span>
                    <span>{item.source}</span>
                    {tag && (
                      <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${tag.color}`}>
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
