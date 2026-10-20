import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createClinicServiceFormSchema} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicService/createClinicService.form.validator.ts";
import type {CreateClinicServiceFormType} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicService/clinicService.schema-def.ts";

export default createGenericCreatePage<CreateClinicServiceFormType>({
    languagePath: "src/modules/dentalClinic/clients/panel/private/services/createClinicService.tsx",
    collectionName: "clinicservices",
    accessModel: "clinicservices",
    apiUrl: "/api/dentalClinic/clinicService",
    schema: createClinicServiceFormSchema,
    defaultValues: {name: "", slug: "", durationMinutes: 30, bufferBeforeMinutes: 0, bufferAfterMinutes: 0, priceType: "on_request", onlineBookable: true, isPublic: true, isActive: true},
    submitIcon: <IconPlus />,
});
