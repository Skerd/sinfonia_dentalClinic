import {compose} from "redux";
import {Link} from "react-router-dom";
import {useSectionBase} from "@coreModule/clients/portal/shared/sectionBase.tsx";
import {ArrowRight} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {bookableServices, useClinicConfig} from "../shared/clinicConfigContext.tsx";
import {priceLabel} from "../shared/clinicFormat.ts";
import {Button} from "@coreModule/components/ui/button.tsx";

function HomePage({resolveLanguageKey}: WithLanguageType) {
    const base = useSectionBase();
    const {config, formatMoney} = useClinicConfig();
    if (!config) return null;
    const bookable = new Set(bookableServices(config).map((service) => service._id));

    return (
        <div className="flex flex-col gap-16 sm:gap-20">
            <section className="rounded-3xl bg-muted px-6 py-16 sm:px-12 sm:py-24">
                <h1 className="font-display font-bold tracking-tight max-w-3xl text-4xl leading-[1.05] sm:text-6xl">{resolveLanguageKey("title")}</h1>
                <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">{resolveLanguageKey("subtitle")}</p>
                <Button asChild size="lg" className="mt-8"><Link to={`${base}/book`}>
                    {resolveLanguageKey("bookNow")}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                </Link></Button>
            </section>

            {config.services.length ? (
                <section className="flex flex-col gap-6">
                    <h2 className="font-display font-bold tracking-tight text-2xl sm:text-3xl">{resolveLanguageKey("servicesTitle")}</h2>
                    <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                        {config.services.map((service) => (
                            <li key={service._id}>
                                <Link to={`${base}/treatments/${service._id}`} className="group flex flex-col gap-3 rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                                    {service.images[0] ? (
                                        <img src={service.images[0]} alt="" className="aspect-[4/3] w-full rounded-2xl object-cover" loading="lazy" />
                                    ) : (
                                        <div className="aspect-[4/3] w-full rounded-2xl bg-muted" aria-hidden />
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-display text-xl font-bold tracking-tight">{service.name}</h3>
                                        {service.description ? <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{service.description}</p> : null}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {service.durationMinutes} {resolveLanguageKey("minutes")} · {priceLabel(service, formatMoney, resolveLanguageKey)}
                                    </p>
                                    {bookable.has(service._id) ? (
                                        <span className="inline-flex items-center gap-1 text-sm font-medium">
                                            {resolveLanguageKey("bookThis")}
                                            <ArrowRight className="h-4 w-4" aria-hidden />
                                        </span>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">{resolveLanguageKey("callToBook")}</p>
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            ) : null}

            {config.practitioners.length ? (
                <section className="flex flex-col gap-6">
                    <h2 className="font-display font-bold tracking-tight text-2xl sm:text-3xl">{resolveLanguageKey("teamTitle")}</h2>
                    <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                        {config.practitioners.map((practitioner) => {
                            const offered = practitioner.services.filter((id) => bookable.has(id));
                            const bookHref = offered.length === 1
                                ? `${base}/treatments/${offered[0]}?practitioner=${practitioner._id}`
                                : `${base}/book?practitioner=${practitioner._id}`;
                            return (
                                <li key={practitioner._id} className="flex gap-4">
                                    {practitioner.photo ? (
                                        <img src={practitioner.photo} alt="" className="h-20 w-20 shrink-0 rounded-full object-cover" loading="lazy" />
                                    ) : (
                                        <div className="h-20 w-20 shrink-0 rounded-full bg-muted" aria-hidden />
                                    )}
                                    <div className="flex flex-col gap-1">
                                        <h3 className="font-medium">{practitioner.displayName}</h3>
                                        <p className="text-sm text-muted-foreground">{practitioner.title || resolveLanguageKey(`role.${practitioner.role}`)}</p>
                                        {practitioner.languages.length ? <p className="text-xs text-muted-foreground">{practitioner.languages.join(" · ")}</p> : null}
                                        {practitioner.bio ? <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{practitioner.bio}</p> : null}
                                        {offered.length ? (
                                            <Button asChild variant="link" className="mt-1 inline-flex h-auto items-center gap-1 p-0 text-sm"><Link to={bookHref}>
                                                {resolveLanguageKey("bookWith")}
                                                <ArrowRight className="h-4 w-4" aria-hidden />
                                            </Link></Button>
                                        ) : null}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </section>
            ) : null}
        </div>
    );
}

export default compose(withLanguage("src/modules/dentalClinic/clients/client/public/home/index.tsx"))(HomePage);
