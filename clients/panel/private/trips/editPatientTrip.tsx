import {IconDeviceFloppy} from "@tabler/icons-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {editPatientTripFormSchema} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/patientTrip/editPatientTrip.form.validator.ts";
import type {EditPatientTripFormType} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/patientTrip/patientTrip.schema-def.ts";
import type {PatientTrip} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/patientTrip/patientTrip.dto.ts";

export default createGenericEditPage<PatientTrip, EditPatientTripFormType>({
    languagePath: "src/modules/dentalClinic/clients/panel/private/trips/editPatientTrip.tsx",
    collectionName: "patienttrips",
    accessModel: "patienttrips",
    apiUrl: "/api/dentalClinic/patientTrip",
    schema: editPatientTripFormSchema,
    submitIcon: <IconDeviceFloppy />,
});
