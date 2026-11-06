import {IconDeviceFloppy} from "@tabler/icons-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {editScheduleExceptionFormSchema} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/scheduleException/editScheduleException.form.validator.ts";
import type {EditScheduleExceptionFormType} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/scheduleException/scheduleException.schema-def.ts";
import type {ScheduleException} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/scheduleException/scheduleException.dto.ts";

export default createGenericEditPage<ScheduleException, EditScheduleExceptionFormType>({
    languagePath: "src/modules/dentalClinic/clients/panel/private/timeOff/editScheduleException.tsx",
    collectionName: "scheduleexceptions",
    accessModel: "scheduleexceptions",
    apiUrl: "/api/dentalClinic/scheduleException",
    schema: editScheduleExceptionFormSchema,
    submitIcon: <IconDeviceFloppy />,
});
