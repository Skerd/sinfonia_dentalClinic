import type {PortalContribution} from "@coreModule/helpers/types/portalContribution.types.ts";
import ClinicSiteRoutes from "@dentalClinicModule/clients/client/public/shared/clinicSiteRoutes.tsx";
import DentistsAccountSection from "./dentistsAccountSection.tsx";
import RequestQuotesPage from "./request/requestQuotesPage.tsx";
import EstimateBanner from "./estimateBanner.tsx";

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
};

export default contribution;
