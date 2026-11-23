import {IconDeviceFloppy} from "@tabler/icons-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {editClinicReviewFormSchema} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicReview/editClinicReview.form.validator.ts";
import type {EditClinicReviewFormType} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicReview/clinicReview.schema-def.ts";
import type {ClinicReview} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicReview/clinicReview.dto.ts";

export default createGenericEditPage<ClinicReview, EditClinicReviewFormType>({
    languagePath: "src/modules/dentalClinic/clients/panel/private/reviews/editClinicReview.tsx",
    collectionName: "clinicreviews",
    accessModel: "clinicreviews",
    apiUrl: "/api/dentalClinic/clinicReview",
    schema: editClinicReviewFormSchema,
    mapEntityData: (data) => ({...data, appointment: data.appointment?._id}),
    submitIcon: <IconDeviceFloppy />,
});
