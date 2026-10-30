import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createClinicInquiryFormSchema} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicInquiry/clinicInquiry.form.validators.ts";
import type {CreateClinicInquiryFormType} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicInquiry/clinicInquiry.schema-def.ts";

/** A lead the clinic takes itself: a phone call, a WhatsApp chat, an agency referral. */
export default createGenericCreatePage<CreateClinicInquiryFormType>({
    languagePath: "src/modules/dentalClinic/clients/panel/private/inquiries/createClinicInquiry.tsx",
    collectionName: "clinicinquiries",
    accessModel: "clinicinquiries",
    apiUrl: "/api/dentalClinic/clinicInquiry",
    schema: createClinicInquiryFormSchema,
    defaultValues: {
        contact: {firstName: "", lastName: "", preferredLanguage: "it-IT"},
        source: "phone",
        treatmentsWanted: [],
    },
    submitIcon: <IconPlus />,
});
