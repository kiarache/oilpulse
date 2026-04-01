"use client";

import { Tv } from "lucide-react";

const YONHAP_VIDEO_ID = "6QZ_qc75ihU";

export default function YonhapLiveWidget() {
  return (
    <div className="glass-card overflow-hidden flex flex-col min-h-0">
      {/* 헤더 */}
      <div className="flex items-center gap-2 px-5 py-2.5 border-b border-slate-700/40 shrink-0">
        <div className="w-6 h-6 rounded-md bg-red-500/15 flex items-center justify-center">
          <Tv size={12} className="text-red-400" />
        </div>
        <span className="text-xs text-slate-300 font-semibold">연합뉴스TV 실시간</span>
        <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-red-400 font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400" />
          </span>
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
