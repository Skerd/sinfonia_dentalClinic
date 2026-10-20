import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createPractitionerFormSchema} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/practitioner/createPractitioner.form.validator.ts";
import type {CreatePractitionerFormType} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/practitioner/practitioner.schema-def.ts";

export default createGenericCreatePage<CreatePractitionerFormType>({
    languagePath: "src/modules/dentalClinic/clients/panel/private/team/createPractitioner.tsx",
    collectionName: "practitioners",
    accessModel: "practitioners",
    apiUrl: "/api/dentalClinic/practitioner",
    schema: createPractitionerFormSchema,
    defaultValues: {displayName: "", role: "dentist", languages: [], services: [], locations: [], schedule: [], isBookable: true, isActive: true},
    submitIcon: <IconPlus />,
});
