import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {editClinicServiceFormSchema} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicService/editClinicService.form.validator.ts";
import type {EditClinicServiceFormType} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicService/clinicService.schema-def.ts";
import type {ClinicService} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicService/clinicService.dto.ts";

export default createGenericEditPage<ClinicService, EditClinicServiceFormType>({
    languagePath: "src/modules/dentalClinic/clients/panel/private/services/editClinicService.tsx",
    collectionName: "clinicservices",
    accessModel: "clinicservices",
    apiUrl: "/api/dentalClinic/clinicService",
    schema: editClinicServiceFormSchema,
    mapEntityData: (data) => ({
        ...data,
        images: data.images?.map((image) => image._id),
        videos: data.videos?.map((video) => video._id),
    }),
    submitIcon: <Save />,
});
