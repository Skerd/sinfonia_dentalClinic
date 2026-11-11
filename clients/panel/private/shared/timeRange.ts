import {companyToday, formatDate} from "@coreModule/helpers/general/dateTime.ts";

const DAY: Intl.DateTimeFormatOptions = {weekday: "short", day: "numeric", month: "short"};
const TIME: Intl.DateTimeFormatOptions = {hour: "2-digit", minute: "2-digit"};

/**
 * A stretch of time as people say it (UX-08): "Mon 16 Nov, 13:00–17:00" on one day,
 * "Mon 16 Nov, 13:00 – Wed 18 Nov, 09:00" across days. Days are judged in `timeZone`.
 */
export function formatTimeRange(start: string | Date, end: string | Date, timeZone: string): string {
    const from = new Date(start);
    const to = new Date(end);
    const startText = formatDate(from, {timeZone, format: {...DAY, ...TIME}});
    if (companyToday(timeZone, from) === companyToday(timeZone, to)) {
        return `${startText}–${formatDate(to, {timeZone, format: TIME})}`;
    }
    return `${startText} – ${formatDate(to, {timeZone, format: {...DAY, ...TIME}})}`;
}
