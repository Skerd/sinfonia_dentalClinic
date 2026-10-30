import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createPatientFormSchema} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/patient/createPatient.form.validator.ts";
import type {CreatePatientFormType} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/patient/patient.schema-def.ts";

export default createGenericCreatePage<CreatePatientFormType>({
    languagePath: "src/modules/dentalClinic/clients/panel/private/patients/createPatient.tsx",
    collectionName: "patients",
    accessModel: "patients",
    apiUrl: "/api/dentalClinic/patient",
    schema: createPatientFormSchema,
    defaultValues: {firstName: "", lastName: "", preferredLanguage: "it-IT", source: "phone", tags: []},
    submitIcon: <IconPlus />,
});
