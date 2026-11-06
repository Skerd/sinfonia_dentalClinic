import {useEffect, useState} from "react";
import {compose} from "redux";
import {Link, useNavigate, useSearchParams} from "react-router-dom";
import {useSectionBase} from "@coreModule/clients/portal/shared/sectionBase.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
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
import {Button} from "@coreModule/components/ui/button.tsx";

const MANAGE_REQUEST: HttpRequest = {method: "POST", url: "/api/dentalClinic/clinicStorefront/manage"};
const CANCEL_REQUEST: HttpRequest = {method: "POST", url: "/api/dentalClinic/clinicStorefront/manage/cancel"};
const RESCHEDULE_REQUEST: HttpRequest = {method: "POST", url: "/api/dentalClinic/clinicStorefront/manage/reschedule"};

const STATUS_TONE: Record<PublicAppointment["status"], string> = {
    pending: "bg-warning/10 text-warning",
    confirmed: "bg-success/10 text-success",
    completed: "bg-muted text-foreground",
    cancelled: "bg-destructive/10 text-destructive",
    no_show: "bg-destructive/10 text-destructive",
};

/** The guest link from the email: see the appointment, move it or cancel it before the deadlines. */
function ManagePage({resolveLanguageKey, languageCode}: WithLanguageType) {
    const base = useSectionBase();
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const token = params.get("token") ?? "";
    const justBooked = params.get("booked") === "1";
    const {formatMoney} = useClinicConfig();
    const [appointment, setAppointment] = useState<PublicAppointment | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<"view" | "cancel" | "reschedule">("view");
    const [newSlot, setNewSlot] = useState<PickedSlot | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    const [loadCount, setLoadCount] = useState(0);
    useEffect(() => {
        if (token) setLoadCount((count) => count + 1);
    }, [token]);
    useHttpRequest<PublicAppointmentResponse>(MANAGE_REQUEST, {token}, loadCount, true, {
        success: (response) => setAppointment(response.data),
        error: (e) => setError(normalizeError(e).displayMessage ?? String(resolveLanguageKey("loadFailed"))),
    });

    const [cancelCount, setCancelCount] = useState(0);
    const cancelRequest = useHttpRequest<PublicAppointmentResponse>(CANCEL_REQUEST, {token}, cancelCount, true, {
        success: (response) => {
            // The link stops working once cancelled; keep showing what came back.
            setAppointment(response.data);
            setMode("view");
            setNotice(String(resolveLanguageKey("cancelledNotice")));
        },
        error: (e) => handleError(e, {context: "ClinicManageCancel", showToast: true, fallbackMessage: String(resolveLanguageKey("actionFailed"))}),
    });
    const cancel = () => setCancelCount((count) => count + 1);

    const [rescheduleCount, setRescheduleCount] = useState(0);
    const rescheduleRequest = useHttpRequest<RescheduledAppointmentResponse>(RESCHEDULE_REQUEST, {token, ...newSlot}, rescheduleCount, true, {
        success: ({data}) => {
            setAppointment(data.appointment);
            setMode("view");
            setNewSlot(null);
            setNotice(String(resolveLanguageKey("movedNotice")));
            // The old link no longer works: continue with the new one.
            navigate(`${base}/manage?${new URLSearchParams({token: data.manageToken}).toString()}`, {replace: true});
        },
        error: (e) => {
            handleError(e, {context: "ClinicManageReschedule", showToast: true, fallbackMessage: String(resolveLanguageKey("actionFailed"))});
            setNewSlot(null);
        },
    });
    const reschedule = () => {
        if (newSlot) setRescheduleCount((count) => count + 1);
    };
    const busy = cancelRequest.loading || rescheduleRequest.loading;

    if (!token || error) {
        return (
            <div className="rounded-2xl bg-muted p-5 sm:p-6 flex flex-col items-start gap-3" role="alert">
                <h1 className="font-display font-bold tracking-tight text-xl">{resolveLanguageKey("linkInvalidTitle")}</h1>
                <p className="text-muted-foreground">{error ?? resolveLanguageKey("linkInvalidText")}</p>
                <Button asChild size="lg"><Link to={base}>{resolveLanguageKey("backHome")}</Link></Button>
            </div>
        );
    }
    if (!appointment) return <Loader />;

    const at = (iso: string) => formatAtClinic(iso, appointment.timezone, languageCode);

    return (
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
            {justBooked && !notice ? (
                <div className="rounded-2xl bg-success/10 p-4 text-success" role="status">
                    {resolveLanguageKey(appointment.status === "pending" ? "requestedNotice" : "bookedNotice")}
                </div>
            ) : null}
            {notice ? <div className="rounded-2xl bg-muted p-4 text-foreground" role="status">{notice}</div> : null}

            <section className="rounded-2xl bg-muted p-5 sm:p-6 flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-sm text-muted-foreground">{resolveLanguageKey("bookingNumber")} {appointment.number}</p>
                        <h1 className="font-display font-bold tracking-tight text-3xl">{at(appointment.startAt)}</h1>
                    </div>
                    <span className={cn("rounded-full px-3 py-1 text-sm font-medium", STATUS_TONE[appointment.status])}>
                        {resolveLanguageKey(`status.${appointment.status}`)}
                    </span>
                </div>
                <dl className="grid gap-4 text-sm sm:grid-cols-2">
                    <div>
                        <dt className="font-medium">{resolveLanguageKey("service")}</dt>
                        <dd className="text-muted-foreground">{appointment.serviceName} · {appointment.durationMinutes} {resolveLanguageKey("minutes")}</dd>
                        <dd className="text-muted-foreground">{priceLabel(appointment, formatMoney, resolveLanguageKey)}</dd>
                    </div>
                    <div>
                        <dt className="font-medium">{resolveLanguageKey("practitioner")}</dt>
                        <dd className="text-muted-foreground">{appointment.practitionerName}</dd>
                    </div>
                    <div>
                        <dt className="font-medium">{resolveLanguageKey("location")}</dt>
                        <dd className="text-muted-foreground">{appointment.locationName}</dd>
                        {appointment.locationAddress ? <dd className="text-muted-foreground">{appointment.locationAddress}</dd> : null}
                    </div>
                    <div>
                        <dt className="font-medium">{resolveLanguageKey("patient")}</dt>
                        <dd className="text-muted-foreground">{appointment.patient.firstName} {appointment.patient.lastName}</dd>
                        <dd className="text-muted-foreground">{appointment.patient.email}</dd>
                    </div>
                </dl>
            </section>

            {mode === "view" && (appointment.canReschedule || appointment.canCancel) ? (
                <section className="rounded-2xl bg-muted p-5 sm:p-6 flex flex-col gap-3">
                    <p className="text-sm text-muted-foreground">
                        {appointment.canReschedule ? String(resolveLanguageKey("changeUntil")).replace("{until}", at(appointment.rescheduleUntil)) : null}
                        {appointment.canReschedule && appointment.canCancel ? " " : null}
                        {appointment.canCancel ? String(resolveLanguageKey("cancelUntil")).replace("{until}", at(appointment.cancelUntil)) : null}
                    </p>
                    <div className="flex flex-wrap gap-3">
                        {appointment.canReschedule ? <Button variant="outline" size="lg" type="button"  onClick={() => setMode("reschedule")}>{resolveLanguageKey("moveAppointment")}</Button> : null}
                        {appointment.canCancel ? <Button variant="outline" size="lg" type="button"  onClick={() => setMode("cancel")}>{resolveLanguageKey("cancelAppointment")}</Button> : null}
                    </div>
                </section>
            ) : null}
            {mode === "view" && !appointment.canReschedule && !appointment.canCancel && (appointment.status === "pending" || appointment.status === "confirmed") ? (
                <p className="text-sm text-muted-foreground">{resolveLanguageKey("callToChange")}</p>
            ) : null}

            {mode === "cancel" ? (
                <section className="rounded-2xl bg-muted p-5 sm:p-6 flex flex-col gap-3">
                    <h2 className="font-display font-bold tracking-tight text-lg">{resolveLanguageKey("cancelTitle")}</h2>
                    <p className="text-sm text-muted-foreground">{resolveLanguageKey("cancelText")}</p>
                    <div className="flex flex-wrap gap-3">
                        <Button size="lg" type="button" className="bg-destructive hover:bg-destructive/90" disabled={busy} onClick={cancel}>
                            {resolveLanguageKey(busy ? "working" : "confirmCancel")}
                        </Button>
                        <Button variant="outline" size="lg" type="button"  disabled={busy} onClick={() => setMode("view")}>{resolveLanguageKey("keep")}</Button>
                    </div>
                </section>
            ) : null}

            {mode === "reschedule" ? (
                <section className="rounded-2xl bg-muted p-5 sm:p-6 flex flex-col gap-4">
                    <h2 className="font-display font-bold tracking-tight text-lg">{resolveLanguageKey("moveTitle")}</h2>
                    <ClinicSlotPicker
                        service={appointment.serviceId}
                        location={appointment.locationId}
                        practitioner={appointment.practitionerId}
                        selected={newSlot}
                        onPick={setNewSlot}
                    />
                    <div className="flex flex-wrap items-center gap-3">
                        <Button size="lg" type="button"  disabled={busy || !newSlot} onClick={reschedule}>
                            {busy ? resolveLanguageKey("working") : newSlot ? `${resolveLanguageKey("moveTo")} ${formatDay(newSlot.date, languageCode)}, ${newSlot.time}` : resolveLanguageKey("pickTime")}
                        </Button>
                        <Button variant="outline" size="lg" type="button"  disabled={busy} onClick={() => { setMode("view"); setNewSlot(null); }}>{resolveLanguageKey("keep")}</Button>
                    </div>
                </section>
            ) : null}
        </div>
    );
}

export default compose(withLanguage("src/modules/dentalClinic/clients/client/public/manage/index.tsx"))(ManagePage);
