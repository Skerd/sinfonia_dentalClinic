import type {ReactNode} from "react";
import {Navigate} from "react-router-dom";
import type {RouteConfigArgs, RouteConfigContribution} from "@coreModule/helpers/types/routeConfigContribution.types.ts";
import {clinicConfigSectionPath, isClinicConfigSection} from "@dentalClinicModule/clients/panel/private/settings/clinicConfigSections.ts";
import ClinicDayView from "@dentalClinicModule/clients/panel/private/day/index.tsx";
import AllAppointments from "@dentalClinicModule/clients/panel/private/appointments/index.tsx";
import CreateAppointment from "@dentalClinicModule/clients/panel/private/appointments/createAppointment.tsx";
import AllPatients from "@dentalClinicModule/clients/panel/private/patients/index.tsx";
import CreatePatient from "@dentalClinicModule/clients/panel/private/patients/createPatient.tsx";
import EditPatient from "@dentalClinicModule/clients/panel/private/patients/editPatient.tsx";
import AllClinicInquiries from "@dentalClinicModule/clients/panel/private/inquiries/index.tsx";
import CreateClinicInquiry from "@dentalClinicModule/clients/panel/private/inquiries/createClinicInquiry.tsx";
import AllTreatmentPlans from "@dentalClinicModule/clients/panel/private/plans/index.tsx";
import CreateTreatmentPlan from "@dentalClinicModule/clients/panel/private/plans/createTreatmentPlan.tsx";
import EditTreatmentPlan from "@dentalClinicModule/clients/panel/private/plans/editTreatmentPlan.tsx";
import AllPatientTrips from "@dentalClinicModule/clients/panel/private/trips/index.tsx";
import CreatePatientTrip from "@dentalClinicModule/clients/panel/private/trips/createPatientTrip.tsx";
import EditPatientTrip from "@dentalClinicModule/clients/panel/private/trips/editPatientTrip.tsx";
import AllPractitioners from "@dentalClinicModule/clients/panel/private/team/index.tsx";
import CreatePractitioner from "@dentalClinicModule/clients/panel/private/team/createPractitioner.tsx";
import EditPractitioner from "@dentalClinicModule/clients/panel/private/team/editPractitioner.tsx";
import AllScheduleExceptions from "@dentalClinicModule/clients/panel/private/timeOff/index.tsx";
import CreateScheduleException from "@dentalClinicModule/clients/panel/private/timeOff/createScheduleException.tsx";
import EditScheduleException from "@dentalClinicModule/clients/panel/private/timeOff/editScheduleException.tsx";
import AllClinicServices from "@dentalClinicModule/clients/panel/private/services/index.tsx";
import CreateClinicService from "@dentalClinicModule/clients/panel/private/services/createClinicService.tsx";
import EditClinicService from "@dentalClinicModule/clients/panel/private/services/editClinicService.tsx";
import AllClinicLocations from "@dentalClinicModule/clients/panel/private/locations/index.tsx";
import CreateClinicLocation from "@dentalClinicModule/clients/panel/private/locations/createClinicLocation.tsx";
import EditClinicLocation from "@dentalClinicModule/clients/panel/private/locations/editClinicLocation.tsx";
import ClinicSettings from "@dentalClinicModule/clients/panel/private/settings/index.tsx";

type CrudPages = {list: () => ReactNode; create?: () => ReactNode; edit?: (entityId: string) => ReactNode; idParam: string};

const PAGES: Record<string, CrudPages> = {
    appointments: {list: () => <AllAppointments />, create: () => <CreateAppointment />, idParam: "appointmentId"},
    inquiries: {list: () => <AllClinicInquiries />, create: () => <CreateClinicInquiry />, idParam: "inquiryId"},
    plans: {list: () => <AllTreatmentPlans />, create: () => <CreateTreatmentPlan />, edit: (id) => <EditTreatmentPlan entityId={id} />, idParam: "treatmentPlanId"},
    patients: {list: () => <AllPatients />, create: () => <CreatePatient />, edit: (id) => <EditPatient entityId={id} />, idParam: "patientId"},
    trips: {list: () => <AllPatientTrips />, create: () => <CreatePatientTrip />, edit: (id) => <EditPatientTrip entityId={id} />, idParam: "patientTripId"},
    team: {list: () => <AllPractitioners />, create: () => <CreatePractitioner />, edit: (id) => <EditPractitioner entityId={id} />, idParam: "practitionerId"},
    timeOff: {list: () => <AllScheduleExceptions />, create: () => <CreateScheduleException />, edit: (id) => <EditScheduleException entityId={id} />, idParam: "scheduleExceptionId"},
    services: {list: () => <AllClinicServices />, create: () => <CreateClinicService />, edit: (id) => <EditClinicService entityId={id} />, idParam: "clinicServiceId"},
    locations: {list: () => <AllClinicLocations />, create: () => <CreateClinicLocation />, edit: (id) => <EditClinicLocation entityId={id} />, idParam: "clinicLocationId"},
};

const dentalClinicRouteConfigContribution: RouteConfigContribution = {
    id: "dentalClinic",
    order: 37,
    contributeRoutes({menu, subview, segments, searchParams}: RouteConfigArgs) {
        if (menu === "tenancy" && subview === "systemSettings" && segments[2] === "clinicConfig") {
            if (!isClinicConfigSection(segments[3])) return <Navigate to={clinicConfigSectionPath("booking")} replace />;
            return <ClinicSettings />;
        }
        if (menu === "dentalClinic" && subview === "settings") {
            return <Navigate to={clinicConfigSectionPath("booking")} replace />;
        }
        if (menu !== "dentalClinic") return undefined;
        if (subview === "day") return <ClinicDayView />;

        const pages = subview ? PAGES[subview] : undefined;
        if (!pages) return undefined;
        const action = segments[2];
        const entityId = searchParams.get(pages.idParam);
        if (action === "create" && pages.create) return pages.create();
        if (action === "edit" && entityId && pages.edit) return pages.edit(entityId);
        return pages.list();
    },
};

export default dentalClinicRouteConfigContribution;
