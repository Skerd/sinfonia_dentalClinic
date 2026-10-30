import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {editTreatmentPlanFormSchema} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/treatmentPlan/treatmentPlan.form.validators.ts";
import type {EditTreatmentPlanFormType} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/treatmentPlan/treatmentPlan.schema-def.ts";
import type {TreatmentPlan} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/treatmentPlan/treatmentPlan.dto.ts";

/** Drafts only: a sent quote is revised into a new draft from its menu. */
export default createGenericEditPage<TreatmentPlan, EditTreatmentPlanFormType>({
    languagePath: "src/modules/dentalClinic/clients/panel/private/plans/editTreatmentPlan.tsx",
    collectionName: "treatmentplans",
    accessModel: "treatmentplans",
    apiUrl: "/api/dentalClinic/treatmentPlan",
    schema: editTreatmentPlanFormSchema,
    mapEntityData: (data) => ({
        ...data,
        inquiry: data.inquiry?._id,
        patient: data.patient?._id,
        lines: data.lines.map(({total: _total, ...line}) => ({...line, service: line.service?._id})),
    }),
    submitIcon: <Save />,
});
