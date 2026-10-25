import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import type {ClinicService} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicService/clinicService.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ActivateClinicService from "@dentalClinicModule/clients/panel/private/services/center/actions/activateClinicService.tsx";
import DeactivateClinicService from "@dentalClinicModule/clients/panel/private/services/center/actions/deactivateClinicService.tsx";
import ActivateClinicServiceDialog from "@dentalClinicModule/clients/panel/private/services/center/dialogs/activateClinicServiceDialog.tsx";
import DeactivateClinicServiceDialog from "@dentalClinicModule/clients/panel/private/services/center/dialogs/deactivateClinicServiceDialog.tsx";

type ClinicServiceSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clinicService?: ClinicService;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    onSheetRowPatched?: (patch: Partial<ClinicService>) => void;
    onActiveChanged?: (isActive: boolean) => void;
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
    onActiveChanged,
    fetchId,
}: ClinicServiceSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(clinicServiceProp || {_id: fetchId});
    const [action, setAction] = useState("");
    const access = useAccess("clinicservices");
    const viewConfig = useViewConfig("clinicservices", "sheet");

    useEffect(() => {
        if (!open) setAction("");
    }, [open]);

    useEffect(() => {
        if (!clinicServiceProp) return;
        setSheetData(clinicServiceProp);
    }, [clinicServiceProp]);

    const entityId = clinicServiceProp?._id ?? fetchId;
    if (!viewConfig || !entityId) return null;

    const asEntity = sheetData as ClinicService;

    return (
        <>
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
                actionMenuAllowCustomChildren
                actionMenuChildren={
                    <>
                        <ActivateClinicService entity={asEntity} onAction={(a: string) => setAction(a)} />
                        <DeactivateClinicService entity={asEntity} onAction={(a: string) => setAction(a)} />
                    </>
                }
            />
            {action === "activateClinicService" && (
                <ActivateClinicServiceDialog
                    open
                    onClose={() => setAction("")}
                    entity={asEntity}
                    onSuccess={() => {
                        setSheetData((prev) => ({...prev, isActive: true}));
                        onSheetRowPatched?.({isActive: true});
                        onActiveChanged?.(true);
                    }}
                />
            )}
            {action === "deactivateClinicService" && (
                <DeactivateClinicServiceDialog
                    open
                    onClose={() => setAction("")}
                    entity={asEntity}
                    onSuccess={() => {
                        setSheetData((prev) => ({...prev, isActive: false}));
                        onSheetRowPatched?.({isActive: false});
                        onActiveChanged?.(false);
                    }}
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/services/center/sheetView/clinicServiceSheetView.tsx"),
    withDebug(true, true, "clinicservices"),
)(ClinicServiceSheetView);
