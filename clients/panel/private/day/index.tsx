import {useCallback, useEffect, useMemo, useState, type DragEvent, type MouseEvent} from "react";
import {compose} from "redux";
import {useNavigate} from "react-router-dom";
import {toast} from "sonner";
import {IconChevronLeft, IconChevronRight} from "@tabler/icons-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {useCompanyTimeZone} from "@coreModule/helpers/hooks/useCompanyTimeZone.ts";
import {addCalendarDays, companyToday} from "@coreModule/helpers/general/dateTime.ts";
import {handleError} from "@coreModule/helpers/general/errors.ts";
import Forbidden from "@coreModule/components/custom/pages/forbidden.tsx";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {DateInput} from "@coreModule/components/custom/inputs/dateInput.tsx";
import {NativeSelect, NativeSelectOption} from "@coreModule/components/ui/native-select.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {toneClass} from "@coreModule/components/entityPage/list/table/columnConfigToColumnDef.tsx";
import {useTableConfig} from "@coreModule/helpers/hooks/useTableConfig.ts";
import type {SelectResponse} from "armonia/src/modules/core/types/shared.types.ts";
import type {ClinicDayAppointment, ClinicDayLocation, ClinicDayResponse} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/appointment/appointment.dto.ts";
import type {RescheduleAppointmentFormType} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/appointment/appointment.forms.ts";
import AppointmentSheetView from "@dentalClinicModule/clients/panel/private/appointments/center/sheetView/appointmentSheetView.tsx";
import {appointmentCreatePath} from "@dentalClinicModule/clients/panel/private/appointments/appointmentPaths.ts";

type Interval = {start: string; end: string};

const LOCATIONS_REQUEST: HttpRequest = {method: "POST", url: "/api/dentalClinic/clinicLocation/select"};
const DAY_REQUEST: HttpRequest = {method: "POST", url: "/api/dentalClinic/clinicDay/view"};
const RESCHEDULE_REQUEST: HttpRequest = {method: "POST", url: "/api/dentalClinic/appointment/reschedule"};
/** Height of one hour on the grid, in pixels. */
const HOUR_PX = 64;
const DEFAULT_START_HOUR = 8;
const DEFAULT_END_HOUR = 18;
const DAY_MINUTES = 24 * 60;
/** Only appointments still ahead of the patient can be moved (the reschedule action's own rule). */
const MOVABLE: ClinicDayAppointment["status"][] = ["pending", "confirmed"];


/** Minutes after local midnight of an instant at the location. */
function minutesAt(iso: string, timeZone: string): number {
    const parts = new Intl.DateTimeFormat("en-GB", {timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23"}).formatToParts(new Date(iso));
    const value = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
    return value("hour") * 60 + value("minute");
}

function hhmm(minutes: number): string {
    return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

/** An interval's end in minutes, midnight counting as the end of the day. */
const endMinutes = (iso: string, timeZone: string) => minutesAt(iso, timeZone) || DAY_MINUTES;

type Dragging = {id: string; locationId: string; grabMinutes: number};
/** Where a dragged appointment would land: the column under the pointer and the snapped start. */
type DropTarget = {locationId: string; practitionerId: string; minutes: number};
/** What the day view can already tell about a landing spot; the server's rules (buffers, notice) still decide. */
type DropVerdict = "free" | "past" | "outside" | "timeOff" | "overlap";

const MINUTE_MS = 60_000;
/** A transparent 1×1 image: the browser's own drag ghost would cover the landing preview, which is all the drag needs to show. */
const EMPTY_DRAG_IMAGE = typeof Image === "undefined" ? null : Object.assign(new Image(), {src: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"});
const overlapsMs = (a: {start: number; end: number}, b: {start: number; end: number}) => a.start < b.end && b.start < a.end;
const msOf = (interval: Interval) => ({start: Date.parse(interval.start), end: Date.parse(interval.end)});

/**
 * The clinic's day: a column per dentist at each location, with working hours, time off and appointments, each
 * location in its own time zone. Click an appointment to open it, click free working time to book there, drag an
 * appointment to move it (snapped to the clinic's booking grid; the server's free-time rules decide). A dentist with
 * a linked login sees only their own appointments.
 */
function ClinicDayView({resolveLanguageKey}: WithLanguageType) {
    const {read, write, create} = useAccess("appointments");
    const navigate = useNavigate();
    const companyZone = useCompanyTimeZone();
    const [location, setLocation] = useState("");
    const [date, setDate] = useState(() => companyToday(companyZone));
    const [openId, setOpenId] = useState<string | null>(null);
    const [dragging, setDragging] = useState<Dragging | null>(null);
    const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
    // Blocks wear the status tones the appointment badges and table use (UX-02).
    const statusTones = useTableConfig("appointments").columns.find((column) => column.id === "status")?.meta?.enumTones;

    const locationsRequest = useHttpRequest<SelectResponse>(LOCATIONS_REQUEST, {page: 1, limit: 50}, 1, true);
    const locations = useMemo(
        () => (locationsRequest.data?.data ?? []).map(({value, label}) => ({value: String(value), label: String(label)})),
        [locationsRequest.data],
    );

    const [dayCount, setDayCount] = useState(0);
    const load = useCallback(() => setDayCount((count) => count + 1), []);
    useEffect(() => {
        if (date) load();
    }, [location, date, load]);
    const dayRequest = useHttpRequest<ClinicDayResponse>(DAY_REQUEST, {date, ...(location ? {location} : {})}, dayCount);
    const day = dayRequest.data?.data ?? null;
    const loading = dayRequest.loading;
    const requestError = dayRequest.error ?? locationsRequest.error;
    const error = requestError ? requestError.message || requestError.error || String(resolveLanguageKey("loadError")) : null;

    // A dropped block is rescheduled; the toast names the new time, and a refusal (busy, outside hours) snaps it back.
    const [move, setMove] = useState<{payload: RescheduleAppointmentFormType | Record<string, never>; message: string; count: number}>({payload: {}, message: "", count: 0});
    useHttpRequest(RESCHEDULE_REQUEST, move.payload, move.count, true, {
        success: () => {
            toast.success(move.message);
            load();
        },
        error: (failure) => {
            handleError(failure, {context: "ClinicDayReschedule"});
            load();
        },
    });

    const range = useMemo(() => {
        if (!day) return {start: DEFAULT_START_HOUR * 60, end: DEFAULT_END_HOUR * 60};
        const zoneOf = new Map(day.locations.map((entry) => [entry._id, entry.timezone]));
        const edges = [
            ...day.locations.flatMap((entry) => [
                ...entry.opening.flatMap(({start, end}) => [minutesAt(start, entry.timezone), endMinutes(end, entry.timezone)]),
                ...entry.practitioners.flatMap((p) => p.working.flatMap(({start, end}) => [minutesAt(start, entry.timezone), endMinutes(end, entry.timezone)])),
            ]),
            ...day.appointments.flatMap(({startAt, endAt, locationId}) => {
                const zone = zoneOf.get(locationId) ?? companyZone;
                return [minutesAt(startAt, zone), endMinutes(endAt, zone)];
            }),
        ];
        if (!edges.length) return {start: DEFAULT_START_HOUR * 60, end: DEFAULT_END_HOUR * 60};
        return {start: Math.floor(Math.min(...edges) / 60) * 60, end: Math.ceil(Math.max(...edges) / 60) * 60};
    }, [day, companyZone]);

    if (read && !read.startAt) return <Forbidden />;

    const step = day?.slotIntervalMinutes ?? 15;
    const top = (minutes: number) => ((minutes - range.start) / 60) * HOUR_PX;
    const height = (from: number, to: number) => Math.max(((to - from) / 60) * HOUR_PX, 18);
    const hours = Array.from({length: (range.end - range.start) / 60 + 1}, (_, i) => range.start + i * 60);
    const span = (interval: Interval, timeZone: string) => {
        const from = Math.max(minutesAt(interval.start, timeZone), range.start);
        const to = Math.min(endMinutes(interval.end, timeZone), range.end);
        return {top: top(from), height: height(from, to)};
    };
    /** Minutes of the day at a pointer position inside a column, snapped to the booking grid. */
    const minutesUnder = (event: MouseEvent<HTMLElement> | DragEvent<HTMLElement>, column: HTMLElement, offset = 0) => {
        const y = event.clientY - column.getBoundingClientRect().top;
        const raw = range.start + (y / HOUR_PX) * 60 - offset;
        return Math.min(Math.max(Math.round(raw / step) * step, 0), DAY_MINUTES - step);
    };

    const canMove = !!write?.status;
    const showLocationNames = (day?.locations.length ?? 0) > 1;
    const counts = (day?.appointments ?? []).reduce<Record<string, number>>((totals, appointment) => ({...totals, [appointment.status]: (totals[appointment.status] ?? 0) + 1}), {});

    const bookAt = (event: MouseEvent<HTMLElement>, entry: ClinicDayLocation, practitionerId: string) => {
        if (!create) return;
        const column = event.currentTarget.parentElement;
        if (!column) return;
        // Book at the slot under the pointer, not its nearest edge.
        const minutes = Math.floor((range.start + ((event.clientY - column.getBoundingClientRect().top) / HOUR_PX) * 60) / step) * step;
        navigate(appointmentCreatePath({date, time: hhmm(minutes), practitioner: practitionerId, location: entry._id}));
    };

    /** The dragged appointment at `minutes` with that dentist: inside their working hours, clear of time off and of their other appointments. */
    const verdictOf = (entry: ClinicDayLocation, practitionerId: string, appointment: ClinicDayAppointment, minutes: number): DropVerdict => {
        const shift = (minutes - minutesAt(appointment.startAt, entry.timezone)) * MINUTE_MS;
        const landing = {start: Date.parse(appointment.startAt) + shift, end: Date.parse(appointment.endAt) + shift};
        // The server books nothing that has already started.
        if (landing.start < Date.now()) return "past";
        const practitioner = entry.practitioners.find((p) => p._id === practitionerId);
        if (!practitioner?.working.some((interval) => {
            const work = msOf(interval);
            return work.start <= landing.start && landing.end <= work.end;
        })) return "outside";
        if (practitioner.timeOff.some((interval) => overlapsMs(msOf(interval), landing))) return "timeOff";
        const busy = (day?.appointments ?? []).some((other) => other._id !== appointment._id && other.practitionerId === practitionerId
            && overlapsMs({start: Date.parse(other.startAt), end: Date.parse(other.endAt)}, landing));
        return busy ? "overlap" : "free";
    };

    const dragOver = (event: DragEvent<HTMLDivElement>, entry: ClinicDayLocation, practitionerId: string) => {
        // Another location is no drop target: the browser shows "not allowed" there.
        if (!dragging || dragging.locationId !== entry._id) return;
        event.preventDefault();
        const minutes = minutesUnder(event, event.currentTarget, dragging.grabMinutes);
        setDropTarget((current) => current && current.practitionerId === practitionerId && current.locationId === entry._id && current.minutes === minutes
            ? current
            : {locationId: entry._id, practitionerId, minutes});
    };

    const endDrag = () => {
        setDragging(null);
        setDropTarget(null);
    };

    const slotLines = Array.from({length: Math.floor((range.end - range.start) / step)}, (_, i) => range.start + i * step).filter((minutes) => minutes % 60 !== 0);

    /** Where the dragged appointment would land in this column, green when it fits, red with the reason when it does not. */
    const dropPreview = (entry: ClinicDayLocation, practitionerId: string) => {
        if (!dragging || !dropTarget || dropTarget.locationId !== entry._id || dropTarget.practitionerId !== practitionerId) return null;
        const appointment = day?.appointments.find((row) => row._id === dragging.id);
        if (!appointment) return null;
        const length = endMinutes(appointment.endAt, entry.timezone) - minutesAt(appointment.startAt, entry.timezone);
        const from = dropTarget.minutes;
        const verdict = verdictOf(entry, practitionerId, appointment, from);
        return (
            <div
                className={cn(
                    "pointer-events-none absolute inset-x-1 z-20 flex flex-wrap content-start gap-x-1.5 overflow-hidden rounded border-2 border-dashed px-2 py-1 text-xs font-medium shadow-lg",
                    verdict === "free"
                        ? "border-emerald-500 bg-background text-emerald-700 ring-4 ring-emerald-500/20 dark:text-emerald-300"
                        : "border-destructive bg-background text-destructive ring-4 ring-destructive/20",
                )}
                style={{top: top(from), height: height(from, from + length)}}
                role="status"
            >
                <span className="tabular-nums">{hhmm(from)}–{hhmm(from + length)}</span>
                <span>· {resolveLanguageKey(`drop.${verdict}`)}</span>
            </div>
        );
    };

    const drop = (event: DragEvent<HTMLDivElement>, entry: ClinicDayLocation, practitionerId: string) => {
        event.preventDefault();
        const moving = dragging;
        endDrag();
        // An appointment stays at its location: the reschedule action moves the time and the dentist only.
        if (!moving || moving.locationId !== entry._id) return;
        const appointment = day?.appointments.find((row) => row._id === moving.id);
        if (!appointment) return;
        const minutes = minutesUnder(event, event.currentTarget, moving.grabMinutes);
        if (minutes === minutesAt(appointment.startAt, entry.timezone) && practitionerId === appointment.practitionerId) return;
        // A spot the preview already showed as taken is not sent; the reason is the one the preview gave.
        const verdict = verdictOf(entry, practitionerId, appointment, minutes);
        if (verdict !== "free") {
            toast.error(String(resolveLanguageKey(`drop.${verdict}`)));
            return;
        }
        const dentist = entry.practitioners.find((p) => p._id === practitionerId)?.displayName ?? "";
        setMove((current) => ({
            payload: {_id: appointment._id, date, time: hhmm(minutes), practitioner: practitionerId},
            message: String(resolveLanguageKey("moved")).replace("{number}", appointment.patientName ?? appointment.number).replace("{time}", hhmm(minutes)).replace("{dentist}", dentist),
            count: current.count + 1,
        }));
    };

    return (
        <div className="flex flex-col gap-4 p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold">{resolveLanguageKey("title")}</h2>
                    <p className="text-sm text-muted-foreground">{resolveLanguageKey("description")}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <NativeSelect aria-label={String(resolveLanguageKey("location"))} value={location} onChange={(e) => setLocation(e.target.value)}>
                        <NativeSelectOption value="">{resolveLanguageKey("allLocations")}</NativeSelectOption>
                        {locations.map((option) => <NativeSelectOption key={option.value} value={option.value}>{option.label}</NativeSelectOption>)}
                    </NativeSelect>
                    <Button variant="outline" size="icon" aria-label={String(resolveLanguageKey("previousDay"))} onClick={() => setDate((d) => addCalendarDays(d, -1))}>
                        <IconChevronLeft size={16} />
                    </Button>
                    <DateInput
                        aria-label={String(resolveLanguageKey("date"))}
                        valueFormat="YYYY-MM-DD"
                        value={date}
                        onChange={(value) => value && setDate(value)}
                        clearable={false}
                        className="w-56"
                    />
                    <Button variant="outline" size="icon" aria-label={String(resolveLanguageKey("nextDay"))} onClick={() => setDate((d) => addCalendarDays(d, 1))}>
                        <IconChevronRight size={16} />
                    </Button>
                    <Button variant="outline" onClick={() => setDate(companyToday(companyZone))}>{resolveLanguageKey("today")}</Button>
                </div>
            </div>

            {day && day.appointments.length ? (
                <p className="text-sm text-muted-foreground">
                    {String(resolveLanguageKey("summary")).replace("{count}", String(day.appointments.length))}
                    {Object.entries(counts).map(([status, count]) => ` · ${count} ${String(resolveLanguageKey(`status.${status}`)).toLowerCase()}`).join("")}
                </p>
            ) : null}
            {error ? <p className="text-destructive" role="alert">{error}</p> : null}
            {locationsRequest.data && !locations.length && !error ? <p className="text-muted-foreground">{resolveLanguageKey("noLocations")}</p> : null}
            {loading && !day ? <Loader /> : null}
            {day && locations.length && !day.locations.some((entry) => entry.practitioners.length) ? <p className="text-muted-foreground">{resolveLanguageKey("noPractitioners")}</p> : null}

            {day && day.locations.some((entry) => entry.practitioners.length) ? (
                <div className={cn("overflow-x-auto rounded-md border", loading && "opacity-60")}>
                    <div className="flex min-w-fit">
                        <div className="sticky left-0 z-20 w-16 shrink-0 border-r bg-background">
                            <div className={cn("border-b", showLocationNames ? "h-20" : "h-12")} />
                            <div className="relative" style={{height: top(range.end)}}>
                                {hours.map((minutes) => (
                                    <span key={minutes} className="absolute right-2 -translate-y-1/2 text-xs text-muted-foreground" style={{top: top(minutes)}}>
                                        {hhmm(minutes)}
                                    </span>
                                ))}
                            </div>
                        </div>
                        {day.locations.filter((entry) => entry.practitioners.length).map((entry) => {
                            const isToday = date === companyToday(entry.timezone);
                            const now = isToday ? minutesAt(new Date().toISOString(), entry.timezone) : null;
                            return (
                                <div
                                    key={entry._id}
                                    // A drag stays at its location: the others fade while it lasts.
                                    className={cn("flex min-w-fit flex-1 flex-col border-r transition-opacity last:border-r-0", dragging && dragging.locationId !== entry._id && "opacity-40")}
                                >
                                    {showLocationNames ? (
                                        <div className="flex h-8 items-center border-b bg-muted/30 px-3 text-xs font-medium text-muted-foreground">{entry.name}</div>
                                    ) : null}
                                    <div className="flex flex-1">
                                        {entry.practitioners.map((practitioner) => (
                                            <div key={practitioner._id} className="min-w-48 flex-1 border-r last:border-r-0">
                                                <div className="flex h-12 flex-col justify-center border-b px-3">
                                                    <p className="truncate text-sm font-medium">{practitioner.displayName}</p>
                                                    {practitioner.title ? <p className="truncate text-xs text-muted-foreground">{practitioner.title}</p> : null}
                                                </div>
                                                <div
                                                    className="relative bg-muted/40"
                                                    style={{height: top(range.end)}}
                                                    onDragOver={(event) => dragOver(event, entry, practitioner._id)}
                                                    onDragLeave={(event) => {
                                                        if (!(event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget))) setDropTarget(null);
                                                    }}
                                                    onDrop={(event) => drop(event, entry, practitioner._id)}
                                                >
                                                    {hours.map((minutes) => <div key={minutes} className="pointer-events-none absolute inset-x-0 border-t border-border/50" style={{top: top(minutes)}} />)}
                                                    {/* While dragging, the booking grid shows where an appointment can start. */}
                                                    {dragging?.locationId === entry._id ? slotLines.map((minutes) => (
                                                        <div key={`slot-${minutes}`} className="pointer-events-none absolute inset-x-0 z-[5] border-t border-dashed border-primary/25" style={{top: top(minutes)}} aria-hidden />
                                                    )) : null}
                                                    {practitioner.working.map((interval) => create ? (
                                                        <Button
                                                            key={interval.start}
                                                            type="button"
                                                            variant="bare"
                                                            className="absolute inset-x-0 rounded-none bg-background hover:bg-primary/5"
                                                            style={span(interval, entry.timezone)}
                                                            title={String(resolveLanguageKey("bookHere"))}
                                                            aria-label={String(resolveLanguageKey("bookHere"))}
                                                            onClick={(event) => bookAt(event, entry, practitioner._id)}
                                                        />
                                                    ) : (
                                                        <div key={interval.start} className="absolute inset-x-0 bg-background" style={span(interval, entry.timezone)} />
                                                    ))}
                                                    {practitioner.timeOff.map((interval) => (
                                                        <div key={interval.start} className="absolute inset-x-0 flex items-start bg-muted px-2 py-1 text-xs text-muted-foreground" style={span(interval, entry.timezone)}>
                                                            {resolveLanguageKey("timeOff")}
                                                        </div>
                                                    ))}
                                                    {day.appointments.filter((a) => a.locationId === entry._id && a.practitionerId === practitioner._id).map((appointment) => {
                                                        const from = minutesAt(appointment.startAt, entry.timezone);
                                                        const to = endMinutes(appointment.endAt, entry.timezone);
                                                        const movable = canMove && MOVABLE.includes(appointment.status);
                                                        return (
                                                            <Button
                                                                type="button"
                                                                variant="bare"
                                                                key={appointment._id}
                                                                draggable={movable}
                                                                onDragStart={(event) => {
                                                                    if (EMPTY_DRAG_IMAGE) event.dataTransfer.setDragImage(EMPTY_DRAG_IMAGE, 0, 0);
                                                                    setDragging({
                                                                        id: appointment._id,
                                                                        locationId: entry._id,
                                                                        grabMinutes: ((event.clientY - event.currentTarget.getBoundingClientRect().top) / HOUR_PX) * 60,
                                                                    });
                                                                }}
                                                                onDragEnd={endDrag}
                                                                onClick={() => setOpenId(appointment._id)}
                                                                className={cn(
                                                                    "absolute inset-x-1 z-10 overflow-hidden rounded border-l-4 border-current px-2 py-1 text-left text-xs",
                                                                    toneClass(statusTones?.[appointment.status]) ?? "bg-muted",
                                                                    movable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
                                                                    dragging?.id === appointment._id && "opacity-30",
                                                                )}
                                                                style={span({start: appointment.startAt, end: appointment.endAt}, entry.timezone)}
                                                                title={`${appointment.number} · ${resolveLanguageKey(`status.${appointment.status}`)}`}
                                                            >
                                                                <p className="font-medium">{hhmm(from)}–{hhmm(to)} {appointment.patientName ?? appointment.number}</p>
                                                                <p className="truncate opacity-80">{appointment.serviceName}</p>
                                                            </Button>
                                                        );
                                                    })}
                                                    {dropPreview(entry, practitioner._id)}
                                                    {now !== null && now >= range.start && now <= range.end ? (
                                                        <div className="pointer-events-none absolute inset-x-0 z-10 border-t-2 border-destructive" style={{top: top(now)}} aria-hidden />
                                                    ) : null}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : null}
            {openId ? (
                <AppointmentSheetView open onOpenChange={(open: boolean) => !open && setOpenId(null)} fetchId={openId} onSheetRowPatched={load} />
            ) : null}
        </div>
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/day/index.tsx"),
    withDebug(true, true, "appointments"),
)(ClinicDayView);
