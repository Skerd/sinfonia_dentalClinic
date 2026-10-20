import {useEffect, useState} from "react";
import {compose} from "redux";
import {IconChevronLeft, IconChevronRight} from "@tabler/icons-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {normalizeError} from "@coreModule/helpers/general/errors.ts";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import type {ClinicSlotsFormType} from "armonia/src/modules/dentalClinic/api/dentalClinic/public/clinicStorefront/clinicStorefront.forms.ts";
import type {ClinicSlotsResponse} from "armonia/src/modules/dentalClinic/api/dentalClinic/public/clinicStorefront/clinicStorefront.response.types.ts";
import {addDays, dateInDays, formatDay} from "./clinicFormat.ts";
import {CLINIC_CHOICE, CLINIC_SECONDARY_BUTTON} from "./clinicStyles.ts";

const DAYS_SHOWN = 7;

export type PickedSlot = {date: string; time: string};

type Props = WithLanguageType & {
    service: string;
    location: string;
    /** Omitted for "anyone". */
    practitioner?: string;
    selected?: PickedSlot | null;
    onPick: (slot: PickedSlot) => void;
};

/** A week of free start times, local to the clinic, with week-by-week navigation. */
function ClinicSlotPicker({service, location, practitioner, selected, onPick, resolveLanguageKey, languageCode}: Props) {
    const [fromDate, setFromDate] = useState(() => selected?.date ?? dateInDays(0));
    const [days, setDays] = useState<ClinicSlotsResponse["data"]["days"] | null>(null);
    const [timezone, setTimezone] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        setDays(null);
        setError(null);
        const body: ClinicSlotsFormType = {service, location, practitioner, fromDate, days: DAYS_SHOWN};
        apiClient
            .post<ClinicSlotsResponse>("/api/dentalClinic/clinicStorefront/slots", body, {signal: controller.signal})
            .then((res) => {
                setDays(res.data.data.days);
                setTimezone(res.data.data.timezone);
            })
            .catch((e) => {
                if (!controller.signal.aborted) setError(normalizeError(e).displayMessage ?? String(resolveLanguageKey("loadFailed")));
            });
        return () => controller.abort();
    }, [service, location, practitioner, fromDate]);

    const today = dateInDays(0);
    const anyFree = days?.some((day) => day.slots.length > 0);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
                <button type="button" className={CLINIC_SECONDARY_BUTTON} disabled={fromDate <= today} onClick={() => setFromDate((d) => addDays(d, -DAYS_SHOWN))} aria-label={String(resolveLanguageKey("earlier"))}>
                    <IconChevronLeft size={18} />
                </button>
                <p className="text-sm text-clinic-ink-muted">
                    {formatDay(fromDate, languageCode)} – {formatDay(addDays(fromDate, DAYS_SHOWN - 1), languageCode)}
                    {timezone ? ` · ${resolveLanguageKey("localTime")} (${timezone})` : ""}
                </p>
                <button type="button" className={CLINIC_SECONDARY_BUTTON} onClick={() => setFromDate((d) => addDays(d, DAYS_SHOWN))} aria-label={String(resolveLanguageKey("later"))}>
                    <IconChevronRight size={18} />
                </button>
            </div>
            {error ? <p className="text-sm text-clinic-danger" role="alert">{error}</p> : null}
            {!days && !error ? <Loader /> : null}
            {days && !anyFree ? <p className="text-clinic-ink-muted">{resolveLanguageKey("noneThisWeek")}</p> : null}
            {days && anyFree ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-live="polite">
                    {days.filter((day) => day.slots.length).map((day) => (
                        <section key={day.date} className="flex flex-col gap-2">
                            <h3 className="text-sm font-semibold">{formatDay(day.date, languageCode)}</h3>
                            <div className="grid grid-cols-3 gap-2">
                                {day.slots.map((slot) => (
                                    <button
                                        key={slot.startAt}
                                        type="button"
                                        className={`${CLINIC_CHOICE} px-2 py-2 text-center text-sm font-medium`}
                                        aria-pressed={selected?.date === day.date && selected.time === slot.time}
                                        onClick={() => onPick({date: day.date, time: slot.time})}
                                    >
                                        {slot.time}
                                    </button>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            ) : null}
        </div>
    );
}

export default compose(withLanguage("src/modules/dentalClinic/clients/client/public/shared/clinicSlotPicker.tsx"))(ClinicSlotPicker);
