import {compose} from "redux";
import type {RefObject} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconCalendarEvent, IconMapPin} from "@tabler/icons-react";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import type {ScheduleException} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/scheduleException/scheduleException.dto.ts";
import ScheduleExceptionSheetView from "@dentalClinicModule/clients/panel/private/timeOff/center/sheetView/scheduleExceptionSheetView.tsx";
import {scheduleExceptionEditPath} from "@dentalClinicModule/clients/panel/private/timeOff/index.tsx";

type ScheduleExceptionCardProps = WithLanguageType & {
    scheduleException: ScheduleException;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: ScheduleException, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<ScheduleException> | null>;
};

function ScheduleExceptionCard({
    scheduleException,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: ScheduleExceptionCardProps) {
    return (
        <EntityCard
            resource="scheduleexceptions"
            entity={scheduleException}
            fetchId={fetchId}
            singleUrl="/api/dentalClinic/scheduleException/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={scheduleExceptionEditPath}
            Sheet={ScheduleExceptionSheetView}
            sheetEntityProp="scheduleException"
            deleteUrl="/api/dentalClinic/scheduleException"
            restoreUrl="/api/dentalClinic/scheduleException/restore"
            failedTitle={String(resolveLanguageKey("failedTitle"))}
            failedDescription={String(resolveLanguageKey("failedDescription"))}
            titlePath="practitioner"
            innerRef={innerRef}
        >
            {({entity: row}) => (
                <>
                    <EntityCard.Header titlePath="practitioner" title={row.practitioner?.displayName ?? row.location?.name} />
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconCalendarEvent}
                            label={resolveLanguageKey("startAt")}
                            tooltip={resolveLanguageKey("startAt")}
                            path="startAt"
                            type="dateTime"
                            value={row.startAt}
                        />
                        <EntityCardRow
                            icon={IconCalendarEvent}
                            label={resolveLanguageKey("endAt")}
                            tooltip={resolveLanguageKey("endAt")}
                            path="endAt"
                            type="dateTime"
                            value={row.endAt}
                        />
                        <EntityCardRow
                            icon={IconMapPin}
                            label={resolveLanguageKey("location")}
                            tooltip={resolveLanguageKey("location")}
                            path="location"
                            value={row.location?.name}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/timeOff/center/cardView/scheduleExceptionCard.tsx"),
    withDebug(true, true, "scheduleexceptions"),
)(ScheduleExceptionCard);
