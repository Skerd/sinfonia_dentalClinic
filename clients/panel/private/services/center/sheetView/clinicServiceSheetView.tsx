import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import type {ClinicService} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicService/clinicService.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";

type ClinicServiceSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clinicService?: ClinicService;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    onSheetRowPatched?: (patch: Partial<ClinicService>) => void;
    fetchId?: string;
};

function ClinicServiceSheetView({
    open,
    onOpenChange,
    clinicService: clinicServiceProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    onSheetRowPatched,
    fetchId,
}: ClinicServiceSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(clinicServiceProp || {_id: fetchId});
    const access = useAccess("clinicservices");
    const viewConfig = useViewConfig("clinicservices", "sheet");

    useEffect(() => {
        if (!clinicServiceProp) return;
        setSheetData(clinicServiceProp);
    }, [clinicServiceProp]);

    const entityId = clinicServiceProp?._id ?? fetchId;
    if (!viewConfig || !entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/dentalClinic/clinicService/single"
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
            editPath={`/dentalClinic/services/edit?clinicServiceId=${entityId}`}
            onSheetRowPatched={(row) => {
                setSheetData(row);
                onSheetRowPatched?.(row as Partial<ClinicService>);
            }}
        />
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/services/center/sheetView/clinicServiceSheetView.tsx"),
    withDebug(true, true, "clinicservices"),
)(ClinicServiceSheetView);
