import {compose} from "redux";
import type {RefObject} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconCalendarEvent, IconStatusChange, IconStethoscope, IconUser} from "@tabler/icons-react";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import type {Appointment} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/appointment/appointment.dto.ts";
import AppointmentSheetView from "@dentalClinicModule/clients/panel/private/appointments/center/sheetView/appointmentSheetView.tsx";

import AppointmentMenu from "@dentalClinicModule/clients/panel/private/appointments/center/actions/appointmentMenu.tsx";
import AppointmentDialogs from "@dentalClinicModule/clients/panel/private/appointments/center/dialogs/appointmentDialogs.tsx";
type AppointmentCardProps = WithLanguageType & {
    appointment: Appointment;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: Appointment, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<Appointment> | null>;
};

function AppointmentCard({
    appointment,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: AppointmentCardProps) {
    return (
        <EntityCard
            resource="appointments"
            entity={appointment}
            fetchId={fetchId}
            singleUrl="/api/dentalClinic/appointment/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            hideEdit
            editPath={() => ""}
            Sheet={AppointmentSheetView}
            sheetEntityProp="appointment"
            deleteUrl="/api/dentalClinic/appointment"
            restoreUrl="/api/dentalClinic/appointment/restore"
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            titlePath="number"
            innerRef={innerRef}
            sheetProps={({entity, setAction}) => ({
                fetchId,
                actionMenuAllowCustomChildren: true,
                onActionMenuAction: setAction,
                actionMenuChildren: <AppointmentMenu appointment={entity} onAction={setAction} />,
            })}
            extraDialogs={({action, setAction, entity, setEntity}) => (
                <AppointmentDialogs
                    action={action}
                    appointment={entity}
                    onClose={() => setAction("")}
                    onUpdated={(updated) => setEntity({...entity, ...updated})}
                />
            )}
        >
            {({entity: row, setAction}) => (
                <>
                    <EntityCard.Header titlePath="number" title={row.number}>
                        <AppointmentMenu appointment={row} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconStatusChange}
                            label={resolveLanguageKey("status")}
                            tooltip={resolveLanguageKey("status")}
                            path="status"
                            type="enum"
                            languageKeyCategory="statusValues"
                            value={row.status}
                        />
                        <EntityCardRow
                            icon={IconCalendarEvent}
                            label={resolveLanguageKey("startAt")}
                            tooltip={resolveLanguageKey("startAt")}
                            path="startAt"
                            type="dateTime"
                            value={row.startAt}
                        />
                        <EntityCardRow
                            icon={IconStethoscope}
                            label={resolveLanguageKey("practitioner")}
                            tooltip={resolveLanguageKey("practitioner")}
                            path="practitioner"
                            value={row.practitioner?.displayName}
                        />
                        <EntityCardRow
                            icon={IconUser}
                            label={resolveLanguageKey("patient")}
                            tooltip={resolveLanguageKey("patient")}
                            path="patient"
                            value={`${row.patient.firstName} ${row.patient.lastName}`}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/appointments/center/cardView/appointmentCard.tsx"),
    withDebug(true, true, "appointments"),
)(AppointmentCard);
