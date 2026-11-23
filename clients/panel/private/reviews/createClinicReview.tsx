import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createClinicReviewFormSchema} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicReview/createClinicReview.form.validator.ts";
import type {CreateClinicReviewFormType} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicReview/clinicReview.schema-def.ts";

export default createGenericCreatePage<CreateClinicReviewFormType>({
    languagePath: "src/modules/dentalClinic/clients/panel/private/reviews/createClinicReview.tsx",
    collectionName: "clinicreviews",
    accessModel: "clinicreviews",
    apiUrl: "/api/dentalClinic/clinicReview",
    schema: createClinicReviewFormSchema,
    defaultValues: {appointment: "", authorName: ""},
    submitIcon: <IconPlus />,
});
