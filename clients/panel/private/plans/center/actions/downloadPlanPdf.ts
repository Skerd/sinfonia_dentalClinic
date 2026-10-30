import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import type {TreatmentPlan} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/treatmentPlan/treatmentPlan.dto.ts";

/** Downloads the quote as the patient receives it. */
export async function downloadPlanPdf(plan: Pick<TreatmentPlan, "_id" | "number">): Promise<void> {
    const res = await apiClient.get<Blob>(`/api/dentalClinic/treatmentPlanPdf/${plan._id}`, {responseType: "blob"});
    const url = URL.createObjectURL(res.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${plan.number}.pdf`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
