import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createClinicLocationFormSchema} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicLocation/createClinicLocation.form.validator.ts";
import type {CreateClinicLocationFormType} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicLocation/clinicLocation.schema-def.ts";

export default createGenericCreatePage<CreateClinicLocationFormType>({
    languagePath: "src/modules/dentalClinic/clients/panel/private/locations/createClinicLocation.tsx",
    collectionName: "cliniclocations",
    accessModel: "cliniclocations",
    apiUrl: "/api/dentalClinic/clinicLocation",
    schema: createClinicLocationFormSchema,
    defaultValues: {name: "", timezone: "Europe/Zurich", isActive: true, openingHours: [], closures: []},
    submitIcon: <IconPlus />,
});
