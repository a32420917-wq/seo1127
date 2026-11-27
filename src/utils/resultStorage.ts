import {AxisScore} from '../components/ResultView';
import {MBTI_PROFILES} from '../data/mbtiData';

export interface SavedTestResult {
  code: string;
  axisScores: AxisScore[];
  savedAt: string;
}

const LATEST_RESULT_KEY = 'senior_mbti_latest_result_v1';
const HISTORY_LIST_KEY = 'senior_mbti_history_v1';

export function saveTestResult(result: SavedTestResult): void {
  try {
    localStorage.setItem(LATEST_RESULT_KEY, JSON.stringify(result));

    const existing = loadTestHistory();
    const updated = [result, ...existing].slice(0, 5);
    localStorage.setItem(HISTORY_LIST_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota or private browsing errors gracefully
  }
}

export function loadSavedTestResult(): SavedTestResult | null {
  try {
    const raw = localStorage.getItem(LATEST_RESULT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedTestResult;
    if (!parsed || typeof parsed.code !== 'string' || !MBTI_PROFILES[parsed.code]) {
      return null;
    }
    if (!Array.isArray(parsed.axisScores)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function loadTestHistory(): SavedTestResult[] {
  try {
    const raw = localStorage.getItem(HISTORY_LIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedTestResult[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item &&
        typeof item.code === 'string' &&
        Boolean(MBTI_PROFILES[item.code]) &&
        Array.isArray(item.axisScores)
    );
  } catch {
    return [];
  }
}

export function clearSavedTestResults(): void {
  try {
    localStorage.removeItem(LATEST_RESULT_KEY);
    localStorage.removeItem(HISTORY_LIST_KEY);
  } catch {
    // Ignore errors
  }
}

export function formatKoreanDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return '';
  }
}
