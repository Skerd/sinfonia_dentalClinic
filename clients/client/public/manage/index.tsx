import {useEffect, useState} from "react";
import {compose} from "redux";
import {Link, useNavigate, useSearchParams} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {handleError, normalizeError} from "@coreModule/helpers/general/errors.ts";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {
    PublicAppointment,
    PublicAppointmentResponse,
    RescheduledAppointmentResponse,
} from "armonia/src/modules/dentalClinic/api/dentalClinic/public/clinicStorefront/clinicStorefront.response.types.ts";
import {useClinicConfig} from "../shared/clinicConfigContext.tsx";
import ClinicSlotPicker, {type PickedSlot} from "../shared/clinicSlotPicker.tsx";
import {formatAtClinic, formatDay, priceLabel} from "../shared/clinicFormat.ts";
import {CLINIC_CARD, CLINIC_HEADING, CLINIC_PRIMARY_BUTTON, CLINIC_SECONDARY_BUTTON} from "../shared/clinicStyles.ts";

const STATUS_TONE: Record<PublicAppointment["status"], string> = {
    pending: "bg-clinic-warning/10 text-clinic-warning",
    confirmed: "bg-clinic-success/10 text-clinic-success",
    completed: "bg-clinic-surface text-clinic-ink",
    cancelled: "bg-clinic-danger/10 text-clinic-danger",
    no_show: "bg-clinic-danger/10 text-clinic-danger",
};

/** The guest link from the email: see the appointment, move it or cancel it before the deadlines. */
function ManagePage({resolveLanguageKey, languageCode}: WithLanguageType) {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const token = params.get("token") ?? "";
    const justBooked = params.get("booked") === "1";
    const {formatMoney} = useClinicConfig();
    const [appointment, setAppointment] = useState<PublicAppointment | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<"view" | "cancel" | "reschedule">("view");
    const [newSlot, setNewSlot] = useState<PickedSlot | null>(null);
    const [busy, setBusy] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);

    useEffect(() => {
        if (!token) return;
        const controller = new AbortController();
        apiClient
            .post<PublicAppointmentResponse>("/api/dentalClinic/clinicStorefront/manage", {token}, {signal: controller.signal})
            .then((res) => setAppointment(res.data.data))
            .catch((e) => {
                if (!controller.signal.aborted) setError(normalizeError(e).displayMessage ?? String(resolveLanguageKey("loadFailed")));
            });
        return () => controller.abort();
    }, [token]);

    const cancel = async () => {
        setBusy(true);
        try {
            const res = await apiClient.post<PublicAppointmentResponse>("/api/dentalClinic/clinicStorefront/manage/cancel", {token});
            // The link stops working once cancelled; keep showing what came back.
            setAppointment(res.data.data);
            setMode("view");
            setNotice(String(resolveLanguageKey("cancelledNotice")));
        } catch (e) {
            handleError(e, {context: "ClinicManageCancel", showToast: true, fallbackMessage: String(resolveLanguageKey("actionFailed"))});
        } finally {
            setBusy(false);
        }
    };

    const reschedule = async () => {
        if (!newSlot) return;
        setBusy(true);
        try {
            const {data} = (await apiClient.post<RescheduledAppointmentResponse>("/api/dentalClinic/clinicStorefront/manage/reschedule", {token, ...newSlot})).data;
            setAppointment(data.appointment);
            setMode("view");
            setNewSlot(null);
            setNotice(String(resolveLanguageKey("movedNotice")));
            // The old link no longer works: continue with the new one.
            navigate(`/manage?${new URLSearchParams({token: data.manageToken}).toString()}`, {replace: true});
        } catch (e) {
            handleError(e, {context: "ClinicManageReschedule", showToast: true, fallbackMessage: String(resolveLanguageKey("actionFailed"))});
            setNewSlot(null);
        } finally {
            setBusy(false);
        }
    };

    if (!token || error) {
        return (
            <div className={`${CLINIC_CARD} flex flex-col items-start gap-3`} role="alert">
                <h1 className={`${CLINIC_HEADING} text-xl`}>{resolveLanguageKey("linkInvalidTitle")}</h1>
                <p className="text-clinic-ink-muted">{error ?? resolveLanguageKey("linkInvalidText")}</p>
                <Link to="/" className={CLINIC_PRIMARY_BUTTON}>{resolveLanguageKey("backHome")}</Link>
            </div>
        );
    }
    if (!appointment) return <Loader />;

    const at = (iso: string) => formatAtClinic(iso, appointment.timezone, languageCode);

    return (
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
            {justBooked && !notice ? (
                <div className="rounded-2xl bg-clinic-success/10 p-4 text-clinic-success" role="status">
                    {resolveLanguageKey(appointment.status === "pending" ? "requestedNotice" : "bookedNotice")}
                </div>
            ) : null}
            {notice ? <div className="rounded-2xl bg-clinic-accent-soft p-4 text-clinic-accent-strong" role="status">{notice}</div> : null}

            <section className={`${CLINIC_CARD} flex flex-col gap-4`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-sm text-clinic-ink-faded">{resolveLanguageKey("bookingNumber")} {appointment.number}</p>
                        <h1 className={`${CLINIC_HEADING} text-2xl`}>{at(appointment.startAt)}</h1>
                    </div>
                    <span className={cn("rounded-full px-3 py-1 text-sm font-medium", STATUS_TONE[appointment.status])}>
                        {resolveLanguageKey(`status.${appointment.status}`)}
                    </span>
                </div>
                <dl className="grid gap-4 text-sm sm:grid-cols-2">
                    <div>
                        <dt className="font-medium">{resolveLanguageKey("service")}</dt>
                        <dd className="text-clinic-ink-muted">{appointment.serviceName} · {appointment.durationMinutes} {resolveLanguageKey("minutes")}</dd>
                        <dd className="text-clinic-ink-muted">{priceLabel(appointment, formatMoney, resolveLanguageKey)}</dd>
                    </div>
                    <div>
                        <dt className="font-medium">{resolveLanguageKey("practitioner")}</dt>
                        <dd className="text-clinic-ink-muted">{appointment.practitionerName}</dd>
                    </div>
                    <div>
                        <dt className="font-medium">{resolveLanguageKey("location")}</dt>
                        <dd className="text-clinic-ink-muted">{appointment.locationName}</dd>
                        {appointment.locationAddress ? <dd className="text-clinic-ink-faded">{appointment.locationAddress}</dd> : null}
                    </div>
                    <div>
                        <dt className="font-medium">{resolveLanguageKey("patient")}</dt>
                        <dd className="text-clinic-ink-muted">{appointment.patient.firstName} {appointment.patient.lastName}</dd>
                        <dd className="text-clinic-ink-muted">{appointment.patient.email}</dd>
                    </div>
                </dl>
            </section>

            {mode === "view" && (appointment.canReschedule || appointment.canCancel) ? (
                <section className={`${CLINIC_CARD} flex flex-col gap-3`}>
                    <p className="text-sm text-clinic-ink-muted">
                        {appointment.canReschedule ? String(resolveLanguageKey("changeUntil")).replace("{until}", at(appointment.rescheduleUntil)) : null}
                        {appointment.canReschedule && appointment.canCancel ? " " : null}
                        {appointment.canCancel ? String(resolveLanguageKey("cancelUntil")).replace("{until}", at(appointment.cancelUntil)) : null}
                    </p>
                    <div className="flex flex-wrap gap-3">
                        {appointment.canReschedule ? <button type="button" className={CLINIC_SECONDARY_BUTTON} onClick={() => setMode("reschedule")}>{resolveLanguageKey("moveAppointment")}</button> : null}
                        {appointment.canCancel ? <button type="button" className={CLINIC_SECONDARY_BUTTON} onClick={() => setMode("cancel")}>{resolveLanguageKey("cancelAppointment")}</button> : null}
                    </div>
                </section>
            ) : null}
            {mode === "view" && !appointment.canReschedule && !appointment.canCancel && (appointment.status === "pending" || appointment.status === "confirmed") ? (
                <p className="text-sm text-clinic-ink-muted">{resolveLanguageKey("callToChange")}</p>
            ) : null}

            {mode === "cancel" ? (
                <section className={`${CLINIC_CARD} flex flex-col gap-3`}>
                    <h2 className={`${CLINIC_HEADING} text-lg`}>{resolveLanguageKey("cancelTitle")}</h2>
                    <p className="text-sm text-clinic-ink-muted">{resolveLanguageKey("cancelText")}</p>
                    <div className="flex flex-wrap gap-3">
                        <button type="button" className={cn(CLINIC_PRIMARY_BUTTON, "bg-clinic-danger hover:bg-clinic-danger/90")} disabled={busy} onClick={() => void cancel()}>
                            {resolveLanguageKey(busy ? "working" : "confirmCancel")}
                        </button>
                        <button type="button" className={CLINIC_SECONDARY_BUTTON} disabled={busy} onClick={() => setMode("view")}>{resolveLanguageKey("keep")}</button>
                    </div>
                </section>
            ) : null}

            {mode === "reschedule" ? (
                <section className={`${CLINIC_CARD} flex flex-col gap-4`}>
                    <h2 className={`${CLINIC_HEADING} text-lg`}>{resolveLanguageKey("moveTitle")}</h2>
                    <ClinicSlotPicker
                        service={appointment.serviceId}
                        location={appointment.locationId}
                        practitioner={appointment.practitionerId}
                        selected={newSlot}
                        onPick={setNewSlot}
                    />
                    <div className="flex flex-wrap items-center gap-3">
                        <button type="button" className={CLINIC_PRIMARY_BUTTON} disabled={busy || !newSlot} onClick={() => void reschedule()}>
                            {busy ? resolveLanguageKey("working") : newSlot ? `${resolveLanguageKey("moveTo")} ${formatDay(newSlot.date, languageCode)}, ${newSlot.time}` : resolveLanguageKey("pickTime")}
                        </button>
                        <button type="button" className={CLINIC_SECONDARY_BUTTON} disabled={busy} onClick={() => { setMode("view"); setNewSlot(null); }}>{resolveLanguageKey("keep")}</button>
                    </div>
                </section>
            ) : null}
        </div>
    );
}

export default compose(withLanguage("src/modules/dentalClinic/clients/client/public/manage/index.tsx"))(ManagePage);
