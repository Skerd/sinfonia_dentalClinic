import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {ScheduleException} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/scheduleException/scheduleException.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ScheduleExceptionCard from "./center/cardView/scheduleExceptionCard.tsx";
import ScheduleExceptionSheetView from "./center/sheetView/scheduleExceptionSheetView.tsx";

export function scheduleExceptionEditPath(row: {_id: string}) {
    return `/dentalClinic/timeOff/edit?scheduleExceptionId=${row._id}`;
}

function AllScheduleExceptions({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<ScheduleException>
            apiUrl="/api/dentalClinic/scheduleException"
            collectionName="scheduleexceptions"
            accessModel="scheduleexceptions"
            tableConfigKey="scheduleexceptions"
            createPath="/dentalClinic/timeOff/create"
            createIcon={<IconPlus />}
            createLanguageKey="create"
            buildEditPath={scheduleExceptionEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/dentalClinic/clients/panel/private/timeOff/center/sheetView/scheduleExceptionSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderSheet={({open, onOpenChange, entity, onDelete, onRestore}) => (
                <ScheduleExceptionSheetView
                    open={open}
                    onOpenChange={onOpenChange}
                    scheduleException={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                />
            )}
            renderCard={(row, onDelete, onRestore) => (
                <ScheduleExceptionCard
                    scheduleException={row}
                    onDelete={(deleted: ScheduleException | undefined, response?: DeletedData) => onDelete(deleted, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/timeOff/index.tsx"),
    withDebug(true, true, "scheduleexceptions"),
)(AllScheduleExceptions);
