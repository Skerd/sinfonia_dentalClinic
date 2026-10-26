import type {PortalContribution} from "@coreModule/helpers/types/portalContribution.types.ts";
import ClinicSiteRoutes from "@dentalClinicModule/clients/client/public/shared/clinicSiteRoutes.tsx";
import MyAppointments from "./myAppointments.tsx";

/** Dentists on the portal: each clinic's booking site and the visitor's appointments. */
const contribution: PortalContribution = {
    id: "dentalClinic",
    order: 30,
    section: "dentalClinic",
    path: "dentists",
    CompanySite: ClinicSiteRoutes,
    AccountSection: MyAppointments,
};

export default contribution;
