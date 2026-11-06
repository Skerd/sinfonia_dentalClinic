import {downloadFromApi} from "@coreModule/helpers/media/downloadFromApi.ts";
import type {TreatmentPlan} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/treatmentPlan/treatmentPlan.dto.ts";

/** Downloads the quote as the patient receives it. */
export function downloadPlanPdf(plan: Pick<TreatmentPlan, "_id" | "number">): Promise<boolean> {
    return downloadFromApi({url: `/api/dentalClinic/treatmentPlanPdf/${plan._id}`, fileName: `${plan.number}.pdf`});
}
