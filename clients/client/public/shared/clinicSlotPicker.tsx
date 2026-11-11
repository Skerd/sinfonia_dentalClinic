import {useEffect, useState} from "react";
import {compose} from "redux";
import {IconChevronLeft, IconChevronRight} from "@tabler/icons-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import {Button} from "@coreModule/components/ui/button.tsx";
import type {ClinicSlotsFormType} from "armonia/src/modules/dentalClinic/api/dentalClinic/public/clinicStorefront/clinicStorefront.forms.ts";
import type {ClinicSlot, ClinicSlotsResponse} from "armonia/src/modules/dentalClinic/api/dentalClinic/public/clinicStorefront/clinicStorefront.response.types.ts";
import {addCalendarDays, companyToday} from "@coreModule/helpers/general/dateTime.ts";
import {dayNumber, formatDay, formatLongDay, weekdayShort} from "./clinicFormat.ts";
import {useClinicConfig} from "./clinicConfigContext.tsx";

const DAYS_SHOWN = 7;
const SLOTS_REQUEST: HttpRequest = {method: "POST", url: "/api/dentalClinic/clinicStorefront/slots"};
const PERIODS = ["morning", "afternoon", "evening"] as const;

export type PickedSlot = {date: string; time: string};

type Props = WithLanguageType & {
    service: string;
    location: string;
    /** Omitted for "anyone". */
    practitioner?: string;
    selected?: PickedSlot | null;
    onPick: (slot: PickedSlot) => void;
    /** Bound hours list for the treatment column. */
    compact?: boolean;
};

function periodOf(time: string): (typeof PERIODS)[number] {
    const hour = Number(time.slice(0, 2));
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
}

/** A week of free days; pick a day, then an hour. Times are local to the clinic. */
function ClinicSlotPicker({service, location, practitioner, selected, onPick, compact, resolveLanguageKey, languageCode}: Props) {
    // "Today" is the clinic location's calendar day, as the server counts free days, not the patient's browser day (GLB-09).
    const {config} = useClinicConfig();
    const locationTimeZone = config?.locations.find((candidate) => candidate._id === location)?.timezone ?? "UTC";
    const [fromDate, setFromDate] = useState(() => selected?.date ?? companyToday(locationTimeZone));
    const [pickedDate, setPickedDate] = useState(selected?.date ?? "");

    const [slotsCount, setSlotsCount] = useState(0);
    useEffect(() => {
        setSlotsCount((count) => count + 1);
    }, [service, location, practitioner, fromDate]);
    const slotsBody: ClinicSlotsFormType = {service, location, practitioner, fromDate, days: DAYS_SHOWN};
    const slots = useHttpRequest<ClinicSlotsResponse>(SLOTS_REQUEST, slotsBody, slotsCount, true, {
        success: (response) => {
            const next = response.data.days;
            setPickedDate(selected && next.some((day) => day.date === selected.date && day.slots.length)
                ? selected.date
                : next.find((day) => day.slots.length)?.date ?? "");
        },
    });
    const days = slots.loading || slots.error ? null : slots.data?.data.days ?? null;
    const timezone = slots.data?.data.timezone ?? "";
    const error = slots.error ? slots.error.message || slots.error.error || String(resolveLanguageKey("loadFailed")) : null;

    const today = companyToday(timezone || locationTimeZone);
    const picked = days?.find((day) => day.date === pickedDate);
    const grouped = PERIODS.map((period) => ({
        period,
        slots: (picked?.slots ?? []).filter((slot) => periodOf(slot.time) === period),
    })).filter((group) => group.slots.length);

    const pickDay = (date: string) => setPickedDate(date);

    const hours = days && picked && picked.slots.length ? (
        <div className={cn("flex flex-col gap-4", compact ? "p-1" : undefined)} aria-live="polite">
            <div className="flex flex-col gap-0.5">
                <p className="text-sm font-semibold">{formatLongDay(picked.date, languageCode)}</p>
                <p className="text-xs text-muted-foreground">{resolveLanguageKey("pickTime")}</p>
            </div>
            {grouped.map((group) => (
                <div key={group.period} className="flex flex-col gap-2">
                    <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">{resolveLanguageKey(`period.${group.period}`)}</p>
                    <div className={cn(compact ? "grid grid-cols-3 gap-1.5" : "flex flex-wrap gap-2")}>
                        {group.slots.map((slot: ClinicSlot) => {
                            const active = selected?.date === picked.date && selected.time === slot.time;
                            return (
                                <Button
                                    key={slot.startAt}
                                    type="button"
                                    variant="bare"
                                    aria-pressed={active}
                                    onClick={() => onPick({date: picked.date, time: slot.time})}
                                    className={cn(
                                        "tabular-nums transition-colors",
                                        compact ? "rounded-lg border px-2 py-1.5 text-xs" : "rounded-full border px-3.5 py-2 text-sm",
                                        active
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "border-border bg-card hover:border-foreground",
                                    )}
                                >
                                    {slot.time}
                                </Button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    ) : null;

    return (
        <div className={cn("flex flex-col", compact ? "gap-4" : "gap-5")}>
            <div className="flex items-center justify-between gap-3">
                <Button variant="ghost" size="icon" type="button" disabled={fromDate <= today} onClick={() => setFromDate((d) => addCalendarDays(d, -DAYS_SHOWN))} aria-label={String(resolveLanguageKey("earlier"))}>
                    <IconChevronLeft size={18} />
                </Button>
                <p className="min-w-0 text-center text-xs font-medium tracking-wide text-muted-foreground">
                    {formatDay(fromDate, languageCode)} – {formatDay(addCalendarDays(fromDate, DAYS_SHOWN - 1), languageCode)}
                    {timezone ? ` · ${resolveLanguageKey("localTime")}` : ""}
                </p>
                <Button variant="ghost" size="icon" type="button" onClick={() => setFromDate((d) => addCalendarDays(d, DAYS_SHOWN))} aria-label={String(resolveLanguageKey("later"))}>
                    <IconChevronRight size={18} />
                </Button>
            </div>

            {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}

            {!days && !error ? (
                <div className="grid grid-cols-7 gap-1.5" aria-hidden>
                    {Array.from({length: DAYS_SHOWN}, (_, index) => (
                        <div key={index} className={cn("animate-pulse rounded-2xl bg-muted", compact ? "h-14" : "h-[4.5rem]")} />
                    ))}
                </div>
            ) : null}

            {days ? (
                <div className="grid grid-cols-7 gap-1.5" role="listbox" aria-label={String(resolveLanguageKey("chooseDay"))}>
                    {days.map((day) => {
                        const free = day.slots.length;
                        const active = day.date === pickedDate;
                        // A greyed day says why: nobody works then, or every time is taken (or already past).
                        const why = String(resolveLanguageKey(day.closed ? "closed" : "fullyBooked"));
                        return (
                            <Button
                                key={day.date}
                                type="button"
                                variant="bare"
                                role="option"
                                disabled={!free}
                                aria-selected={active}
                                aria-label={`${formatDay(day.date, languageCode)} · ${free ? resolveLanguageKey("timesCount").replace("{count}", String(free)) : why}`}
                                title={free ? undefined : why}
                                onClick={() => pickDay(day.date)}
                                className={cn(
                                    "flex flex-col items-center justify-center rounded-2xl px-1 text-center transition-colors",
                                    compact ? "min-h-14 gap-0.5 py-1.5" : "min-h-[4.5rem] gap-1 py-2.5",
                                    active && "bg-primary text-primary-foreground shadow-sm",
                                    !active && free && "bg-muted/70 hover:bg-muted",
                                    !free && "cursor-not-allowed text-muted-foreground/40 disabled:pointer-events-auto disabled:opacity-100",
                                )}
                            >
                                <span className={cn("text-[10px] font-semibold tracking-[0.14em] uppercase", active ? "text-primary-foreground/80" : "text-muted-foreground")}>
                                    {weekdayShort(day.date, languageCode)}
                                </span>
                                <span className={cn("font-display font-semibold tabular-nums", compact ? "text-base leading-none" : "text-lg leading-none")}>{dayNumber(day.date)}</span>
                                {compact ? null : (
                                    <span className={cn("max-w-full truncate px-0.5 text-[10px] leading-tight", active ? "text-primary-foreground/80" : "text-muted-foreground")}>
                                        {free ? String(resolveLanguageKey("timesCount")).replace("{count}", String(free)) : why}
                                    </span>
                                )}
                            </Button>
                        );
                    })}
                </div>
            ) : null}

            {/* The times open inline under the days, in the page's flow (not over the footer). */}
            {hours}

            {days && !days.some((day) => day.slots.length) ? (
                <p className="text-sm text-muted-foreground">{resolveLanguageKey("noneThisWeek")}</p>
            ) : null}
        </div>
    );
}

export default compose(withLanguage("src/modules/dentalClinic/clients/client/public/shared/clinicSlotPicker.tsx"))(ClinicSlotPicker);
