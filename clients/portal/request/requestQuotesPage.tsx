import {compose} from "redux";
import {useMemo, useState} from "react";
import {useSearchParams} from "react-router-dom";
import {IconClockHour4, IconLanguage, IconLock, IconMapPin, IconArrowDown, IconArrowUpRight, IconCheck, IconSearch, IconX} from "@tabler/icons-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {Avatar, AvatarFallback, AvatarImage} from "@coreModule/components/ui/avatar.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Checkbox} from "@coreModule/components/ui/checkbox.tsx";
import {Empty, EmptyDescription, EmptyHeader, EmptyTitle} from "@coreModule/components/ui/empty.tsx";
import {InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput} from "@coreModule/components/ui/input-group.tsx";
import {Skeleton} from "@coreModule/components/ui/skeleton.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {useSectionBase} from "@coreModule/clients/portal/shared/sectionBase.tsx";
import {INQUIRY_MAX_CLINICS, TREATMENT_CATEGORIES, type TreatmentCategory} from "armonia/src/modules/dentalClinic/constants/index.ts";
import type {
    RequestableClinic,
    RequestableClinicsResponse,
} from "armonia/src/modules/dentalClinic/api/dentalClinic/public/patientPortal/patientPortal.response.types.ts";
import PatientRequestForm from "./patientRequestForm.tsx";

type ResolveLanguageKey = WithLanguageType["resolveLanguageKey"];

const FORM_ID = "estimate-request";
const CLINICS_REQUEST: HttpRequest = {method: "POST", url: "/api/dentalClinic/patientPortal/clinics", cache: true};
const STEPS = ["choose", "describe", "compare"] as const;

/** Compare without case or accents, so "durres" finds "Durrës". */
function fold(value: string) {
    return value.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Everything a visitor might search a clinic by: name, headline, cities, languages, implant brands. */
function searchText(clinic: RequestableClinic) {
    return fold([clinic.name, clinic.headline ?? "", ...clinic.cities, ...clinic.languagesSpoken, ...clinic.implantBrands].join(" "));
}

function ClinicAvatar({clinic, className}: {clinic: RequestableClinic; className?: string}) {
    return (
        <Avatar className={cn("rounded-xl bg-muted", className)}>
            {clinic.logo ? <AvatarImage src={clinic.logo} alt="" className="object-contain p-1" /> : null}
            <AvatarFallback className="rounded-xl font-display font-bold">{clinic.name.slice(0, 2)}</AvatarFallback>
        </Avatar>
    );
}

/** One clinic in the list; the whole card ticks it. */
function ClinicCard({clinic, checked, full, onToggle, resolveLanguageKey}: {
    clinic: RequestableClinic;
    checked: boolean;
    full: boolean;
    onToggle: (checked: boolean) => void;
    resolveLanguageKey: ResolveLanguageKey;
}) {
    const base = useSectionBase();
    const id = `clinic-${clinic._id}`;

    return (
        <li
            className={cn(
                "relative flex h-full flex-col gap-4 rounded-2xl border bg-card p-5 transition-colors",
                checked ? "border-primary ring-1 ring-primary" : "hover:border-foreground/25",
                full && "opacity-60",
            )}
        >
            <div className="flex items-start gap-3">
                <ClinicAvatar clinic={clinic} className="size-12" />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <label htmlFor={id} className={cn("font-medium leading-snug after:absolute after:inset-0 after:rounded-2xl", full ? "cursor-not-allowed" : "cursor-pointer")}>
                        {clinic.name}
                    </label>
                    {clinic.cities.length ? (
                        <p className="flex items-center gap-1 text-sm text-muted-foreground"><IconMapPin size={14} aria-hidden />{clinic.cities.join(", ")}</p>
                    ) : null}
                </div>
                <Checkbox id={id} checked={checked} disabled={full} onCheckedChange={(next) => onToggle(next === true)} className="relative mt-1 size-5" />
            </div>

            {clinic.headline ? <p className="line-clamp-2 text-sm text-muted-foreground">{clinic.headline}</p> : null}

            <div className="mt-auto flex flex-col gap-3">
                <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                    {clinic.languagesSpoken.length ? (
                        <p className="flex items-center gap-1.5"><IconLanguage size={14} aria-hidden />{clinic.languagesSpoken.join(" · ")}</p>
                    ) : null}
                    {clinic.medianFirstResponseHours ? (
                        <p className="flex items-center gap-1.5">
                            <IconClockHour4 size={14} aria-hidden />
                            {resolveLanguageKey("usuallyAnswers").replace("{hours}", String(clinic.medianFirstResponseHours))}
                        </p>
                    ) : null}
                </div>
                {clinic.implantBrands.length ? (
                    <div className="flex flex-wrap gap-1">{clinic.implantBrands.map((brand) => <Badge key={brand} variant="secondary">{brand}</Badge>)}</div>
                ) : null}
                <a
                    href={`${base}/${clinic.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative inline-flex items-center gap-1 self-start text-sm font-medium text-primary hover:underline"
                >
                    {resolveLanguageKey("viewClinic")}
                    <IconArrowUpRight className="size-3.5" aria-hidden />
                </a>
            </div>
        </li>
    );
}

/** The clinics chosen so far, with a way to drop one and to move on to the request. */
function Selection({clinics, onRemove, resolveLanguageKey}: {
    clinics: RequestableClinic[];
    onRemove: (id: string) => void;
    resolveLanguageKey: ResolveLanguageKey;
}) {
    const count = resolveLanguageKey("chosen").replace("{count}", String(clinics.length)).replace("{max}", String(INQUIRY_MAX_CLINICS));

    return (
        <div className="flex flex-col gap-4 rounded-3xl border bg-card p-5 shadow-sm">
            <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-display text-lg font-bold tracking-tight">{resolveLanguageKey("selectionTitle")}</h2>
                <span className="text-sm text-muted-foreground tabular-nums">{count}</span>
            </div>
            <div className="flex gap-1" aria-hidden>
                {Array.from({length: INQUIRY_MAX_CLINICS}, (_, index) => (
                    <span key={index} className={cn("h-1.5 flex-1 rounded-full", index < clinics.length ? "bg-primary" : "bg-muted")} />
                ))}
            </div>
            {clinics.length ? (
                <ul className="flex flex-col gap-2">
                    {clinics.map((clinic) => (
                        <li key={clinic._id} className="flex items-center gap-3 rounded-xl bg-muted/60 p-2">
                            <ClinicAvatar clinic={clinic} className="size-8" />
                            <span className="min-w-0 flex-1 truncate text-sm font-medium">{clinic.name}</span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-7"
                                aria-label={resolveLanguageKey("remove").replace("{name}", clinic.name)}
                                onClick={() => onRemove(clinic._id)}
                            >
                                <IconX className="size-4" aria-hidden />
                            </Button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-muted-foreground">{resolveLanguageKey("selectionEmpty").replace("{max}", String(INQUIRY_MAX_CLINICS))}</p>
            )}
            {clinics.length ? (
                <Button asChild size="lg"><a href={`#${FORM_ID}`}>{resolveLanguageKey("continue")}<IconArrowDown className="size-4" aria-hidden /></a></Button>
            ) : (
                <Button size="lg" disabled>{resolveLanguageKey("continue")}</Button>
            )}
            <p className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
                <IconLock size={14} className="mt-0.5 shrink-0" aria-hidden />
                {resolveLanguageKey("privacyNote")}
            </p>
        </div>
    );
}

/**
 * Compare the clinics taking estimate requests and send one request to up to five of them.
 * `?clinic=<id>` starts with that clinic picked.
 */
function RequestQuotesPage({resolveLanguageKey}: WithLanguageType) {
    const [searchParams] = useSearchParams();
    const requestable = useHttpRequest<RequestableClinicsResponse>(CLINICS_REQUEST, {}, 1);
    const clinics: RequestableClinic[] | null = requestable.error ? [] : requestable.data?.data ?? null;
    const [picked, setPicked] = useState<string[]>(() => searchParams.getAll("clinic").slice(0, INQUIRY_MAX_CLINICS));
    const [treatment, setTreatment] = useState<TreatmentCategory | "">("");
    const [query, setQuery] = useState("");


    const indexed = useMemo(() => (clinics ?? []).map((clinic) => ({clinic, text: searchText(clinic)})), [clinics]);
    const needle = fold(query.trim());
    const shown = indexed
        .filter(({clinic, text}) => (!treatment || clinic.treatmentCategories.includes(treatment)) && (!needle || text.includes(needle)))
        .map(({clinic}) => clinic);
    const pickedClinics = picked.flatMap((id) => (clinics ?? []).filter((clinic) => clinic._id === id));
    const categories = TREATMENT_CATEGORIES.filter((category) => (clinics ?? []).some((clinic) => clinic.treatmentCategories.includes(category)));
    const full = picked.length >= INQUIRY_MAX_CLINICS;

    const toggle = (id: string, checked: boolean) =>
        setPicked((current) => (checked ? [...current, id].slice(0, INQUIRY_MAX_CLINICS) : current.filter((entry) => entry !== id)));

    return (
        <div className="site-container flex flex-col gap-12 py-8 sm:gap-16 sm:py-12">
            <header className="flex flex-col gap-8 rounded-3xl bg-muted px-6 py-10 sm:px-10 sm:py-14">
                <div className="flex max-w-3xl flex-col gap-3">
                    <h1 className="font-display text-3xl leading-tight font-bold tracking-tight sm:text-5xl">{resolveLanguageKey("title")}</h1>
                    <p className="text-lg leading-relaxed text-muted-foreground">{resolveLanguageKey("subtitle").replace("{max}", String(INQUIRY_MAX_CLINICS))}</p>
                </div>
                <ol className="grid gap-4 sm:grid-cols-3">
                    {STEPS.map((step, index) => (
                        <li key={step} className="flex gap-3 rounded-2xl bg-background p-4">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{index + 1}</span>
                            <div className="flex flex-col gap-0.5">
                                <p className="font-medium">{resolveLanguageKey(`steps.${step}.title`)}</p>
                                <p className="text-sm text-muted-foreground">{resolveLanguageKey(`steps.${step}.text`).replace("{max}", String(INQUIRY_MAX_CLINICS))}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </header>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
                <section className="flex flex-col gap-5" aria-labelledby="estimate-clinics">
                    <h2 id="estimate-clinics" className="font-display text-2xl font-bold tracking-tight">{resolveLanguageKey("chooseTitle")}</h2>

                    <InputGroup className="h-12 rounded-2xl bg-card">
                        <InputGroupAddon><IconSearch aria-hidden /></InputGroupAddon>
                        <InputGroupInput
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder={resolveLanguageKey("searchPlaceholder")}
                            aria-label={resolveLanguageKey("searchLabel")}
                        />
                        {query ? (
                            <InputGroupAddon align="inline-end">
                                <InputGroupButton size="icon-xs" aria-label={resolveLanguageKey("clearSearch")} onClick={() => setQuery("")}>
                                    <IconX aria-hidden />
                                </InputGroupButton>
                            </InputGroupAddon>
                        ) : null}
                    </InputGroup>

                    {categories.length ? (
                        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible">
                            {[{value: "" as const, label: resolveLanguageKey("allTreatments")}, ...categories.map((category) => ({value: category, label: resolveLanguageKey(`treatment.${category}`)}))].map(({value, label}) => (
                                <Button
                                    key={value || "all"}
                                    type="button"
                                    size="sm"
                                    variant={treatment === value ? "default" : "outline"}
                                    className="shrink-0 rounded-full"
                                    aria-pressed={treatment === value}
                                    onClick={() => setTreatment(value)}
                                >
                                    {treatment === value && value ? <IconCheck className="size-3.5" aria-hidden /> : null}
                                    {label}
                                </Button>
                            ))}
                        </div>
                    ) : null}

                    {clinics === null ? (
                        <ul className="grid gap-4 sm:grid-cols-2">
                            {Array.from({length: 4}, (_, index) => <li key={index}><Skeleton className="h-48 rounded-2xl" /></li>)}
                        </ul>
                    ) : shown.length === 0 ? (
                        <Empty className="rounded-3xl bg-muted py-16">
                            <EmptyHeader>
                                <EmptyTitle className="font-display text-xl font-bold">{resolveLanguageKey("noMatchTitle")}</EmptyTitle>
                                <EmptyDescription>{resolveLanguageKey(clinics.length ? "noMatchHint" : "noClinics")}</EmptyDescription>
                            </EmptyHeader>
                            {query || treatment ? (
                                <Button type="button" variant="outline" className="bg-background" onClick={() => { setQuery(""); setTreatment(""); }}>
                                    {resolveLanguageKey("clearFilters")}
                                </Button>
                            ) : null}
                        </Empty>
                    ) : (
                        <>
                            <p className="text-sm text-muted-foreground" aria-live="polite">
                                {shown.length === 1 ? resolveLanguageKey("resultsOne") : resolveLanguageKey("results").replace("{count}", String(shown.length))}
                                {full ? ` · ${resolveLanguageKey("full").replace("{max}", String(INQUIRY_MAX_CLINICS))}` : ""}
                            </p>
                            <ul className="grid gap-4 sm:grid-cols-2">
                                {shown.map((clinic) => {
                                    const checked = picked.includes(clinic._id);
                                    return (
                                        <ClinicCard
                                            key={clinic._id}
                                            clinic={clinic}
                                            checked={checked}
                                            full={!checked && full}
                                            onToggle={(next) => toggle(clinic._id, next)}
                                            resolveLanguageKey={resolveLanguageKey}
                                        />
                                    );
                                })}
                            </ul>
                        </>
                    )}

                    {pickedClinics.length ? (
                        <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-2xl border bg-background/95 p-3 pl-4 shadow-lg backdrop-blur lg:hidden">
                            <span className="text-sm font-medium tabular-nums">
                                {resolveLanguageKey("chosen").replace("{count}", String(pickedClinics.length)).replace("{max}", String(INQUIRY_MAX_CLINICS))}
                            </span>
                            <Button asChild size="sm"><a href={`#${FORM_ID}`}>{resolveLanguageKey("continue")}<IconArrowDown className="size-4" aria-hidden /></a></Button>
                        </div>
                    ) : null}
                </section>

                <aside className="hidden lg:sticky lg:top-28 lg:block">
                    <Selection clinics={pickedClinics} onRemove={(id) => toggle(id, false)} resolveLanguageKey={resolveLanguageKey} />
                </aside>
            </div>

            <section id={FORM_ID} className="mx-auto flex w-full max-w-3xl scroll-mt-28 flex-col gap-6 rounded-3xl border bg-card p-6 shadow-sm sm:p-10">
                <div className="flex flex-col gap-1.5">
                    <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{resolveLanguageKey("formTitle")}</h2>
                    <p className="text-muted-foreground">{resolveLanguageKey("formSubtitle")}</p>
                </div>
                {pickedClinics.length ? (
                    <PatientRequestForm clinics={pickedClinics.map(({_id, name}) => ({_id, name}))} />
                ) : (
                    <p className="rounded-2xl bg-muted p-6 text-center text-muted-foreground">{resolveLanguageKey("pickFirst")}</p>
                )}
            </section>
        </div>
    );
}

export default compose(withLanguage("src/modules/dentalClinic/clients/portal/request/requestQuotesPage.tsx"))(RequestQuotesPage);
