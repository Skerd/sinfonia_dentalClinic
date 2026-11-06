import {compose} from "redux";
import {Link} from "react-router-dom";
import {IconDental, IconArrowRight} from "@tabler/icons-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {Button} from "@coreModule/components/ui/button.tsx";
import {usePortalSession} from "@coreModule/clients/portal/shared/portalSession.tsx";
import {usePortalSite} from "@coreModule/clients/portal/shared/portalSiteContext.tsx";
import {useSectionBase} from "@coreModule/clients/portal/shared/sectionBase.tsx";
import type {RequestableClinicsResponse} from "armonia/src/modules/dentalClinic/api/dentalClinic/public/patientPortal/patientPortal.response.types.ts";

const CLINICS_REQUEST: HttpRequest = {method: "POST", url: "/api/dentalClinic/patientPortal/clinics"};

/**
 * "Get an estimate" on top of the dentists' tab, shown when a clinic here takes requests. On the
 * portal it opens the compare-and-request page, on a clinic's own site that clinic's request form.
 * Sending a request needs an account, so signed-out visitors sign in or up first.
 */
function EstimateBanner({resolveLanguageKey}: WithLanguageType) {
    const base = useSectionBase();
    const {site} = usePortalSite();
    const {isAuthenticated} = usePortalSession();
    const requestable = useHttpRequest<RequestableClinicsResponse>(CLINICS_REQUEST, {}, 1);
    const clinics = requestable.data?.data.length ?? 0;

    if (!clinics) return null;
    const companySite = site?.scope === "company";
    const target = `${base}/${companySite ? "request" : "request-quotes"}`;
    const href = isAuthenticated ? target : `/login?next=${encodeURIComponent(target)}`;

    return (
        <section className="flex flex-col gap-5 rounded-3xl border border-primary/20 bg-primary/5 p-6 sm:flex-row sm:items-center sm:gap-6 sm:p-8">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground" aria-hidden>
                <IconDental size={30} stroke={1.6} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">{resolveLanguageKey(companySite ? "titleClinic" : "title")}</h2>
                <p className="text-muted-foreground">
                    {resolveLanguageKey(companySite ? "subtitleClinic" : "subtitle")}
                </p>
                {!isAuthenticated ? <p className="text-sm text-muted-foreground">{resolveLanguageKey("accountNeeded")}</p> : null}
            </div>
            <Button asChild size="lg" className="shrink-0 self-start sm:self-center">
                <Link to={href}>
                    {resolveLanguageKey(isAuthenticated ? "cta" : "ctaSignIn")}
                    <IconArrowRight className="h-4 w-4" aria-hidden />
                </Link>
            </Button>
        </section>
    );
}

export default compose(withLanguage("src/modules/dentalClinic/clients/portal/estimateBanner.tsx"))(EstimateBanner);
