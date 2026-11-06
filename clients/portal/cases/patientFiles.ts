import type {HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {downloadFromApi} from "@coreModule/helpers/media/downloadFromApi.ts";
import type {PatientFile} from "armonia/src/modules/dentalClinic/api/dentalClinic/public/patientPortal/patientPortal.response.types.ts";

/** Uploads files ahead of the message or attach call that names them; send it with {@link patientFilesForm}. */
export const PATIENT_UPLOAD_REQUEST: HttpRequest = {method: "POST", url: "/api/dentalClinic/patientPortal/upload"};

/** The multipart body of {@link PATIENT_UPLOAD_REQUEST}. */
export function patientFilesForm(files: File[]): FormData {
    const form = new FormData();
    for (const file of files) form.append("files", file);
    return form;
}

/** Opens one of the patient's files; the download needs the login token, so it goes through the API client. */
export function openPatientFile(file: PatientFile): Promise<boolean> {
    return downloadFromApi({url: `/api/dentalClinic/patientPortal/media/${file._id}`, fileName: file.name});
}

/** Downloads one of the patient's quotes as a PDF. */
export function downloadOfferPdf(plan: {_id: string; number: string}): Promise<boolean> {
    return downloadFromApi({url: `/api/dentalClinic/patientPortal/plan/${plan._id}/pdf`, fileName: `${plan.number}.pdf`});
}
