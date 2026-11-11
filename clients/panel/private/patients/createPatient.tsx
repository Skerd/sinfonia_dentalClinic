import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createPatientFormSchema} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/patient/createPatient.form.validator.ts";
import type {CreatePatientFormType} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/patient/patient.schema-def.ts";
import {INSTANCE_PATIENT_LANGUAGE} from "@dentalClinicModule/clients/panel/private/shared/instanceLanguage.ts";

// New patients get the instance language and no guessed source (UX-06); staff pick the source.
export default createGenericCreatePage<CreatePatientFormType>({
    languagePath: "src/modules/dentalClinic/clients/panel/private/patients/createPatient.tsx",
    collectionName: "patients",
    accessModel: "patients",
    apiUrl: "/api/dentalClinic/patient",
    schema: createPatientFormSchema,
    defaultValues: {firstName: "", lastName: "", preferredLanguage: INSTANCE_PATIENT_LANGUAGE, tags: []},
    submitIcon: <IconPlus />,
});
