import {lazy, type ReactNode} from "react";
import {Navigate} from "react-router-dom";
import type {RouteConfigArgs, RouteConfigContribution} from "@coreModule/helpers/types/routeConfigContribution.types.ts";
import {clinicConfigSectionPath, isClinicConfigSection} from "@dentalClinicModule/clients/panel/private/settings/clinicConfigSections.ts";

// Pages load on first visit (D21); the panel shell's Suspense boundary shows the loader.
const ClinicDayView = lazy(() => import("@dentalClinicModule/clients/panel/private/day/index.tsx"));
const AllAppointments = lazy(() => import("@dentalClinicModule/clients/panel/private/appointments/index.tsx"));
const CreateAppointment = lazy(() => import("@dentalClinicModule/clients/panel/private/appointments/createAppointment.tsx"));
const AllPatients = lazy(() => import("@dentalClinicModule/clients/panel/private/patients/index.tsx"));
const CreatePatient = lazy(() => import("@dentalClinicModule/clients/panel/private/patients/createPatient.tsx"));
const EditPatient = lazy(() => import("@dentalClinicModule/clients/panel/private/patients/editPatient.tsx"));
const AllClinicInquiries = lazy(() => import("@dentalClinicModule/clients/panel/private/inquiries/index.tsx"));
const CreateClinicInquiry = lazy(() => import("@dentalClinicModule/clients/panel/private/inquiries/createClinicInquiry.tsx"));
const AllTreatmentPlans = lazy(() => import("@dentalClinicModule/clients/panel/private/plans/index.tsx"));
const CreateTreatmentPlan = lazy(() => import("@dentalClinicModule/clients/panel/private/plans/createTreatmentPlan.tsx"));
const EditTreatmentPlan = lazy(() => import("@dentalClinicModule/clients/panel/private/plans/editTreatmentPlan.tsx"));
const AllPatientTrips = lazy(() => import("@dentalClinicModule/clients/panel/private/trips/index.tsx"));
const CreatePatientTrip = lazy(() => import("@dentalClinicModule/clients/panel/private/trips/createPatientTrip.tsx"));
const EditPatientTrip = lazy(() => import("@dentalClinicModule/clients/panel/private/trips/editPatientTrip.tsx"));
const AllPractitioners = lazy(() => import("@dentalClinicModule/clients/panel/private/team/index.tsx"));
const CreatePractitioner = lazy(() => import("@dentalClinicModule/clients/panel/private/team/createPractitioner.tsx"));
const EditPractitioner = lazy(() => import("@dentalClinicModule/clients/panel/private/team/editPractitioner.tsx"));
const AllScheduleExceptions = lazy(() => import("@dentalClinicModule/clients/panel/private/timeOff/index.tsx"));
const CreateScheduleException = lazy(() => import("@dentalClinicModule/clients/panel/private/timeOff/createScheduleException.tsx"));
const EditScheduleException = lazy(() => import("@dentalClinicModule/clients/panel/private/timeOff/editScheduleException.tsx"));
const AllClinicServices = lazy(() => import("@dentalClinicModule/clients/panel/private/services/index.tsx"));
const CreateClinicService = lazy(() => import("@dentalClinicModule/clients/panel/private/services/createClinicService.tsx"));
const EditClinicService = lazy(() => import("@dentalClinicModule/clients/panel/private/services/editClinicService.tsx"));
const AllClinicLocations = lazy(() => import("@dentalClinicModule/clients/panel/private/locations/index.tsx"));
const CreateClinicLocation = lazy(() => import("@dentalClinicModule/clients/panel/private/locations/createClinicLocation.tsx"));
const EditClinicLocation = lazy(() => import("@dentalClinicModule/clients/panel/private/locations/editClinicLocation.tsx"));
const AllClinicReviews = lazy(() => import("@dentalClinicModule/clients/panel/private/reviews/index.tsx"));
const CreateClinicReview = lazy(() => import("@dentalClinicModule/clients/panel/private/reviews/createClinicReview.tsx"));
const EditClinicReview = lazy(() => import("@dentalClinicModule/clients/panel/private/reviews/editClinicReview.tsx"));
const ClinicSettings = lazy(() => import("@dentalClinicModule/clients/panel/private/settings/index.tsx"));

type CrudPages = {list: () => ReactNode; create?: () => ReactNode; edit?: (entityId: string) => ReactNode; idParam: string};

const PAGES: Record<string, CrudPages> = {
    appointments: {list: () => <AllAppointments />, create: () => <CreateAppointment />, idParam: "appointmentId"},
    inquiries: {list: () => <AllClinicInquiries />, create: () => <CreateClinicInquiry />, idParam: "inquiryId"},
    plans: {list: () => <AllTreatmentPlans />, create: () => <CreateTreatmentPlan />, edit: (id) => <EditTreatmentPlan entityId={id} />, idParam: "treatmentPlanId"},
    patients: {list: () => <AllPatients />, create: () => <CreatePatient />, edit: (id) => <EditPatient entityId={id} />, idParam: "patientId"},
    trips: {list: () => <AllPatientTrips />, create: () => <CreatePatientTrip />, edit: (id) => <EditPatientTrip entityId={id} />, idParam: "patientTripId"},
    reviews: {list: () => <AllClinicReviews />, create: () => <CreateClinicReview />, edit: (id) => <EditClinicReview entityId={id} />, idParam: "clinicReviewId"},
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
