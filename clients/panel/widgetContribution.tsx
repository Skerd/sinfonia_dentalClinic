import {createElement, lazy, useContext, type ReactNode} from "react";
import type {CompoundFormWidgetRenderer, SheetFieldRenderer, WidgetContribution} from "@coreModule/helpers/types/widgetContribution.types.ts";
import {sheetFieldVisible} from "@coreModule/components/viewEngine/viewRendererHelpers.ts";
import type {ClinicInquiry} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicInquiry/clinicInquiry.dto.ts";
import {INQUIRY_STATUSES} from "armonia/src/modules/dentalClinic/constants/index.ts";
import type {MedicalHistory} from "armonia/src/modules/dentalClinic/dto/medicalHistory.dto.ts";
import type {TreatmentPlan} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/treatmentPlan/treatmentPlan.dto.ts";
import MedicalHistoryAnswers from "@dentalClinicModule/clients/panel/private/patients/center/sheetView/medicalHistoryAnswers.tsx";
import PlanBreakdown from "@dentalClinicModule/clients/panel/private/plans/center/sheetView/planBreakdown.tsx";
import InquiryRequestDetails from "@dentalClinicModule/clients/panel/private/inquiries/center/sheetView/inquiryRequestDetails.tsx";
import InquiryPlans from "@dentalClinicModule/clients/panel/private/inquiries/center/sheetView/inquiryPlans.tsx";
import InquiryThread from "@dentalClinicModule/clients/panel/private/inquiries/center/thread/inquiryThread.tsx";
import {InquirySheetRefresh} from "@dentalClinicModule/clients/panel/private/inquiries/center/sheetView/inquirySheetRefresh.ts";
import EnumChecklist, {type EnumChecklistOption} from "@dentalClinicModule/components/custom/forms/enumChecklist.tsx";
import ToothPicker from "@dentalClinicModule/components/custom/forms/toothPicker.tsx";

const isOption = (value: unknown): value is EnumChecklistOption =>
    !!value && typeof value === "object" && typeof (value as {value?: unknown}).value === "string" && typeof (value as {label?: unknown}).label === "string";

/** `widgetProps.options` are `{value, label}` with language-key labels, translated by the form. */
const enumChecklist: CompoundFormWidgetRenderer = ({Widget, binding, resolveLanguageKey, extra}) => (
    <Widget
        name={binding.name}
        label={binding.label ? String(resolveLanguageKey(binding.label)) : undefined}
        options={Array.isArray(binding.widgetProps?.options) ? binding.widgetProps.options.filter(isOption) : []}
        resolveLanguageKey={resolveLanguageKey}
        loading={extra?.loading ?? false}
    />
);

/** FDI chart; the adult/children toggle labels come from the form's language file. */
const toothPicker: CompoundFormWidgetRenderer = ({Widget, binding, resolveLanguageKey, extra}) => (
    <Widget
        name={binding.name}
        label={binding.label ? String(resolveLanguageKey(binding.label)) : undefined}
        primaryLabel={String(resolveLanguageKey("form.toothPickerPrimary"))}
        permanentLabel={String(resolveLanguageKey("form.toothPickerPermanent"))}
        loading={extra?.loading ?? false}
    />
);

// Reference cards for the patient hub (`#ReferencesRender`); lazy, as they pull in their sheets.
const AppointmentCardLazy = lazy(() => import("@dentalClinicModule/clients/panel/private/appointments/center/cardView/appointmentCard.tsx"));
const TreatmentPlanCardLazy = lazy(() => import("@dentalClinicModule/clients/panel/private/plans/center/cardView/treatmentPlanCard.tsx"));
const PatientTripCardLazy = lazy(() => import("@dentalClinicModule/clients/panel/private/trips/center/cardView/patientTripCard.tsx"));
const ClinicInquiryCardLazy = lazy(() => import("@dentalClinicModule/clients/panel/private/inquiries/center/cardView/clinicInquiryCard.tsx"));
// Sheets the hub's compact rows open (`compactRow.linkedSheetWidget`).
const AppointmentSheetViewLazy = lazy(() => import("@dentalClinicModule/clients/panel/private/appointments/center/sheetView/appointmentSheetView.tsx"));
const TreatmentPlanSheetViewLazy = lazy(() => import("@dentalClinicModule/clients/panel/private/plans/center/sheetView/treatmentPlanSheetView.tsx"));
const PatientTripSheetViewLazy = lazy(() => import("@dentalClinicModule/clients/panel/private/trips/center/sheetView/patientTripSheetView.tsx"));
const ClinicInquirySheetViewLazy = lazy(() => import("@dentalClinicModule/clients/panel/private/inquiries/center/sheetView/clinicInquirySheetView.tsx"));

const CAN_MESSAGE: ClinicInquiry["status"][] = ["new", "in_review", "info_requested", "quoted", "converted"];
const CAN_QUOTE: ClinicInquiry["status"][] = ["new", "in_review", "info_requested", "quoted"];

/** A sheet section drawn from the loaded record, once it is loaded and its `permissions` allow (UX-03: placed by the view, above Lifecycle). */
const fromRecord = (draw: (data: Record<string, unknown>) => ReactNode): SheetFieldRenderer => ({node, ctx, index}) => {
    if (!ctx.data || typeof ctx.data._id !== "string" || !sheetFieldVisible(node, ctx)) return null;
    return createElement("div", {key: index}, draw(ctx.data));
};

/** The thread reloads the sheet after a reply, through the sheet's own refresh. */
function SheetInquiryThread({inquiryId, canReply, isNew}: {inquiryId: string; canReply: boolean; isNew: boolean}) {
    const refresh = useContext(InquirySheetRefresh);
    return <InquiryThread inquiryId={inquiryId} canReply={canReply} onSent={() => isNew && refresh()} />;
}

const inquiryStatus = (data: Record<string, unknown>) => INQUIRY_STATUSES.find((status) => status === data.status);

const sheetFieldRenderers: Record<string, SheetFieldRenderer> = {
    "#MedicalHistoryAnswers": fromRecord((data) => <MedicalHistoryAnswers history={data.medicalHistory as MedicalHistory | undefined} />),
    "#PlanBreakdown": fromRecord((data) => (Array.isArray(data.phases) ? <PlanBreakdown plan={data as TreatmentPlan} /> : null)),
    "#InquiryRequestDetails": fromRecord((data) => <InquiryRequestDetails inquiry={data as ClinicInquiry} />),
    "#InquiryPlans": fromRecord((data) => {
        const status = inquiryStatus(data);
        return <InquiryPlans inquiryId={String(data._id)} canQuote={!!status && CAN_QUOTE.includes(status)} />;
    }),
    "#InquiryThread": fromRecord((data) => {
        const status = inquiryStatus(data);
        return <SheetInquiryThread inquiryId={String(data._id)} canReply={!!status && CAN_MESSAGE.includes(status)} isNew={status === "new"} />;
    }),
};

/** Sheets a record shared in chat opens by token, named by each sheet view's `sheetWidget` (D162). */
const ClinicLocationSheetViewLazy = lazy(() => import("@dentalClinicModule/clients/panel/private/locations/center/sheetView/clinicLocationSheetView.tsx"));
const ScheduleExceptionSheetViewLazy = lazy(() => import("@dentalClinicModule/clients/panel/private/timeOff/center/sheetView/scheduleExceptionSheetView.tsx"));
const PractitionerSheetViewLazy = lazy(() => import("@dentalClinicModule/clients/panel/private/team/center/sheetView/practitionerSheetView.tsx"));
const ClinicServiceSheetViewLazy = lazy(() => import("@dentalClinicModule/clients/panel/private/services/center/sheetView/clinicServiceSheetView.tsx"));
const PatientSheetViewLazy = lazy(() => import("@dentalClinicModule/clients/panel/private/patients/center/sheetView/patientSheetView.tsx"));
const ClinicReviewSheetViewLazy = lazy(() => import("@dentalClinicModule/clients/panel/private/reviews/center/sheetView/clinicReviewSheetView.tsx"));

const dentalClinicWidgetContribution: WidgetContribution = {
    id: "dentalClinic",
    order: 37,
    widgets: {
        "#ClinicLocationSheetView": ClinicLocationSheetViewLazy,
        "#ScheduleExceptionSheetView": ScheduleExceptionSheetViewLazy,
        "#PractitionerSheetView": PractitionerSheetViewLazy,
        "#ClinicServiceSheetView": ClinicServiceSheetViewLazy,
        "#PatientSheetView": PatientSheetViewLazy,
        "#ClinicReviewSheetView": ClinicReviewSheetViewLazy,
        "#EnumChecklist": EnumChecklist,
        "#ToothPicker": ToothPicker,
        "#AppointmentCard": AppointmentCardLazy,
        "#TreatmentPlanCard": TreatmentPlanCardLazy,
        "#PatientTripCard": PatientTripCardLazy,
        "#ClinicInquiryCard": ClinicInquiryCardLazy,
        "#AppointmentSheetView": AppointmentSheetViewLazy,
        "#TreatmentPlanSheetView": TreatmentPlanSheetViewLazy,
        "#PatientTripSheetView": PatientTripSheetViewLazy,
        "#ClinicInquirySheetView": ClinicInquirySheetViewLazy,
    },
    referencesDefaultItemProps: {
        "#AppointmentCard": "appointment",
        "#TreatmentPlanCard": "plan",
        "#PatientTripCard": "patientTrip",
        "#ClinicInquiryCard": "inquiry",
    },
    sheetFieldRenderers,
    compoundFormWidgetRenderers: {
        "#EnumChecklist": enumChecklist,
        "#ToothPicker": toothPicker,
    },
    /** Create pages an `#ApiSelect` on `<apiUrl>/select` opens in a dialog ("Create new …" below the dropdown). */
    createPages: {
        "/api/dentalClinic/clinicInquiry": lazy(() => import("@dentalClinicModule/clients/panel/private/inquiries/createClinicInquiry.tsx")),
        "/api/dentalClinic/clinicLocation": lazy(() => import("@dentalClinicModule/clients/panel/private/locations/createClinicLocation.tsx")),
        "/api/dentalClinic/clinicService": lazy(() => import("@dentalClinicModule/clients/panel/private/services/createClinicService.tsx")),
        "/api/dentalClinic/patient": lazy(() => import("@dentalClinicModule/clients/panel/private/patients/createPatient.tsx")),
        "/api/dentalClinic/practitioner": lazy(() => import("@dentalClinicModule/clients/panel/private/team/createPractitioner.tsx")),
        "/api/dentalClinic/treatmentPlan": lazy(() => import("@dentalClinicModule/clients/panel/private/plans/createTreatmentPlan.tsx")),
    },
};

export default dentalClinicWidgetContribution;
