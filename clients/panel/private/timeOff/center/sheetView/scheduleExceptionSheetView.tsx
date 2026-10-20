import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import type {ScheduleException} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/scheduleException/scheduleException.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";

type ScheduleExceptionSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    scheduleException?: ScheduleException;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    onSheetRowPatched?: (patch: Partial<ScheduleException>) => void;
    fetchId?: string;
};

function ScheduleExceptionSheetView({
    open,
    onOpenChange,
    scheduleException: scheduleExceptionProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    onSheetRowPatched,
    fetchId,
}: ScheduleExceptionSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(scheduleExceptionProp || {_id: fetchId});
    const access = useAccess("scheduleexceptions");
    const viewConfig = useViewConfig("scheduleexceptions", "sheet");

    useEffect(() => {
        if (!scheduleExceptionProp) return;
        setSheetData(scheduleExceptionProp);
    }, [scheduleExceptionProp]);

    const entityId = scheduleExceptionProp?._id ?? fetchId;
    if (!viewConfig || !entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/dentalClinic/scheduleException/single"
            fetchId={fetchId ?? entityId}
            onDataFetched={(data) => setSheetData(data)}
            data={sheetData}
            open={open}
            onOpenChange={onOpenChange}
            resolveLanguageKey={resolveLanguageKey}
            access={access}
            hideActions={hideActions}
            onDelete={onDelete}
            onRestore={onRestore}
            editPath={`/dentalClinic/timeOff/edit?scheduleExceptionId=${entityId}`}
            onSheetRowPatched={(row) => {
                setSheetData(row);
                onSheetRowPatched?.(row as Partial<ScheduleException>);
            }}
        />
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/timeOff/center/sheetView/scheduleExceptionSheetView.tsx"),
    withDebug(true, true, "scheduleexceptions"),
)(ScheduleExceptionSheetView);
