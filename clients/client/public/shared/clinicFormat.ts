import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import type {ClinicServicePriceType} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicService/clinicService.schema-def.ts";

/** "CHF 120", "from CHF 80", "Price on request" or "Free", as the clinic chose to show it. */
export function priceLabel(
    service: {priceType: ClinicServicePriceType; price?: number},
    formatMoney: (amount: number | undefined) => string,
    resolveLanguageKey: ResolveLanguageKey,
): string {
    switch (service.priceType) {
        case "fixed": return formatMoney(service.price);
        case "from": return `${resolveLanguageKey("priceFrom")} ${formatMoney(service.price)}`;
        case "free": return String(resolveLanguageKey("priceFree"));
        default: return String(resolveLanguageKey("priceOnRequest"));
    }
}

/** `YYYY-MM-DD` of the day `daysAhead` from today, in the browser's calendar (a starting point only). */
export function dateInDays(daysAhead: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** The local date `days` calendar days after `date`. */
export function addDays(date: string, days: number): string {
    const [year, month, day] = date.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

function utcDate(date: string): Date {
    const [year, month, day] = date.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}

/** "Wed 9 Jun" for a local date (no time zone involved). */
export function formatDay(date: string, locale?: string): string {
    return new Intl.DateTimeFormat(locale, {timeZone: "UTC", weekday: "short", day: "numeric", month: "short"}).format(utcDate(date));
}

/** "Tuesday, 27 October" for the hours heading under the day strip. */
export function formatLongDay(date: string, locale?: string): string {
    return new Intl.DateTimeFormat(locale, {timeZone: "UTC", weekday: "long", day: "numeric", month: "long"}).format(utcDate(date));
}

/** "Tue" for a day card. */
export function weekdayShort(date: string, locale?: string): string {
    return new Intl.DateTimeFormat(locale, {timeZone: "UTC", weekday: "short"}).format(utcDate(date));
}

/** "27" for a day card. */
export function dayNumber(date: string): string {
    return String(Number(date.slice(8, 10)));
}

/** An instant as the full local date and time at the clinic. */
export function formatAtClinic(iso: string, timeZone: string, locale?: string): string {
    return new Intl.DateTimeFormat(locale, {timeZone, weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit"}).format(new Date(iso));
}
