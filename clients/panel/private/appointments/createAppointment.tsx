import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createAppointmentFormSchema} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/appointment/appointment.form.validators.ts";
import type {CreateAppointmentFormType} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/appointment/appointment.forms.ts";

export default createGenericCreatePage<CreateAppointmentFormType>({
    languagePath: "src/modules/dentalClinic/clients/panel/private/appointments/createAppointment.tsx",
    collectionName: "appointments",
    accessModel: "appointments",
    apiUrl: "/api/dentalClinic/appointment",
    schema: createAppointmentFormSchema,
    defaultValues: () => ({
        service: "",
        location: "",
        practitioner: "",
        date: "",
        time: "09:00",
        patient: {firstName: "", lastName: "", email: "", phone: ""},
        // One key per form: a double submit or a retried request returns the same appointment
        idempotencyKey: crypto.randomUUID(),
    }),
    submitIcon: <IconPlus />,
});
