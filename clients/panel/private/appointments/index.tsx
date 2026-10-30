import {compose} from "redux";
import {useMemo} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage, {type QuickFilterDef} from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators.ts";
import {APPOINTMENT_STATUSES} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/appointment/appointment.constants.ts";
import type {Appointment} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/appointment/appointment.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import AppointmentCard from "./center/cardView/appointmentCard.tsx";
import AppointmentSheetView from "./center/sheetView/appointmentSheetView.tsx";
import AppointmentMenu from "./center/actions/appointmentMenu.tsx";
import AppointmentDialogs from "./center/dialogs/appointmentDialogs.tsx";

export function appointmentEditPath(row: {_id: string}) {
    return `/dentalClinic/appointments/edit?appointmentId=${row._id}`;
}

function AllAppointments({resolveLanguageKey}: WithLanguageType) {
    const quickFilters = useMemo<QuickFilterDef[]>(() => [
        {
            field: "status",
            label: String(resolveLanguageKey("fields.status")),
            type: COLUMN_TYPE.ENUM,
            enumValues: APPOINTMENT_STATUSES.map((value) => ({
                value,
                label: String(resolveLanguageKey(`fields.!enums.status.${value}`)),
            })),
        },
        {
            field: "practitioner",
            label: String(resolveLanguageKey("fields.practitioner")),
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/dentalClinic/practitioner/select",
        },
        {
            field: "location",
            label: String(resolveLanguageKey("fields.location")),
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/dentalClinic/clinicLocation/select",
        },
        {
            field: "service",
            label: String(resolveLanguageKey("fields.service")),
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/dentalClinic/clinicService/select",
        },
        {
            field: "patientRecord",
            label: String(resolveLanguageKey("fields.patientRecord")),
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/dentalClinic/patient/select",
        },
    ], [resolveLanguageKey]);

    return (
        <EntityListPage<Appointment>
            apiUrl="/api/dentalClinic/appointment"
            collectionName="appointments"
            accessModel="appointments"
            tableConfigKey="appointments"
            createPath="/dentalClinic/appointments/create"
            createIcon={<IconPlus />}
            createLanguageKey="create"
            buildEditPath={() => ""}
            resolveLanguageKey={resolveLanguageKey}
            quickFilters={quickFilters}
            sheetLanguagePath="src/modules/dentalClinic/clients/panel/private/appointments/center/sheetView/appointmentSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            rowActionMenu={{allowMenuForCustomChildren: true, hideEdit: true}}
            renderActionMenuChildren={(row, bindRowAction) => <AppointmentMenu appointment={row} onAction={bindRowAction} />}
            renderSheetActionMenuChildren={(row, bindRowAction) => <AppointmentMenu appointment={row} onAction={bindRowAction} />}
            renderFloatingModals={({action, entity, resetAction, listRef}) => (
                <AppointmentDialogs
                    action={action}
                    appointment={entity}
                    onClose={resetAction}
                    onUpdated={(updated) => listRef.current?.updateRow?.(entity._id, updated)}
                />
            )}
            renderSheet={({open, onOpenChange, entity, onDelete, onRestore}) => (
                <AppointmentSheetView
                    open={open}
                    onOpenChange={onOpenChange}
                    appointment={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                />
            )}
            renderCard={(row, onDelete, onRestore) => (
                <AppointmentCard
                    appointment={row}
                    onDelete={(deleted: Appointment | undefined, response?: DeletedData) => onDelete(deleted, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/appointments/index.tsx"),
    withDebug(true, true, "appointments"),
)(AllAppointments);
