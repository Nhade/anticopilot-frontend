/**
 * Format estimated time from fractional hours into compact display.
 *
 *   0       → ""           (hidden — no estimate available)
 *   0.25    → "15m"
 *   0.5     → "30m"
 *   1       → "1h"
 *   1.5     → "1h 30m"
 *   2       → "2h"
 *   2.25    → "2h 15m"
 */
export function formatEstimatedTime(hours: number | undefined | null): string {
  if (hours == null || hours <= 0 || !Number.isFinite(hours)) {
    return "";
  }
  const totalMinutes = Math.max(1, Math.round(hours * 60));
  if (totalMinutes < 60) {
    return `${totalMinutes}m`;
  }
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
