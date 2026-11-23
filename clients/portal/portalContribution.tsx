import type {PortalContribution} from "@coreModule/helpers/types/portalContribution.types.ts";
import {prefetchHttpRequest} from "@coreModule/helpers/apiClient/responseCache.ts";
import {CLINIC_CONFIG_REQUEST} from "@dentalClinicModule/clients/client/public/shared/clinicConfigContext.tsx";
import ClinicSiteRoutes from "@dentalClinicModule/clients/client/public/shared/clinicSiteRoutes.tsx";
import DentistsAccountSection from "./dentistsAccountSection.tsx";
import RequestQuotesPage from "./request/requestQuotesPage.tsx";
import EstimateBanner from "./estimateBanner.tsx";
import {IconDental} from "@tabler/icons-react";
import BusinessTypeSummary from "./businessTypeSummary.tsx";

/**
 * Dentists on the portal: each clinic's site, its treatments in the home catalog (with the
 * estimate request on top of that tab), one estimate request to several clinics, and the
 * visitor's requests and appointments.
 */
const contribution: PortalContribution = {
    id: "dentalClinic",
    order: 30,
    section: "dentalClinic",
    path: "dentists",
    CompanySite: ClinicSiteRoutes,
    catalogs: [{kind: "treatment", Intro: EstimateBanner}],
    sectionPages: [{path: "request-quotes", Page: RequestQuotesPage}],
    AccountSection: DentistsAccountSection,
    // A link into a clinic's site about to be followed: the page's code and the site's settings and treatments.
    prefetch: ({path, siteCompany}) => {
        if (path === "/") void import("@dentalClinicModule/clients/client/public/home/index.tsx");
        else if (path.startsWith("/treatments/")) void import("@dentalClinicModule/clients/client/public/treatment/index.tsx");
        else return;
        prefetchHttpRequest(CLINIC_CONFIG_REQUEST, {}, {siteCompany});
    },
    // A person may create this kind of business on the portal (D178); the API declares the same key.
    businessType: {key: "dentalClinic", Icon: IconDental, Summary: BusinessTypeSummary},
};

export default contribution;
