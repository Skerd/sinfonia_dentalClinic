import {useRef, useState, type FormEvent, type ReactNode} from "react";
import {compose} from "redux";
import {Link, useNavigate, useSearchParams} from "react-router-dom";
import {useSectionBase} from "@coreModule/clients/portal/shared/sectionBase.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
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
import {Item, ItemContent, ItemDescription, ItemMedia, ItemTitle} from "@coreModule/components/ui/item.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {Textarea} from "@coreModule/components/ui/textarea.tsx";
import {Checkbox} from "@coreModule/components/ui/checkbox.tsx";

const PATIENT_KEYS = ["firstName", "lastName", "email", "phone"] as const;
type PatientKey = (typeof PATIENT_KEYS)[number];
type Patient = BookAppointmentFormType["patient"];
/** The wizard's choices, in order; changing one clears those after it. */
const STEPS = ["service", "location", "practitioner", "date", "time"] as const;
const ANYONE = "any";
const BOOK_REQUEST: HttpRequest = {method: "POST", url: "/api/dentalClinic/clinicStorefront/book"};

/**
 * Treatment → location → dentist (or anyone) → time → details. Every choice lives
 * in the URL, so the back button and a shared link land on the same step.
 */
function BookPage({resolveLanguageKey, languageCode}: WithLanguageType) {
    const base = useSectionBase();
    const {config, formatMoney} = useClinicConfig();
    const [params, setParams] = useSearchParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState<Patient>({firstName: "", lastName: "", email: "", phone: ""});
    const [note, setNote] = useState("");
    const [acceptPrivacy, setAcceptPrivacy] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const {fieldErrors, clearFieldError, showIssues} = useFieldErrors<PatientKey>(PATIENT_KEYS);
    // One key per booking attempt: a retried request after a lost response returns the same appointment.
    const idempotencyKey = useRef(generateUUID());

    const choose = (key: (typeof STEPS)[number], value: string | null, extra: Record<string, string> = {}) => {
        const next = new URLSearchParams(params);
        for (const step of STEPS.slice(STEPS.indexOf(key))) next.delete(step);
        if (value) next.set(key, value);
        for (const [k, v] of Object.entries(extra)) next.set(k, v);
        setParams(next);
        setFormError(null);
    };

    const [booking, setBooking] = useState<{body: BookAppointmentFormType | Record<string, never>; count: number}>({body: {}, count: 0});
    const {loading: submitting} = useHttpRequest<AppointmentBookingResponse>(BOOK_REQUEST, booking.body, booking.count, true, {
        success: (response) => navigate(`${base}/manage?${new URLSearchParams({token: response.data.manageToken, booked: "1"}).toString()}`),
        error: (e) => {
            const error = handleError(e, {context: "ClinicBook"});
            if (!error) return;
            // A rejected request created nothing, so the next attempt is a new booking.
            if (error.status && error.status < 500) idempotencyKey.current = generateUUID();
            if (error.code === "appointment_slot_unavailable" || error.code === "appointment_no_practitioner_available") choose("date", null);
            setFormError(error.displayMessage ?? String(resolveLanguageKey("bookingFailed")));
        },
    });

    if (!config) return null;



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

    const submit = (event: FormEvent) => {
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
        setBooking((current) => ({body, count: current.count + 1}));
    };

    const summaryRow = (label: string, value: string | undefined, step: (typeof STEPS)[number]) => value ? (
        <div className="flex items-start justify-between gap-3">
            <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
                <dd className="font-medium">{value}</dd>
            </div>
            <Button variant="link" type="button" className="h-auto p-0 text-sm" onClick={() => choose(step, null)}>{resolveLanguageKey("change")}</Button>
        </div>
    ) : null;

    let step: ReactNode;
    if (!services.length) {
        step = <p className="text-muted-foreground">{resolveLanguageKey("nothingBookable")}</p>;
    } else if (!service) {
        step = (
            <StepCard title={resolveLanguageKey("chooseService")}>
                <div className="grid gap-3 sm:grid-cols-2">
                    {services.map((s) => (
                        <Item key={s._id} asChild variant="outline" className="cursor-pointer text-left hover:bg-muted">
                            <Button type="button" variant="bare" onClick={() => choose("service", s._id)}>
                                <ItemContent>
                                    <ItemTitle>{s.name}</ItemTitle>
                                    <ItemDescription>{s.durationMinutes} {resolveLanguageKey("minutes")} · {priceLabel(s, formatMoney, resolveLanguageKey)}</ItemDescription>
                                </ItemContent>
                            </Button>
                        </Item>
                    ))}
                </div>
            </StepCard>
        );
    } else if (!location) {
        step = (
            <StepCard title={resolveLanguageKey("chooseLocation")}>
                <div className="grid gap-3 sm:grid-cols-2">
                    {locations.map((l) => (
                        <Item key={l._id} asChild variant="outline" className="cursor-pointer text-left hover:bg-muted">
                            <Button type="button" variant="bare" onClick={() => choose("location", l._id)}>
                                <ItemContent>
                                    <ItemTitle>{l.name}</ItemTitle>
                                    {l.address ? <ItemDescription>{l.address}</ItemDescription> : null}
                                </ItemContent>
                            </Button>
                        </Item>
                    ))}
                </div>
            </StepCard>
        );
    } else if (!practitioner && !anyone) {
        step = (
            <StepCard title={resolveLanguageKey("choosePractitioner")}>
                <div className="grid gap-3 sm:grid-cols-2">
                    <Item asChild variant="outline" className="cursor-pointer text-left hover:bg-muted">
                        <Button type="button" variant="bare" onClick={() => choose("practitioner", ANYONE)}>
                            <ItemContent>
                                <ItemTitle>{resolveLanguageKey("anyone")}</ItemTitle>
                                <ItemDescription>{resolveLanguageKey("anyoneHint")}</ItemDescription>
                            </ItemContent>
                        </Button>
                    </Item>
                    {eligible.map((p) => (
                        <Item key={p._id} asChild variant="outline" className="cursor-pointer text-left hover:bg-muted">
                            <Button type="button" variant="bare" onClick={() => choose("practitioner", p._id)}>
                                <ItemMedia variant="image" className="size-12 rounded-full bg-muted">
                                    {p.photo ? <img src={p.photo} alt="" /> : null}
                                </ItemMedia>
                                <ItemContent>
                                    <ItemTitle>{p.displayName}</ItemTitle>
                                    <ItemDescription>{p.title || resolveLanguageKey(`role.${p.role}`)}</ItemDescription>
                                </ItemContent>
                            </Button>
                        </Item>
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
                                <span className="text-sm font-medium">{resolveLanguageKey(`patient.${key}`)}</span>
                                <Input
                  
                  type={key === "email" ? "email" : key === "phone" ? "tel" : "text"}
                  autoComplete={key === "firstName" ? "given-name" : key === "lastName" ? "family-name" : key === "email" ? "email" : "tel"}
                  value={patient[key]}
                  onChange={(e) => updatePatient(key, e.target.value)}
                  aria-invalid={!!fieldErrors[key] || undefined}
                />
                                {fieldErrors[key] ? <span className="text-sm text-destructive">{fieldErrors[key]}</span> : null}
                            </label>
                        ))}
                        {config.patientNoteEnabled ? (
                            <label className="flex flex-col gap-1.5 sm:col-span-2">
                                <span className="text-sm font-medium">{resolveLanguageKey("note")}</span>
                                <Textarea className="h-24 py-2" maxLength={APPOINTMENT_NOTE_MAX} value={note} onChange={(e) => setNote(e.target.value)} />
                                <span className="text-xs text-muted-foreground">{resolveLanguageKey("noteHint")}</span>
                            </label>
                        ) : null}
                    </div>
                </StepCard>
                <div className="rounded-2xl bg-muted p-5 sm:p-6 flex flex-col gap-4">
                    <label className="flex items-start gap-3 text-sm">
                        <Checkbox className="mt-0.5" checked={acceptPrivacy} onCheckedChange={(checked) => setAcceptPrivacy(checked === true)} />
                        <span>
                            {resolveLanguageKey("acceptPrivacy")}{" "}
                            {config.privacyNoticeText ? <Button asChild variant="link" className="h-auto p-0"><Link to={`${base}/privacy`} target="_blank">{resolveLanguageKey("readPrivacy")}</Link></Button> : null}
                        </span>
                    </label>
                    {formError ? <p className="text-sm text-destructive" role="alert">{formError}</p> : null}
                    <Button size="lg" type="submit" className="w-full sm:w-auto" disabled={submitting}>
                        {resolveLanguageKey(submitting ? "booking" : config.requireStaffConfirmation ? "requestAppointment" : "confirmBooking")}
                    </Button>
                    {config.requireStaffConfirmation ? <p className="text-sm text-muted-foreground">{resolveLanguageKey("reviewedHint")}</p> : null}
                </div>
            </form>
        );
    }

    return (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="flex flex-col gap-6">
                <h1 className="font-display font-bold tracking-tight text-3xl sm:text-4xl">{resolveLanguageKey("title")}</h1>
                {formError && !(date && time) ? <p className="text-sm text-destructive" role="alert">{formError}</p> : null}
                {step}
            </div>
            <aside className="rounded-2xl bg-muted p-5 sm:p-6 flex flex-col gap-4 self-start lg:sticky lg:top-6">
                <h2 className="font-display font-bold tracking-tight text-lg">{resolveLanguageKey("summary")}</h2>
                <dl className="flex flex-col gap-3 text-sm">
                    {summaryRow(String(resolveLanguageKey("service")), service ? `${service.name} · ${service.durationMinutes} ${resolveLanguageKey("minutes")}` : undefined, "service")}
                    {locations.length > 1 ? summaryRow(String(resolveLanguageKey("location")), location?.name, "location") : null}
                    {summaryRow(String(resolveLanguageKey("practitioner")), anyone ? String(resolveLanguageKey("anyone")) : practitioner?.displayName, "practitioner")}
                    {summaryRow(String(resolveLanguageKey("when")), date && time ? `${formatDay(date, languageCode)}, ${time}` : undefined, "date")}
                </dl>
                {service ? <p className="text-sm text-muted-foreground">{resolveLanguageKey("price")}: {priceLabel(service, formatMoney, resolveLanguageKey)}</p> : null}
                {config.cancellationDeadlineHours > 0 ? (
                    <p className="text-xs text-muted-foreground">
                        {String(resolveLanguageKey("cancelPolicy")).replace("{hours}", String(config.cancellationDeadlineHours))}
                    </p>
                ) : null}
            </aside>
        </div>
    );
}

function StepCard({title, children}: {title: string; children: ReactNode}) {
    return (
        <section className="rounded-2xl bg-muted p-5 sm:p-6 flex flex-col gap-4">
            <h2 className="font-display font-bold tracking-tight text-xl">{title}</h2>
            {children}
        </section>
    );
}

export default compose(withLanguage("src/modules/dentalClinic/clients/client/public/book/index.tsx"))(BookPage);
