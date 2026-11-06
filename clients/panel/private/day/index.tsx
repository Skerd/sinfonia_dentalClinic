import {useEffect, useMemo, useState} from "react";
import {compose} from "redux";
import {IconChevronLeft, IconChevronRight} from "@tabler/icons-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import Forbidden from "@coreModule/components/custom/pages/forbidden.tsx";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {NativeSelect, NativeSelectOption} from "@coreModule/components/ui/native-select.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {SelectResponse} from "armonia/src/modules/core/types/shared.types.ts";
import type {ClinicDayResponse} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/appointment/appointment.dto.ts";

type Day = ClinicDayResponse["data"];

/** Height of one hour on the grid, in pixels. */
const LOCATIONS_REQUEST: HttpRequest = {method: "POST", url: "/api/dentalClinic/clinicLocation/select"};
const DAY_REQUEST: HttpRequest = {method: "POST", url: "/api/dentalClinic/clinicDay/view"};
const HOUR_PX = 64;
const DEFAULT_START_HOUR = 7;
const DEFAULT_END_HOUR = 19;

const STATUS_CLASSES: Record<string, string> = {
    pending: "border-warning bg-warning/15",
    confirmed: "border-primary bg-primary/15",
    completed: "border-success bg-success/15",
    no_show: "border-destructive bg-destructive/15",
};

function todayIso(): string {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function shiftDate(date: string, days: number): string {
    const [year, month, day] = date.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

/** Minutes after local midnight of an instant at the location. */
function minutesAt(iso: string, timeZone: string): number {
    const parts = new Intl.DateTimeFormat("en-GB", {timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23"}).formatToParts(new Date(iso));
    const value = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
    return value("hour") * 60 + value("minute");
}

function hhmm(minutes: number): string {
    return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

/**
 * One location's day: a column per dentist working there, with working hours,
 * time off and appointments, in the location's time zone. A dentist with a
 * linked login sees only their own appointments.
 */
function ClinicDayView({resolveLanguageKey}: WithLanguageType) {
    const {read} = useAccess("appointments");
    const [location, setLocation] = useState("");
    const [date, setDate] = useState(todayIso);
    const locationsRequest = useHttpRequest<SelectResponse>(LOCATIONS_REQUEST, {page: 1, limit: 50}, 1, true, {
        success: (response) => setLocation((current) => current || String(response.data[0]?.value ?? "")),
    });
    const locations = useMemo(
        () => (locationsRequest.data?.data ?? []).map(({value, label}) => ({value: String(value), label: String(label)})),
        [locationsRequest.data],
    );
    const [dayCount, setDayCount] = useState(0);
    useEffect(() => {
        if (location && date) setDayCount((count) => count + 1);
    }, [location, date]);
    const dayRequest = useHttpRequest<ClinicDayResponse>(DAY_REQUEST, {location, date}, dayCount);
    const day: Day | null = dayRequest.data?.data ?? null;
    const loading = dayRequest.loading;
    const requestError = dayRequest.error ?? locationsRequest.error;
    const error = requestError ? requestError.message || requestError.error || String(resolveLanguageKey("loadError")) : null;

    const range = useMemo(() => {
        if (!day) return {start: DEFAULT_START_HOUR * 60, end: DEFAULT_END_HOUR * 60};
        const edges = [
            ...day.practitioners.flatMap((p) => p.working.flatMap(({start, end}) => [minutesAt(start, day.timezone), minutesAt(end, day.timezone) || 24 * 60])),
            ...day.appointments.flatMap(({startAt, endAt}) => [minutesAt(startAt, day.timezone), minutesAt(endAt, day.timezone)]),
        ];
        if (!edges.length) return {start: DEFAULT_START_HOUR * 60, end: DEFAULT_END_HOUR * 60};
        return {start: Math.floor(Math.min(...edges) / 60) * 60, end: Math.ceil(Math.max(...edges) / 60) * 60};
    }, [day]);

    if (read && !read.startAt) return <Forbidden />;

    const top = (minutes: number) => ((minutes - range.start) / 60) * HOUR_PX;
    const height = (from: number, to: number) => Math.max(((to - from) / 60) * HOUR_PX, 18);
    const hours = Array.from({length: (range.end - range.start) / 60 + 1}, (_, i) => range.start + i * 60);
    const span = (iso: {start: string; end: string}) => {
        const from = Math.max(minutesAt(iso.start, day!.timezone), range.start);
        const to = Math.min(minutesAt(iso.end, day!.timezone) || 24 * 60, range.end);
        return {top: top(from), height: height(from, to)};
    };

    return (
        <div className="flex flex-col gap-4 p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold">{resolveLanguageKey("title")}</h2>
                    <p className="text-sm text-muted-foreground">{resolveLanguageKey("description")}{day ? ` · ${day.timezone}` : ""}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <NativeSelect aria-label={String(resolveLanguageKey("location"))} value={location} onChange={(e) => setLocation(e.target.value)}>
                        {locations.map((option) => <NativeSelectOption key={option.value} value={option.value}>{option.label}</NativeSelectOption>)}
                    </NativeSelect>
                    <Button variant="outline" size="icon" aria-label={String(resolveLanguageKey("previousDay"))} onClick={() => setDate((d) => shiftDate(d, -1))}>
                        <IconChevronLeft size={16} />
                    </Button>
                    <Input type="date" className="w-40" aria-label={String(resolveLanguageKey("date"))} value={date} onChange={(e) => e.target.value && setDate(e.target.value)} />
                    <Button variant="outline" size="icon" aria-label={String(resolveLanguageKey("nextDay"))} onClick={() => setDate((d) => shiftDate(d, 1))}>
                        <IconChevronRight size={16} />
                    </Button>
                    <Button variant="outline" onClick={() => setDate(todayIso())}>{resolveLanguageKey("today")}</Button>
                </div>
            </div>

            {error ? <p className="text-destructive" role="alert">{error}</p> : null}
            {!locations.length && !error ? <p className="text-muted-foreground">{resolveLanguageKey("noLocations")}</p> : null}
            {loading && !day ? <Loader /> : null}
            {day && !day.practitioners.length ? <p className="text-muted-foreground">{resolveLanguageKey("noPractitioners")}</p> : null}

            {day && day.practitioners.length ? (
                <div className={cn("overflow-x-auto rounded-md border", loading && "opacity-60")}>
                    <div className="flex min-w-fit">
                        <div className="sticky left-0 z-10 w-16 shrink-0 border-r bg-background">
                            <div className="h-12 border-b" />
                            <div className="relative" style={{height: top(range.end)}}>
                                {hours.map((minutes) => (
                                    <span key={minutes} className="absolute right-2 -translate-y-1/2 text-xs text-muted-foreground" style={{top: top(minutes)}}>
                                        {hhmm(minutes)}
                                    </span>
                                ))}
                            </div>
                        </div>
                        {day.practitioners.map((practitioner) => (
                            <div key={practitioner._id} className="w-56 shrink-0 border-r last:border-r-0">
                                <div className="flex h-12 flex-col justify-center border-b px-3">
                                    <p className="truncate text-sm font-medium">{practitioner.displayName}</p>
                                    {practitioner.title ? <p className="truncate text-xs text-muted-foreground">{practitioner.title}</p> : null}
                                </div>
                                <div className="relative bg-muted/40" style={{height: top(range.end)}}>
                                    {hours.map((minutes) => <div key={minutes} className="absolute inset-x-0 border-t border-border/50" style={{top: top(minutes)}} />)}
                                    {practitioner.working.map((interval) => (
                                        <div key={interval.start} className="absolute inset-x-0 bg-background" style={span(interval)} />
                                    ))}
                                    {practitioner.timeOff.map((interval) => (
                                        <div key={interval.start} className="absolute inset-x-0 flex items-start bg-muted px-2 py-1 text-xs text-muted-foreground" style={span(interval)}>
                                            {resolveLanguageKey("timeOff")}
                                        </div>
                                    ))}
                                    {day.appointments.filter((a) => a.practitionerId === practitioner._id).map((appointment) => {
                                        const box = span({start: appointment.startAt, end: appointment.endAt});
                                        const from = minutesAt(appointment.startAt, day.timezone);
                                        const to = minutesAt(appointment.endAt, day.timezone);
                                        return (
                                            <div
                                                key={appointment._id}
                                                className={cn("absolute inset-x-1 overflow-hidden rounded border-l-4 px-2 py-1 text-xs", STATUS_CLASSES[appointment.status])}
                                                style={box}
                                                title={`${appointment.number} · ${resolveLanguageKey(`status.${appointment.status}`)}`}
                                            >
                                                <p className="font-medium">{hhmm(from)}–{hhmm(to)} {appointment.patientName ?? appointment.number}</p>
                                                <p className="truncate text-muted-foreground">{appointment.serviceName}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/day/index.tsx"),
    withDebug(true, true, "appointments"),
)(ClinicDayView);
