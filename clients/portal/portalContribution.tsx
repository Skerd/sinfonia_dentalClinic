import type {PortalContribution} from "@coreModule/helpers/types/portalContribution.types.ts";
import ClinicSiteRoutes from "@dentalClinicModule/clients/client/public/shared/clinicSiteRoutes.tsx";
import MyAppointments from "./myAppointments.tsx";

/** Dentists on the portal: each clinic's booking site, its treatments in the home catalog, and the visitor's appointments. */
const contribution: PortalContribution = {
    id: "dentalClinic",
    order: 30,
    section: "dentalClinic",
    path: "dentists",
    CompanySite: ClinicSiteRoutes,
    catalogs: [{kind: "treatment"}],
    AccountSection: MyAppointments,
};

export default contribution;
