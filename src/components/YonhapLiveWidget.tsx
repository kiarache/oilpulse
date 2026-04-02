"use client";

const YONHAP_VIDEO_ID = "6QZ_qc75ihU";

export default function YonhapLiveWidget() {
  return (
    <div className="card overflow-hidden flex flex-col min-h-0">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-subtle)] shrink-0">
        <span className="text-xs font-medium text-[var(--text-secondary)]">연합뉴스TV</span>
        <span className="inline-flex items-center gap-1.5 text-[11px] text-[var(--accent-up)] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-up)]" />
          LIVE
        </span>
      </div>

      {/* 유튜브 임베드 */}
      <div className="relative flex-1 min-h-0">
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${YONHAP_VIDEO_ID}?autoplay=1&mute=1&rel=0&modestbranding=1`}
          title="연합뉴스TV 실시간 뉴스"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
