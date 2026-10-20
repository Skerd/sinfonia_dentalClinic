import {useRef, useState, type FormEvent, type ReactNode} from "react";
import {compose} from "redux";
import {Link, useNavigate, useSearchParams} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {handleError} from "@coreModule/helpers/general/errors.ts";
import {generateUUID} from "@coreModule/helpers/general/uuid.ts";
import {useFieldErrors} from "@coreModule/helpers/publicAuth/useFieldErrors.ts";
import {appointmentPatientFormSchema} from "armonia/src/modules/dentalClinic/api/dentalClinic/public/clinicStorefront/clinicStorefront.form.validators.ts";
import type {BookAppointmentFormType} from "armonia/src/modules/dentalClinic/api/dentalClinic/public/clinicStorefront/clinicStorefront.forms.ts";
import type {AppointmentBookingResponse} from "armonia/src/modules/dentalClinic/api/dentalClinic/public/clinicStorefront/clinicStorefront.response.types.ts";
import {APPOINTMENT_NOTE_MAX} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/appointment/appointment.constants.ts";
import {bookableServices, useClinicConfig} from "../shared/clinicConfigContext.tsx";
import ClinicSlotPicker, {type PickedSlot} from "../shared/clinicSlotPicker.tsx";
import {formatDay, priceLabel} from "../shared/clinicFormat.ts";
import {CLINIC_CARD, CLINIC_CHOICE, CLINIC_HEADING, CLINIC_INPUT, CLINIC_LABEL, CLINIC_PRIMARY_BUTTON} from "../shared/clinicStyles.ts";

const PATIENT_KEYS = ["firstName", "lastName", "email", "phone"] as const;
type PatientKey = (typeof PATIENT_KEYS)[number];
type Patient = BookAppointmentFormType["patient"];
/** The wizard's choices, in order; changing one clears those after it. */
const STEPS = ["service", "location", "practitioner", "date", "time"] as const;
const ANYONE = "any";

/**
 * Treatment → location → dentist (or anyone) → time → details. Every choice lives
 * in the URL, so the back button and a shared link land on the same step.
 */
function BookPage({resolveLanguageKey, languageCode}: WithLanguageType) {
    const {config, formatMoney} = useClinicConfig();
    const [params, setParams] = useSearchParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState<Patient>({firstName: "", lastName: "", email: "", phone: ""});
    const [note, setNote] = useState("");
    const [acceptPrivacy, setAcceptPrivacy] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const {fieldErrors, clearFieldError, showIssues} = useFieldErrors<PatientKey>(PATIENT_KEYS);
    // One key per booking attempt: a retried request after a lost response returns the same appointment.
    const idempotencyKey = useRef(generateUUID());

    if (!config) return null;

    const choose = (key: (typeof STEPS)[number], value: string | null, extra: Record<string, string> = {}) => {
        const next = new URLSearchParams(params);
        for (const step of STEPS.slice(STEPS.indexOf(key))) next.delete(step);
        if (value) next.set(key, value);
        for (const [k, v] of Object.entries(extra)) next.set(k, v);
        setParams(next);
        setFormError(null);
    };

    const pinned = params.get("practitioner");
    const pinnedPractitioner = pinned && pinned !== ANYONE ? config.practitioners.find((p) => p._id === pinned) : undefined;
    const services = bookableServices(config).filter((service) => !pinnedPractitioner || pinnedPractitioner.services.includes(service._id));
    const service = services.find((s) => s._id === params.get("service"));
    const doers = config.practitioners.filter((p) => service && p.services.includes(service._id) && (!pinnedPractitioner || p._id === pinnedPractitioner._id));
    const locations = config.locations.filter((l) => doers.some((p) => p.locations.includes(l._id)));
    const location = locations.find((l) => l._id === params.get("location")) ?? (locations.length === 1 ? locations[0] : undefined);
    const eligible = doers.filter((p) => location && p.locations.includes(location._id));
    const practitionerParam = params.get("practitioner") ?? (eligible.length === 1 ? eligible[0]._id : null);
    const practitioner = eligible.find((p) => p._id === practitionerParam);
    const anyone = practitionerParam === ANYONE;
    const date = params.get("date");
    const time = params.get("time");

    const updatePatient = (key: PatientKey, value: string) => {
        setPatient((current) => ({...current, [key]: value}));
        clearFieldError(key);
    };

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        if (!service || !location || !date || !time) return;
        setFormError(null);
        const parsed = appointmentPatientFormSchema(languageCode).safeParse(patient);
        if (!parsed.success) {
            showIssues(parsed.error.issues);
            return;
        }
        if (!acceptPrivacy) {
            setFormError(String(resolveLanguageKey("acceptPrivacyRequired")));
            return;
        }
        const body: BookAppointmentFormType = {
            service: service._id,
            location: location._id,
            practitioner: practitioner?._id,
            date,
            time,
            patient,
            ...(config.patientNoteEnabled && note.trim() ? {note: note.trim()} : {}),
            acceptPrivacy,
            idempotencyKey: idempotencyKey.current,
        };
        setSubmitting(true);
        try {
            const {data} = (await apiClient.post<AppointmentBookingResponse>("/api/dentalClinic/clinicStorefront/book", body)).data;
            navigate(`/manage?${new URLSearchParams({token: data.manageToken, booked: "1"}).toString()}`);
        } catch (e) {
            const error = handleError(e, {context: "ClinicBook"});
            if (!error) return;
            // A rejected request created nothing, so the next attempt is a new booking.
            if (error.status && error.status < 500) idempotencyKey.current = generateUUID();
            if (error.code === "appointment_slot_unavailable" || error.code === "appointment_no_practitioner_available") choose("date", null);
            setFormError(error.displayMessage ?? String(resolveLanguageKey("bookingFailed")));
        } finally {
            setSubmitting(false);
        }
    };

    const summaryRow = (label: string, value: string | undefined, step: (typeof STEPS)[number]) => value ? (
        <div className="flex items-start justify-between gap-3">
            <div>
                <dt className="text-xs uppercase tracking-wide text-clinic-ink-faded">{label}</dt>
                <dd className="font-medium">{value}</dd>
            </div>
            <button type="button" className="text-sm font-medium text-clinic-accent hover:underline" onClick={() => choose(step, null)}>{resolveLanguageKey("change")}</button>
        </div>
    ) : null;

    let step: ReactNode;
    if (!services.length) {
        step = <p className="text-clinic-ink-muted">{resolveLanguageKey("nothingBookable")}</p>;
    } else if (!service) {
        step = (
            <StepCard title={resolveLanguageKey("chooseService")}>
                <div className="grid gap-3 sm:grid-cols-2">
                    {services.map((s) => (
                        <button key={s._id} type="button" className={CLINIC_CHOICE} onClick={() => choose("service", s._id)}>
                            <p className="font-semibold">{s.name}</p>
                            <p className="text-sm text-clinic-ink-muted">{s.durationMinutes} {resolveLanguageKey("minutes")} · {priceLabel(s, formatMoney, resolveLanguageKey)}</p>
                        </button>
                    ))}
                </div>
            </StepCard>
        );
    } else if (!location) {
        step = (
            <StepCard title={resolveLanguageKey("chooseLocation")}>
                <div className="grid gap-3 sm:grid-cols-2">
                    {locations.map((l) => (
                        <button key={l._id} type="button" className={CLINIC_CHOICE} onClick={() => choose("location", l._id)}>
                            <p className="font-semibold">{l.name}</p>
                            {l.address ? <p className="text-sm text-clinic-ink-muted">{l.address}</p> : null}
                        </button>
                    ))}
                </div>
            </StepCard>
        );
    } else if (!practitioner && !anyone) {
        step = (
            <StepCard title={resolveLanguageKey("choosePractitioner")}>
                <div className="grid gap-3 sm:grid-cols-2">
                    <button type="button" className={CLINIC_CHOICE} onClick={() => choose("practitioner", ANYONE)}>
                        <p className="font-semibold">{resolveLanguageKey("anyone")}</p>
                        <p className="text-sm text-clinic-ink-muted">{resolveLanguageKey("anyoneHint")}</p>
                    </button>
                    {eligible.map((p) => (
                        <button key={p._id} type="button" className={`${CLINIC_CHOICE} flex items-center gap-3`} onClick={() => choose("practitioner", p._id)}>
                            {p.photo ? <img src={p.photo} alt="" className="h-12 w-12 rounded-full object-cover" /> : <span className="h-12 w-12 rounded-full bg-clinic-accent-soft" aria-hidden />}
                            <span>
                                <span className="block font-semibold">{p.displayName}</span>
                                <span className="block text-sm text-clinic-ink-muted">{p.title || resolveLanguageKey(`role.${p.role}`)}</span>
                            </span>
                        </button>
                    ))}
                </div>
            </StepCard>
        );
    } else if (!date || !time) {
        step = (
            <StepCard title={resolveLanguageKey("chooseTime")}>
                <ClinicSlotPicker
                    service={service._id}
                    location={location._id}
                    practitioner={practitioner?._id}
                    onPick={(slot: PickedSlot) => choose("date", slot.date, {time: slot.time})}
                />
            </StepCard>
        );
    } else {
        step = (
            <form onSubmit={submit} noValidate className="flex flex-col gap-6">
                <StepCard title={resolveLanguageKey("yourDetails")}>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {PATIENT_KEYS.map((key) => (
                            <label key={key} className="flex flex-col gap-1.5">
                                <span className={CLINIC_LABEL}>{resolveLanguageKey(`patient.${key}`)}</span>
                                <input
                                    className={CLINIC_INPUT}
                                    type={key === "email" ? "email" : key === "phone" ? "tel" : "text"}
                                    autoComplete={key === "firstName" ? "given-name" : key === "lastName" ? "family-name" : key === "email" ? "email" : "tel"}
                                    value={patient[key]}
                                    onChange={(e) => updatePatient(key, e.target.value)}
                                    aria-invalid={!!fieldErrors[key] || undefined}
                                />
                                {fieldErrors[key] ? <span className="text-sm text-clinic-danger">{fieldErrors[key]}</span> : null}
                            </label>
                        ))}
                        {config.patientNoteEnabled ? (
                            <label className="flex flex-col gap-1.5 sm:col-span-2">
                                <span className={CLINIC_LABEL}>{resolveLanguageKey("note")}</span>
                                <textarea className={`${CLINIC_INPUT} h-24 py-2`} maxLength={APPOINTMENT_NOTE_MAX} value={note} onChange={(e) => setNote(e.target.value)} />
                                <span className="text-xs text-clinic-ink-faded">{resolveLanguageKey("noteHint")}</span>
                            </label>
                        ) : null}
                    </div>
                </StepCard>
                <div className={`${CLINIC_CARD} flex flex-col gap-4`}>
                    <label className="flex items-start gap-3 text-sm">
                        <input type="checkbox" checked={acceptPrivacy} onChange={(e) => setAcceptPrivacy(e.target.checked)} />
                        <span>
                            {resolveLanguageKey("acceptPrivacy")}{" "}
                            {config.privacyNoticeText ? <Link to="/privacy" target="_blank" className="font-medium text-clinic-accent hover:underline">{resolveLanguageKey("readPrivacy")}</Link> : null}
                        </span>
                    </label>
                    {formError ? <p className="text-sm text-clinic-danger" role="alert">{formError}</p> : null}
                    <button type="submit" className={`${CLINIC_PRIMARY_BUTTON} w-full sm:w-auto`} disabled={submitting}>
                        {resolveLanguageKey(submitting ? "booking" : config.requireStaffConfirmation ? "requestAppointment" : "confirmBooking")}
                    </button>
                    {config.requireStaffConfirmation ? <p className="text-sm text-clinic-ink-muted">{resolveLanguageKey("reviewedHint")}</p> : null}
                </div>
            </form>
        );
    }

    return (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="flex flex-col gap-6">
                <h1 className={`${CLINIC_HEADING} text-3xl`}>{resolveLanguageKey("title")}</h1>
                {formError && !(date && time) ? <p className="text-sm text-clinic-danger" role="alert">{formError}</p> : null}
                {step}
            </div>
            <aside className={`${CLINIC_CARD} flex flex-col gap-4 self-start lg:sticky lg:top-6`}>
                <h2 className={`${CLINIC_HEADING} text-lg`}>{resolveLanguageKey("summary")}</h2>
                <dl className="flex flex-col gap-3 text-sm">
                    {summaryRow(String(resolveLanguageKey("service")), service ? `${service.name} · ${service.durationMinutes} ${resolveLanguageKey("minutes")}` : undefined, "service")}
                    {locations.length > 1 ? summaryRow(String(resolveLanguageKey("location")), location?.name, "location") : null}
                    {summaryRow(String(resolveLanguageKey("practitioner")), anyone ? String(resolveLanguageKey("anyone")) : practitioner?.displayName, "practitioner")}
                    {summaryRow(String(resolveLanguageKey("when")), date && time ? `${formatDay(date, languageCode)}, ${time}` : undefined, "date")}
                </dl>
                {service ? <p className="text-sm text-clinic-ink-muted">{resolveLanguageKey("price")}: {priceLabel(service, formatMoney, resolveLanguageKey)}</p> : null}
                {config.cancellationDeadlineHours > 0 ? (
                    <p className="text-xs text-clinic-ink-faded">
                        {String(resolveLanguageKey("cancelPolicy")).replace("{hours}", String(config.cancellationDeadlineHours))}
                    </p>
                ) : null}
            </aside>
        </div>
    );
}

function StepCard({title, children}: {title: string; children: ReactNode}) {
    return (
        <section className={`${CLINIC_CARD} flex flex-col gap-4`}>
            <h2 className={`${CLINIC_HEADING} text-xl`}>{title}</h2>
            {children}
        </section>
    );
}

export default compose(withLanguage("src/modules/dentalClinic/clients/client/public/book/index.tsx"))(BookPage);
