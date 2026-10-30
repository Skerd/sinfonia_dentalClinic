import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createPatientTripFormSchema} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/patientTrip/createPatientTrip.form.validator.ts";
import type {CreatePatientTripFormType} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/patientTrip/patientTrip.schema-def.ts";

export default createGenericCreatePage<CreatePatientTripFormType>({
    languagePath: "src/modules/dentalClinic/clients/panel/private/trips/createPatientTrip.tsx",
    collectionName: "patienttrips",
    accessModel: "patienttrips",
    apiUrl: "/api/dentalClinic/patientTrip",
    schema: createPatientTripFormSchema,
    defaultValues: {patient: "", plan: "", status: "planned", arrivalAt: "", departureAt: "", transfer: false},
    submitIcon: <IconPlus />,
});
