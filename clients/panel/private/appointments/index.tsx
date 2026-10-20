import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
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
