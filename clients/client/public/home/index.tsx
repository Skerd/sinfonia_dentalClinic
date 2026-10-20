import {compose} from "redux";
import {Link} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {bookableServices, useClinicConfig} from "../shared/clinicConfigContext.tsx";
import {priceLabel} from "../shared/clinicFormat.ts";
import {CLINIC_CARD, CLINIC_HEADING, CLINIC_PRIMARY_BUTTON} from "../shared/clinicStyles.ts";

function HomePage({resolveLanguageKey}: WithLanguageType) {
    const {config, formatMoney} = useClinicConfig();
    if (!config) return null;
    const bookable = new Set(bookableServices(config).map((service) => service._id));

    return (
        <div className="flex flex-col gap-12">
            <section className="flex flex-col items-start gap-5">
                <h1 className={`${CLINIC_HEADING} max-w-2xl text-3xl sm:text-5xl`}>{resolveLanguageKey("title")}</h1>
                <p className="max-w-xl text-lg text-clinic-ink-muted">{resolveLanguageKey("subtitle")}</p>
                <Link to="/book" className={CLINIC_PRIMARY_BUTTON}>{resolveLanguageKey("bookNow")}</Link>
            </section>

            {config.services.length ? (
                <section className="flex flex-col gap-4">
                    <h2 className={`${CLINIC_HEADING} text-2xl`}>{resolveLanguageKey("servicesTitle")}</h2>
                    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {config.services.map((service) => (
                            <li key={service._id} className={`${CLINIC_CARD} flex flex-col gap-3`}>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold">{service.name}</h3>
                                    {service.description ? <p className="mt-1 line-clamp-3 text-sm text-clinic-ink-muted">{service.description}</p> : null}
                                </div>
                                <p className="text-sm text-clinic-ink-muted">
                                    {service.durationMinutes} {resolveLanguageKey("minutes")} · {priceLabel(service, formatMoney, resolveLanguageKey)}
                                </p>
                                {bookable.has(service._id) ? (
                                    <Link to={`/book?service=${service._id}`} className="text-sm font-semibold text-clinic-accent hover:underline">
                                        {resolveLanguageKey("bookThis")}
                                    </Link>
                                ) : (
                                    <p className="text-sm text-clinic-ink-faded">{resolveLanguageKey("callToBook")}</p>
                                )}
                            </li>
                        ))}
                    </ul>
                </section>
            ) : null}

            {config.practitioners.length ? (
                <section className="flex flex-col gap-4">
                    <h2 className={`${CLINIC_HEADING} text-2xl`}>{resolveLanguageKey("teamTitle")}</h2>
                    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {config.practitioners.map((practitioner) => (
                            <li key={practitioner._id} className={`${CLINIC_CARD} flex gap-4`}>
                                {practitioner.photo ? (
                                    <img src={practitioner.photo} alt="" className="h-20 w-20 shrink-0 rounded-full object-cover" loading="lazy" />
                                ) : (
                                    <div className="h-20 w-20 shrink-0 rounded-full bg-clinic-accent-soft" aria-hidden />
                                )}
                                <div className="flex flex-col gap-1">
                                    <h3 className="font-semibold">{practitioner.displayName}</h3>
                                    <p className="text-sm text-clinic-ink-muted">{practitioner.title || resolveLanguageKey(`role.${practitioner.role}`)}</p>
                                    {practitioner.languages.length ? <p className="text-xs text-clinic-ink-faded">{practitioner.languages.join(" · ")}</p> : null}
                                    {practitioner.bio ? <p className="mt-1 line-clamp-3 text-sm text-clinic-ink-muted">{practitioner.bio}</p> : null}
                                    {practitioner.services.length ? (
                                        <Link to={`/book?practitioner=${practitioner._id}`} className="mt-1 text-sm font-semibold text-clinic-accent hover:underline">
                                            {resolveLanguageKey("bookWith")}
                                        </Link>
                                    ) : null}
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            ) : null}
        </div>
    );
}

export default compose(withLanguage("src/modules/dentalClinic/clients/client/public/home/index.tsx"))(HomePage);
