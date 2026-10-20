import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {FORM_EXTRAS_OBJECT_ID_CHIP_LABEL_REFS} from "@coreModule/components/custom/inputs/objectIdChipsInput.tsx";
import {editPractitionerFormSchema} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/practitioner/editPractitioner.form.validator.ts";
import type {EditPractitionerFormType} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/practitioner/practitioner.schema-def.ts";
import type {Practitioner} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/practitioner/practitioner.dto.ts";

const chipLabelState = {
    loadedId: null as string | null,
    services: {current: {} as Record<string, string>},
    locations: {current: {} as Record<string, string>},
};

export default createGenericEditPage<Practitioner, EditPractitionerFormType>({
    languagePath: "src/modules/dentalClinic/clients/panel/private/team/editPractitioner.tsx",
    collectionName: "practitioners",
    accessModel: "practitioners",
    apiUrl: "/api/dentalClinic/practitioner",
    schema: editPractitionerFormSchema,
    mapEntityData: (data) => ({
        ...data,
        staffUser: data.staffUser?._id,
        photo: data.photo?._id,
        services: data.services?.map((service) => service._id) ?? [],
        locations: data.locations?.map((location) => location._id) ?? [],
        schedule: data.schedule.map((row) => ({...row, location: row.location?._id ?? ""})),
    }),
    buildFormExtras: (_entityId, _params, entity) => {
        if (entity && chipLabelState.loadedId !== entity._id) {
            chipLabelState.loadedId = entity._id;
            chipLabelState.services.current = {};
            chipLabelState.locations.current = {};
        }
        const services = entity?.services ?? [];
        const locations = entity?.locations ?? [];
        for (const service of services) chipLabelState.services.current[service._id] = service.name;
        for (const location of locations) chipLabelState.locations.current[location._id] = location.name;
        return {
            services: services.map((service) => ({value: service._id, label: service.name})),
            locations: locations.map((location) => ({value: location._id, label: location.name})),
            [FORM_EXTRAS_OBJECT_ID_CHIP_LABEL_REFS]: {services: chipLabelState.services, locations: chipLabelState.locations},
        };
    },
    submitIcon: <Save />,
});
