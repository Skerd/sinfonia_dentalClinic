import {compose} from "redux";
import {useId, useMemo, useRef, useState, type FormEvent} from "react";
import {Link, useLocation} from "react-router-dom";
import {IconFileUpload, IconX} from "@tabler/icons-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Checkbox} from "@coreModule/components/ui/checkbox.tsx";
import {Field, FieldLabel} from "@coreModule/components/ui/field.tsx";
import {Textarea} from "@coreModule/components/ui/textarea.tsx";
import FormField from "@coreModule/clients/portal/shared/formField.tsx";
import FormStatus from "@coreModule/clients/portal/shared/formStatus.tsx";
import {usePortalSession} from "@coreModule/clients/portal/shared/portalSession.tsx";
import {
    INQUIRY_DESCRIPTION_MAX,
    INQUIRY_FILES_MAX,
    PATIENT_FILE_MIME_TYPES,
    PATIENT_LANGUAGES,
    TREATMENT_CATEGORIES,
    type PatientLanguage,
    type TreatmentCategory,
} from "armonia/src/modules/dentalClinic/constants/index.ts";
import type {CreatePatientRequestFormType} from "armonia/src/modules/dentalClinic/api/dentalClinic/public/patientPortal/patientPortal.forms.ts";
import type {
    PatientFile,
    PatientRequestCreatedResponse,
    PatientUploadResponse,
} from "armonia/src/modules/dentalClinic/api/dentalClinic/public/patientPortal/patientPortal.response.types.ts";

/** The version of the consent text below; stored on every inquiry it was given for. */
const PATIENT_REQUEST_CONSENT_VERSION = "2026-10";

type Props = WithLanguageType & {
    /** The clinics this request goes to (one on a clinic's own site, up to five on the portal). */
    clinics: {_id: string; name: string}[];
};

const fileTypes = PATIENT_FILE_MIME_TYPES.join(",") + ",.dcm,.stl,.zip";

/**
 * One estimate request: what the patient needs, their X-rays or photos, when they could travel.
 * It needs a portal account, so the patient can follow each clinic's answer in one place.
 */
function PatientRequestForm({clinics, resolveLanguageKey, languageCode}: Props) {
    const location = useLocation();
    const {isAuthenticated, user} = usePortalSession();
    const descriptionId = useId();
    const fileInput = useRef<HTMLInputElement>(null);
    const idempotencyKey = useMemo(() => crypto.randomUUID(), []);
    const preferredLanguage: PatientLanguage = PATIENT_LANGUAGES.find((language) => language === languageCode) ?? "en-US";

    const [treatments, setTreatments] = useState<TreatmentCategory[]>([]);
    const [description, setDescription] = useState("");
    const [travelFrom, setTravelFrom] = useState("");
    const [travelTo, setTravelTo] = useState("");
    const [contact, setContact] = useState({firstName: user.name, lastName: user.surname, email: user.email, phone: user.phoneNumber ?? "", whatsapp: ""});
    const [files, setFiles] = useState<PatientFile[]>([]);
    const [consent, setConsent] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [state, setState] = useState<"idle" | "sending" | "failed">("idle");
    const [error, setError] = useState<string | null>(null);
    const [sent, setSent] = useState<string | null>(null);

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col gap-3 rounded-2xl border p-6">
                <p className="font-medium">{resolveLanguageKey("signInTitle")}</p>
                <p className="text-sm text-muted-foreground">{resolveLanguageKey("signInText")}</p>
                <Button asChild className="self-start">
                    <Link to={`/login?next=${encodeURIComponent(`${location.pathname}${location.search}`)}`}>{resolveLanguageKey("signIn")}</Link>
                </Button>
            </div>
        );
    }

    if (sent) {
        return (
            <div className="flex flex-col gap-3 rounded-2xl border p-6">
                <FormStatus tone="success">{resolveLanguageKey("sent")}</FormStatus>
                <Button asChild className="self-start"><Link to={`/account?case=${encodeURIComponent(sent)}`}>{resolveLanguageKey("openCase")}</Link></Button>
            </div>
        );
    }

    const toggleTreatment = (treatment: TreatmentCategory, checked: boolean) =>
        setTreatments((current) => (checked ? [...current, treatment] : current.filter((entry) => entry !== treatment)));

    const upload = async (picked: File[]) => {
        if (!picked.length) return;
        const form = new FormData();
        for (const file of picked.slice(0, INQUIRY_FILES_MAX - files.length)) form.append("files", file);
        setUploading(true);
        setError(null);
        try {
            const res = await apiClient.post<PatientUploadResponse>("/api/dentalClinic/patientPortal/upload", form);
            setFiles((current) => [...current, ...res.data.data]);
        } catch {
            setError(String(resolveLanguageKey("uploadFailed")));
        } finally {
            setUploading(false);
            if (fileInput.current) fileInput.current.value = "";
        }
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (!treatments.length) {
            setError(String(resolveLanguageKey("pickTreatment")));
            return;
        }
        const body: CreatePatientRequestFormType = {
            clinics: clinics.map((clinic) => clinic._id),
            contact: {
                firstName: contact.firstName,
                lastName: contact.lastName,
                ...(contact.email ? {email: contact.email} : {}),
                ...(contact.phone ? {phone: contact.phone} : {}),
                ...(contact.whatsapp ? {whatsapp: contact.whatsapp} : {}),
                preferredLanguage,
            },
            treatmentsWanted: treatments,
            ...(description.trim() ? {description: description.trim()} : {}),
            ...(travelFrom ? {travelFrom} : {}),
            ...(travelTo ? {travelTo} : {}),
            files: files.map((file) => file._id),
            acceptConsent: consent,
            consentVersion: PATIENT_REQUEST_CONSENT_VERSION,
            idempotencyKey,
        };
        setState("sending");
        setError(null);
        apiClient.post<PatientRequestCreatedResponse>("/api/dentalClinic/patientPortal/requests", body)
            .then((res) => setSent(res.data.data.requestGroup))
            .catch(() => setState("failed"));
    };

    return (
        <form className="flex flex-col gap-6" onSubmit={submit}>
            <p className="text-sm text-muted-foreground">
                {resolveLanguageKey("sendingTo")} <span className="font-medium text-foreground">{clinics.map((clinic) => clinic.name).join(", ")}</span>
            </p>

            <fieldset className="flex flex-col gap-3">
                <legend className="mb-2 text-sm font-semibold">{resolveLanguageKey("treatmentsTitle")}</legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {TREATMENT_CATEGORIES.map((treatment) => (
                        <label key={treatment} className="flex items-center gap-2 text-sm">
                            <Checkbox checked={treatments.includes(treatment)} onCheckedChange={(checked) => toggleTreatment(treatment, checked === true)} />
                            {resolveLanguageKey(`treatment.${treatment}`)}
                        </label>
                    ))}
                </div>
            </fieldset>

            <Field>
                <FieldLabel htmlFor={descriptionId}>{resolveLanguageKey("descriptionLabel")}</FieldLabel>
                <Textarea
                    id={descriptionId}
                    rows={4}
                    maxLength={INQUIRY_DESCRIPTION_MAX}
                    value={description}
                    placeholder={resolveLanguageKey("descriptionPlaceholder")}
                    onChange={(event) => setDescription(event.target.value)}
                />
            </Field>

            <section className="flex flex-col gap-2">
                <p className="text-sm font-semibold">{resolveLanguageKey("filesTitle")}</p>
                <p className="text-sm text-muted-foreground">{resolveLanguageKey("filesHint")}</p>
                <input ref={fileInput} type="file" multiple hidden accept={fileTypes} onChange={(event) => upload([...(event.target.files ?? [])])} />
                <Button type="button" variant="outline" className="self-start" disabled={uploading || files.length >= INQUIRY_FILES_MAX} onClick={() => fileInput.current?.click()}>
                    <IconFileUpload size={16} />
                    {resolveLanguageKey(uploading ? "uploading" : "addFiles")}
                </Button>
                {files.length ? (
                    <ul className="flex flex-col gap-1 text-sm">
                        {files.map((file) => (
                            <li key={file._id} className="flex items-center gap-2">
                                <span className="truncate">{file.name}</span>
                                <Button type="button" variant="ghost" size="icon" aria-label={String(resolveLanguageKey("removeFile"))} onClick={() => setFiles((current) => current.filter((entry) => entry._id !== file._id))}>
                                    <IconX size={14} />
                                </Button>
                            </li>
                        ))}
                    </ul>
                ) : null}
            </section>

            <div className="grid gap-4 sm:grid-cols-2">
                <FormField type="date" label={resolveLanguageKey("travelFrom")} value={travelFrom} onChange={(event) => setTravelFrom(event.target.value)} />
                <FormField type="date" label={resolveLanguageKey("travelTo")} min={travelFrom || undefined} value={travelTo} onChange={(event) => setTravelTo(event.target.value)} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <FormField required autoComplete="given-name" label={resolveLanguageKey("firstName")} value={contact.firstName} onChange={(event) => setContact((current) => ({...current, firstName: event.target.value}))} />
                <FormField required autoComplete="family-name" label={resolveLanguageKey("lastName")} value={contact.lastName} onChange={(event) => setContact((current) => ({...current, lastName: event.target.value}))} />
                <FormField type="email" autoComplete="email" label={resolveLanguageKey("email")} value={contact.email} onChange={(event) => setContact((current) => ({...current, email: event.target.value}))} />
                <FormField type="tel" autoComplete="tel" label={resolveLanguageKey("phone")} value={contact.phone} onChange={(event) => setContact((current) => ({...current, phone: event.target.value}))} />
                <FormField type="tel" label={resolveLanguageKey("whatsapp")} value={contact.whatsapp} onChange={(event) => setContact((current) => ({...current, whatsapp: event.target.value}))} />
            </div>
            <p className="text-xs text-muted-foreground">{resolveLanguageKey("privacyHint")}</p>

            <label className="flex items-start gap-2 text-sm">
                <Checkbox checked={consent} onCheckedChange={(checked) => setConsent(checked === true)} className="mt-0.5" />
                <span>{resolveLanguageKey("consent")}</span>
            </label>
            <p className="text-xs text-muted-foreground">{resolveLanguageKey("disclaimer")}</p>

            {error ? <FormStatus tone="error">{error}</FormStatus> : null}
            {state === "failed" ? <FormStatus tone="error">{resolveLanguageKey("failed")}</FormStatus> : null}
            <Button type="submit" size="lg" disabled={state === "sending" || uploading || !consent || !clinics.length}>
                {resolveLanguageKey(clinics.length > 1 ? "sendMany" : "send")}
            </Button>
        </form>
    );
}

export default compose(withLanguage("src/modules/dentalClinic/clients/portal/request/patientRequestForm.tsx"))(PatientRequestForm);
