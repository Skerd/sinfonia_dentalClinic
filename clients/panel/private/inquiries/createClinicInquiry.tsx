import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createClinicInquiryFormSchema} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicInquiry/clinicInquiry.form.validators.ts";
import type {CreateClinicInquiryFormType} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicInquiry/clinicInquiry.schema-def.ts";
import {INSTANCE_PATIENT_LANGUAGE} from "@dentalClinicModule/clients/panel/private/shared/instanceLanguage.ts";

/** A lead the clinic takes itself: a phone call, a WhatsApp chat, an agency referral. */
// New patients get the instance language and no guessed source (UX-06); staff pick the source.
export default createGenericCreatePage<CreateClinicInquiryFormType>({
    languagePath: "src/modules/dentalClinic/clients/panel/private/inquiries/createClinicInquiry.tsx",
    collectionName: "clinicinquiries",
    accessModel: "clinicinquiries",
    apiUrl: "/api/dentalClinic/clinicInquiry",
    schema: createClinicInquiryFormSchema,
    defaultValues: {
        contact: {firstName: "", lastName: "", preferredLanguage: INSTANCE_PATIENT_LANGUAGE},
        treatmentsWanted: [],
    },
    submitIcon: <IconPlus />,
});
