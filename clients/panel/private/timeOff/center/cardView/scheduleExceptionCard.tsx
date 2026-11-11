import {compose} from "redux";
import type {RefObject} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconCalendarEvent, IconMapPin} from "@tabler/icons-react";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import {useCompanyTimeZone} from "@coreModule/helpers/hooks/useCompanyTimeZone.ts";
import {formatTimeRange} from "@coreModule/helpers/general/dateTime.ts";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import type {ScheduleException} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/scheduleException/scheduleException.dto.ts";
import ScheduleExceptionSheetView from "@dentalClinicModule/clients/panel/private/timeOff/center/sheetView/scheduleExceptionSheetView.tsx";
import {scheduleExceptionEditPath} from "@dentalClinicModule/clients/panel/private/timeOff/index.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";

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
    const companyTimeZone = useCompanyTimeZone();
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
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            titlePath="practitioner"
            innerRef={innerRef}
        >
            {({entity: row}) => (
                <>
                    <EntityCard.Header
                        titlePath="practitioner"
                        title={row.practitioner?.displayName ?? row.location?.name}
                        badgesBesideTitle
                        badges={row.reason ? <Badge variant="outline" className="text-xs">{resolveLanguageKey(`reasonValues.${row.reason}`)}</Badge> : undefined}
                    />
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconCalendarEvent}
                            label={resolveLanguageKey("when")}
                            tooltip={resolveLanguageKey("when")}
                            path="startAt"
                            value={formatTimeRange(row.startAt, row.endAt, row.location?.timezone ?? companyTimeZone)}
                        />
                        {/* A dentist's time off may be at one location; a closure's location is already the title. */}
                        {row.practitioner && row.location ? (
                            <EntityCardRow icon={IconMapPin} label={resolveLanguageKey("location")} tooltip={resolveLanguageKey("location")} path="location" value={row.location.name} />
                        ) : null}
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
