import {IconDeviceFloppy} from "@tabler/icons-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {editClinicLocationFormSchema} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicLocation/editClinicLocation.form.validator.ts";
import type {EditClinicLocationFormType} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicLocation/clinicLocation.schema-def.ts";
import type {ClinicLocation} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicLocation/clinicLocation.dto.ts";

/**
 * The edit form's values. An opening-hours row holds `dayOfWeek` as a string while editing, because the
 * #SimpleSelect weekday options are "0"…"6"; the schema turns it back into a number on submit.
 */
type ClinicLocationFormValues = Omit<EditClinicLocationFormType, "openingHours"> & {
    openingHours?: (Omit<NonNullable<EditClinicLocationFormType["openingHours"]>[number], "dayOfWeek"> & {dayOfWeek: string})[];
};

export default createGenericEditPage<ClinicLocation, ClinicLocationFormValues>({
    languagePath: "src/modules/dentalClinic/clients/panel/private/locations/editClinicLocation.tsx",
    collectionName: "cliniclocations",
    accessModel: "cliniclocations",
    apiUrl: "/api/dentalClinic/clinicLocation",
    schema: editClinicLocationFormSchema,
    mapEntityData: (data) => ({
        ...data,
        address: data.address ? {...data.address, country: data.address.country?._id, city: data.address.city?._id} : undefined,
        openingHours: data.openingHours?.map((slot) => ({...slot, dayOfWeek: String(slot.dayOfWeek)})),
    }),
    submitIcon: <IconDeviceFloppy />,
});
