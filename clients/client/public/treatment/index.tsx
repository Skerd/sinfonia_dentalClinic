import {useEffect, useState} from "react";
import {compose} from "redux";
import {Link, useNavigate, useParams, useSearchParams} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {useSectionBase} from "@coreModule/clients/portal/shared/sectionBase.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import DetailPage, {DetailHeading, DetailPrice, DetailSection, DetailText} from "@coreModule/clients/portal/shared/detailPage.tsx";
import DetailGallery from "@coreModule/clients/portal/shared/detailGallery.tsx";
import PortalProviderCard from "@coreModule/clients/portal/shared/portalProviderCard.tsx";
import {bookableServices, useClinicConfig} from "../shared/clinicConfigContext.tsx";
import ClinicSlotPicker, {type PickedSlot} from "../shared/clinicSlotPicker.tsx";
import {ClinicPractitionerCard} from "../shared/clinicPractitionerCard.tsx";
import {priceLabel} from "../shared/clinicFormat.ts";
import type {ClinicStorefrontPractitioner} from "armonia/src/modules/dentalClinic/api/dentalClinic/public/clinicStorefront/clinicStorefront.response.types.ts";

const LANGUAGE_PATH = "src/modules/dentalClinic/clients/client/public/treatment/index.tsx";
const ANYONE = "any";

function TreatmentPage({resolveLanguageKey}: WithLanguageType) {
    const base = useSectionBase();
    // The address carries the treatment's slug; an older link with its id still opens it.
    const {serviceId: serviceParam = ""} = useParams();
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const {config, loading, formatMoney} = useClinicConfig();
    const service = config?.services.find((entry) => entry.slug === serviceParam || entry._id === serviceParam);
    const serviceId = service?._id ?? "";
    const canBook = Boolean(config && service && bookableServices(config).some((entry) => entry._id === service._id));
    const doers = config?.practitioners.filter((practitioner) => practitioner.services.includes(serviceId)) ?? [];
    const locations = config?.locations.filter((location) => doers.some((practitioner) => practitioner.locations.includes(location._id))) ?? [];
    const pinned = params.get("practitioner");
    const pinnedOk = Boolean(pinned && pinned !== ANYONE && doers.some((practitioner) => practitioner._id === pinned));

    const [locationId, setLocationId] = useState<string | null>(null);
    const [practitionerId, setPractitionerId] = useState(pinnedOk && pinned ? pinned : ANYONE);
    const [slot, setSlot] = useState<PickedSlot | null>(null);

    const location = locations.find((entry) => entry._id === locationId) ?? (locations.length === 1 ? locations[0] : undefined);
    const eligible = doers.filter((practitioner) => location && practitioner.locations.includes(location._id));

    useEffect(() => {
        setSlot(null);
    }, [location?._id, practitionerId]);

    if (loading) {
        return (
            <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr]" aria-busy="true" aria-label={resolveLanguageKey("loading")}>
                <div className="aspect-[4/3] animate-pulse rounded-3xl bg-muted" />
                <div className="flex flex-col gap-4 pt-4">
                    <div className="h-16 w-full animate-pulse rounded-2xl bg-muted" />
                    <div className="h-10 w-3/4 animate-pulse rounded bg-muted" />
                    <div className="h-8 w-1/3 animate-pulse rounded bg-muted" />
                </div>
            </div>
        );
    }

    if (!service) {
        return (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
                <h1 className="font-display text-3xl font-semibold">{resolveLanguageKey("notFound")}</h1>
                <p className="text-muted-foreground">{resolveLanguageKey("notFoundMessage")}</p>
                <Button asChild variant="link" className="h-auto p-0"><Link to={base}>{resolveLanguageKey("backToTreatments")}</Link></Button>
            </div>
        );
    }

    const chooseLocation = (id: string) => {
        setLocationId(id);
        const stillThere = doers.some((practitioner) => practitioner._id === practitionerId && practitioner.locations.includes(id));
        if (practitionerId !== ANYONE && !stillThere) setPractitionerId(ANYONE);
    };

    const choosePractitioner = (id: string) => {
        setPractitionerId(id);
        const practitioner = doers.find((entry) => entry._id === id);
        if (!practitioner) return;
        const theirs = locations.filter((entry) => practitioner.locations.includes(entry._id));
        if (theirs.length === 1) setLocationId(theirs[0]._id);
        else if (!location || !practitioner.locations.includes(location._id)) setLocationId(theirs[0]?._id ?? null);
    };

    const placesOf = (practitioner: ClinicStorefrontPractitioner) => {
        const names = (config?.locations ?? [])
            .filter((entry) => practitioner.locations.includes(entry._id))
            .map((entry) => entry.name);
        return names.length ? resolveLanguageKey("whoLocations").replace("{places}", names.join(" · ")) : undefined;
    };

    const continueToBook = () => {
        if (!location || !slot) return;
        navigate(`${base}/book?${new URLSearchParams({
            service: service._id,
            location: location._id,
            practitioner: practitionerId,
            date: slot.date,
            time: slot.time,
        })}`);
    };

    return (
        <DetailPage
            kind="treatment"
            title={service.name}
            media={<DetailGallery title={service.name} images={service.images} videos={service.videos} shape="landscape" placeholder />}
            story={(service.description || doers.length) ? (
                <>
                    {service.description ? (
                        <DetailSection title={resolveLanguageKey("description")}>
                            <DetailText>{service.description}</DetailText>
                        </DetailSection>
                    ) : null}
                    {doers.length ? (
                        <DetailSection title={resolveLanguageKey("whoTitle")}>
                            <ul className="flex flex-col gap-3">
                                {doers.map((practitioner) => (
                                    <li key={practitioner._id}>
                                        <ClinicPractitionerCard
                                            practitioner={practitioner}
                                            roleLabel={practitioner.title || resolveLanguageKey(`role.${practitioner.role}`)}
                                            locationsLabel={placesOf(practitioner)}
                                            selected={canBook && practitionerId === practitioner._id}
                                            onSelect={canBook ? () => choosePractitioner(practitioner._id) : undefined}
                                        />
                                    </li>
                                ))}
                            </ul>
                        </DetailSection>
                    ) : null}
                </>
            ) : undefined}
        >
            <PortalProviderCard kind="treatment" />
            <DetailHeading title={service.name}>
                <DetailPrice amount={priceLabel(service, formatMoney, resolveLanguageKey)} />
                <p className="text-sm text-muted-foreground">{service.durationMinutes} {resolveLanguageKey("minutes")}</p>
            </DetailHeading>

            {canBook ? (
                <DetailSection title={resolveLanguageKey("bookTitle")}>
                    <div className="flex flex-col gap-4">
                        {locations.length > 1 ? (
                            <fieldset className="flex flex-col gap-2">
                                <legend className="text-sm font-semibold">{resolveLanguageKey("chooseLocation")}</legend>
                                <div className="flex flex-wrap gap-2">
                                    {locations.map((entry) => (
                                        <Button
                                            key={entry._id}
                                            type="button"
                                            variant={location?._id === entry._id ? "default" : "outline"}
                                            aria-pressed={location?._id === entry._id}
                                            onClick={() => chooseLocation(entry._id)}
                                        >
                                            {entry.name}
                                        </Button>
                                    ))}
                                </div>
                            </fieldset>
                        ) : null}

                        {location ? (
                            <fieldset className="flex flex-col gap-2">
                                <legend className="text-sm font-semibold">{resolveLanguageKey("choosePractitioner")}</legend>
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        type="button"
                                        variant={practitionerId === ANYONE ? "default" : "outline"}
                                        aria-pressed={practitionerId === ANYONE}
                                        onClick={() => setPractitionerId(ANYONE)}
                                    >
                                        {resolveLanguageKey("anyone")}
                                    </Button>
                                    {eligible.map((practitioner) => (
                                        <Button
                                            key={practitioner._id}
                                            type="button"
                                            variant={practitionerId === practitioner._id ? "default" : "outline"}
                                            aria-pressed={practitionerId === practitioner._id}
                                            onClick={() => setPractitionerId(practitioner._id)}
                                        >
                                            {practitioner.displayName}
                                        </Button>
                                    ))}
                                </div>
                            </fieldset>
                        ) : null}

                        {location ? (
                            <ClinicSlotPicker
                                service={service._id}
                                location={location._id}
                                practitioner={practitionerId === ANYONE ? undefined : practitionerId}
                                selected={slot}
                                onPick={setSlot}
                                compact
                            />
                        ) : null}

                        <Button size="lg" type="button" className="w-full" disabled={!location || !slot} onClick={continueToBook}>
                            {resolveLanguageKey("continue")}
                        </Button>
                    </div>
                </DetailSection>
            ) : (
                <p className="text-sm text-muted-foreground">{resolveLanguageKey("callToBook")}</p>
            )}
        </DetailPage>
    );
}

export default compose(withLanguage(LANGUAGE_PATH))(TreatmentPage);
