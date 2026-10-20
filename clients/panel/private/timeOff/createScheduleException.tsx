import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createScheduleExceptionFormSchema} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/scheduleException/createScheduleException.form.validator.ts";
import type {CreateScheduleExceptionFormType} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/scheduleException/scheduleException.schema-def.ts";

export default createGenericCreatePage<CreateScheduleExceptionFormType>({
    languagePath: "src/modules/dentalClinic/clients/panel/private/timeOff/createScheduleException.tsx",
    collectionName: "scheduleexceptions",
    accessModel: "scheduleexceptions",
    apiUrl: "/api/dentalClinic/scheduleException",
    schema: createScheduleExceptionFormSchema,
    defaultValues: {practitioner: "", location: "", startAt: "", endAt: ""},
    submitIcon: <IconPlus />,
});
