import { promises as fs } from "fs";
import path from "path";

export interface RiskHistoryEntry {
  timestamp: string;          // ISO 8601
  riskIndex: number;
  wtiPrice: number;
  exchangeRate: number;
  source: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const HISTORY_FILE = path.join(DATA_DIR, "risk-history.json");
const MAX_ENTRIES = 500; // 최대 보관 건수

/** 데이터 디렉토리 확보 */
async function ensureDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // 이미 존재
  }
}

/** 이력 전체 읽기 */
export async function readRiskHistory(): Promise<RiskHistoryEntry[]> {
  await ensureDir();
  try {
    const raw = await fs.readFile(HISTORY_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** 이력에 새 항목 추가 (중복 방지 — 같은 분 내 기록 무시) */
export async function appendRiskHistory(entry: RiskHistoryEntry): Promise<void> {
  const history = await readRiskHistory();

  // 같은 분(minute) 내 중복 방지
  const entryMin = entry.timestamp.slice(0, 16); // "YYYY-MM-DDTHH:MM"
  const isDuplicate = history.length > 0 && history[history.length - 1].timestamp.slice(0, 16) === entryMin;
  if (isDuplicate) return;

  history.push(entry);

  // 최대 건수 초과 시 오래된 것 제거
  const trimmed = history.length > MAX_ENTRIES ? history.slice(-MAX_ENTRIES) : history;

  await ensureDir();
  await fs.writeFile(HISTORY_FILE, JSON.stringify(trimmed, null, 2), "utf-8");
}

/** 최근 N개 이력 조회 */
export async function getRecentRiskHistory(count = 100): Promise<RiskHistoryEntry[]> {
  const history = await readRiskHistory();
  return history.slice(-count);
}
