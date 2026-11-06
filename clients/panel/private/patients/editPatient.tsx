import {IconDeviceFloppy} from "@tabler/icons-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {editPatientFormSchema} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/patient/editPatient.form.validator.ts";
import type {EditPatientFormType} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/patient/patient.schema-def.ts";
import type {Patient} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/patient/patient.dto.ts";

export default createGenericEditPage<Patient, EditPatientFormType>({
    languagePath: "src/modules/dentalClinic/clients/panel/private/patients/editPatient.tsx",
    collectionName: "patients",
    accessModel: "patients",
    apiUrl: "/api/dentalClinic/patient",
    schema: editPatientFormSchema,
    mapEntityData: (data) => ({
        ...data,
        address: data.address ? {...data.address, country: data.address.country?._id} : undefined,
    }),
    submitIcon: <IconDeviceFloppy />,
});
