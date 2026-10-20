import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {editClinicLocationFormSchema} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicLocation/editClinicLocation.form.validator.ts";
import type {EditClinicLocationFormType} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicLocation/clinicLocation.schema-def.ts";
import type {ClinicLocation} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicLocation/clinicLocation.dto.ts";

export default createGenericEditPage<ClinicLocation, EditClinicLocationFormType>({
    languagePath: "src/modules/dentalClinic/clients/panel/private/locations/editClinicLocation.tsx",
    collectionName: "cliniclocations",
    accessModel: "cliniclocations",
    apiUrl: "/api/dentalClinic/clinicLocation",
    schema: editClinicLocationFormSchema,
    mapEntityData: (data) => ({
        ...data,
        address: data.address ? {...data.address, country: data.address.country?._id, city: data.address.city?._id} : undefined,
    }),
    submitIcon: <Save />,
});
