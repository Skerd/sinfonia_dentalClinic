import {compose} from "redux";
import {IconCertificate, IconLanguage, IconPlane, IconShieldCheck} from "@tabler/icons-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {languageNames} from "../shared/clinicFormat.ts";
import type {ClinicStorefrontProfile} from "armonia/src/modules/dentalClinic/api/dentalClinic/public/clinicStorefront/clinicStorefront.response.types.ts";

type Props = WithLanguageType & {profile: ClinicStorefrontProfile};

/** What a patient travelling from abroad wants to know: languages, brands, warranty, how to get here. */
function ClinicProfileSection({profile, resolveLanguageKey}: Props) {
    const hasFacts = profile.languagesSpoken.length || profile.implantBrands.length || profile.nearestAirport || profile.accreditations.length;
    if (!profile.description && !hasFacts && !profile.gallery.length && !profile.warrantyPolicy && !profile.travelInfo) return null;

    return (
        <section className="flex flex-col gap-8">
            {profile.description ? (
                <div className="flex max-w-3xl flex-col gap-3">
                    <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{resolveLanguageKey("aboutTitle")}</h2>
                    <p className="whitespace-pre-line leading-relaxed text-muted-foreground">{profile.description}</p>
                </div>
            ) : null}

            {profile.gallery.length ? (
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {profile.gallery.map((src) => (
                        <li key={src}><img src={src} alt="" className="aspect-[4/3] w-full rounded-2xl object-cover" loading="lazy" /></li>
                    ))}
                </ul>
            ) : null}

            {hasFacts ? (
                <dl className="grid gap-6 sm:grid-cols-2">
                    {profile.languagesSpoken.length ? (
                        <div className="flex gap-3">
                            <IconLanguage className="mt-0.5 shrink-0" size={20} aria-hidden />
                            <div><dt className="font-medium">{resolveLanguageKey("languages")}</dt><dd className="text-sm text-muted-foreground">{languageNames(profile.languagesSpoken)}</dd></div>
                        </div>
                    ) : null}
                    {profile.implantBrands.length ? (
                        <div className="flex gap-3">
                            <IconShieldCheck className="mt-0.5 shrink-0" size={20} aria-hidden />
                            <div>
                                <dt className="font-medium">{resolveLanguageKey("implantBrands")}</dt>
                                <dd className="mt-1 flex flex-wrap gap-1.5">{profile.implantBrands.map((brand) => <Badge key={brand} variant="secondary">{brand}</Badge>)}</dd>
                            </div>
                        </div>
                    ) : null}
                    {profile.nearestAirport ? (
                        <div className="flex gap-3">
                            <IconPlane className="mt-0.5 shrink-0" size={20} aria-hidden />
                            <div><dt className="font-medium">{resolveLanguageKey("airport")}</dt><dd className="text-sm text-muted-foreground">{profile.nearestAirport}</dd></div>
                        </div>
                    ) : null}
                    {profile.accreditations.length ? (
                        <div className="flex gap-3">
                            <IconCertificate className="mt-0.5 shrink-0" size={20} aria-hidden />
                            <div>
                                <dt className="font-medium">{resolveLanguageKey("accreditations")}</dt>
                                <dd className="text-sm text-muted-foreground">
                                    {profile.accreditations.map((entry) => [entry.title, entry.issuer, entry.year].filter(Boolean).join(", ")).join(" · ")}
                                </dd>
                            </div>
                        </div>
                    ) : null}
                </dl>
            ) : null}

            {profile.warrantyPolicy || profile.travelInfo ? (
                <div className="grid gap-6 sm:grid-cols-2">
                    {profile.warrantyPolicy ? (
                        <div className="flex flex-col gap-2 rounded-2xl border p-5">
                            <h3 className="font-medium">{resolveLanguageKey("warranty")}</h3>
                            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{profile.warrantyPolicy}</p>
                        </div>
                    ) : null}
                    {profile.travelInfo ? (
                        <div className="flex flex-col gap-2 rounded-2xl border p-5">
                            <h3 className="font-medium">{resolveLanguageKey("travel")}</h3>
                            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{profile.travelInfo}</p>
                        </div>
                    ) : null}
                </div>
            ) : null}
        </section>
    );
}

export default compose(withLanguage("src/modules/dentalClinic/clients/client/public/home/clinicProfileSection.tsx"))(ClinicProfileSection);
