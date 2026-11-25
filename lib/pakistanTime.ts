// Helpers for working with dates in the restaurant's local timezone.
// The restaurant is in Islamabad, Pakistan, so all "today" / daily
// grouping uses Asia/Karachi — never UTC and never the server's local time.
// Pakistan does not observe daylight saving time (UTC+05:00 year-round),
// so a PKT day is always exactly 24 hours.

export const PAKISTAN_TIME_ZONE = "Asia/Karachi";

const PKT_OFFSET_MS = 5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** "YYYY-MM-DD" key for the given instant, in Pakistan time. */
export function getPakistanDayKey(date: Date): string {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: PAKISTAN_TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(date);
}

/**
 * The UTC instants bounding a Pakistan day.
 * `daysBack = 0` is the PKT day containing `reference`;
 * `daysBack = 1` is the previous PKT day, and so on.
 * `end` is exclusive (the start of the next PKT day).
 */
export function getPakistanDayRange(
    reference: Date,
    daysBack: number
): { start: Date; end: Date } {
    const [year, month, day] = getPakistanDayKey(reference)
        .split("-")
        .map(Number);
    const todayStartUtc = Date.UTC(year, month - 1, day) - PKT_OFFSET_MS;
    const start = new Date(todayStartUtc - daysBack * DAY_MS);
    const end = new Date(start.getTime() + DAY_MS);
    return { start, end };
}

/** Hour of day (0–23) for the given instant, in Pakistan time. */
export function getPakistanHour(date: Date): number {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: PAKISTAN_TIME_ZONE,
        hour: "numeric",
        hourCycle: "h23",
    }).formatToParts(date);
    return Number(parts.find((part) => part.type === "hour")?.value ?? 0);
}

/** Format a date the way the analytics views do, in Pakistan time. */
export function formatPakistanDate(
    date: Date,
    options: Intl.DateTimeFormatOptions = {}
): string {
    return date.toLocaleDateString("en-PK", {
        timeZone: PAKISTAN_TIME_ZONE,
        month: "short",
        day: "numeric",
        ...options,
    });
}

/** "9 AM" / "2 PM" label for an hour of day (0–23). */
export function formatPakistanHour(hour: number): string {
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12} ${hour < 12 ? "AM" : "PM"}`;
}
