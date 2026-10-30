import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createTreatmentPlanFormSchema} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/treatmentPlan/treatmentPlan.form.validators.ts";
import type {CreateTreatmentPlanFormType} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/treatmentPlan/treatmentPlan.schema-def.ts";

/** A new quote; opened from a request (`?inquiry=`) or a patient folder (`?patient=`), it answers that one. */
export default createGenericCreatePage<CreateTreatmentPlanFormType>({
    languagePath: "src/modules/dentalClinic/clients/panel/private/plans/createTreatmentPlan.tsx",
    collectionName: "treatmentplans",
    accessModel: "treatmentplans",
    apiUrl: "/api/dentalClinic/treatmentPlan",
    schema: createTreatmentPlanFormSchema,
    defaultValues: () => {
        const params = new URLSearchParams(window.location.search);
        return {
            inquiry: params.get("inquiry") ?? "",
            patient: params.get("patient") ?? "",
            phases: [{title: "", visits: 1, estimatedDays: 5}],
            lines: [{phase: 1, kind: "treatment", name: "", teeth: [], quantity: 1, unitPrice: 0}],
            depositType: "none",
        };
    },
    submitIcon: <IconPlus />,
});
