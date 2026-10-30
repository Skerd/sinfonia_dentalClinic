import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import type {PatientFile, PatientUploadResponse} from "armonia/src/modules/dentalClinic/api/dentalClinic/public/patientPortal/patientPortal.response.types.ts";

/** Uploads files ahead of the message or attach call that names them. */
export async function uploadPatientFiles(files: File[]): Promise<PatientFile[]> {
    const form = new FormData();
    for (const file of files) form.append("files", file);
    const res = await apiClient.post<PatientUploadResponse>("/api/dentalClinic/patientPortal/upload", form);
    return res.data.data;
}

/** Opens one of the patient's files; the download needs the login token, so it goes through the API client. */
export async function openPatientFile(file: PatientFile): Promise<void> {
    const res = await apiClient.get<Blob>(`/api/dentalClinic/patientPortal/media/${file._id}`, {responseType: "blob"});
    const url = URL.createObjectURL(res.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/** Downloads one of the patient's quotes as a PDF. */
export async function downloadOfferPdf(plan: {_id: string; number: string}): Promise<void> {
    const res = await apiClient.get<Blob>(`/api/dentalClinic/patientPortal/plan/${plan._id}/pdf`, {responseType: "blob"});
    const url = URL.createObjectURL(res.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${plan.number}.pdf`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
