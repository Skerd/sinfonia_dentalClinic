import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import type {ClinicLocation} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicLocation/clinicLocation.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ActivateClinicLocation from "@dentalClinicModule/clients/panel/private/locations/center/actions/activateClinicLocation.tsx";
import DeactivateClinicLocation from "@dentalClinicModule/clients/panel/private/locations/center/actions/deactivateClinicLocation.tsx";
import ActivateClinicLocationDialog from "@dentalClinicModule/clients/panel/private/locations/center/dialogs/activateClinicLocationDialog.tsx";
import DeactivateClinicLocationDialog from "@dentalClinicModule/clients/panel/private/locations/center/dialogs/deactivateClinicLocationDialog.tsx";

type ClinicLocationSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clinicLocation?: ClinicLocation;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    onSheetRowPatched?: (patch: Partial<ClinicLocation>) => void;
    onActiveChanged?: (isActive: boolean) => void;
    fetchId?: string;
};

function ClinicLocationSheetView({
    open,
    onOpenChange,
    clinicLocation: clinicLocationProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    onSheetRowPatched,
    onActiveChanged,
    fetchId,
}: ClinicLocationSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(clinicLocationProp || {_id: fetchId});
    const [action, setAction] = useState("");
    const access = useAccess("cliniclocations");
    const viewConfig = useViewConfig("cliniclocations", "sheet");

    useEffect(() => {
        if (!open) setAction("");
    }, [open]);

    useEffect(() => {
        if (!clinicLocationProp) return;
        setSheetData(clinicLocationProp);
    }, [clinicLocationProp]);

    const entityId = clinicLocationProp?._id ?? fetchId;
    if (!viewConfig || !entityId) return null;

    const asEntity = sheetData as ClinicLocation;

    return (
        <>
            <SheetViewRenderer
                config={viewConfig}
                url="/api/dentalClinic/clinicLocation/single"
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
                editPath={`/dentalClinic/locations/edit?clinicLocationId=${entityId}`}
                onSheetRowPatched={(row) => {
                    setSheetData(row);
                    onSheetRowPatched?.(row as Partial<ClinicLocation>);
                }}
                actionMenuAllowCustomChildren
                actionMenuChildren={
                    <>
                        <ActivateClinicLocation entity={asEntity} onAction={(a: string) => setAction(a)} />
                        <DeactivateClinicLocation entity={asEntity} onAction={(a: string) => setAction(a)} />
                    </>
                }
            />
            {action === "activateClinicLocation" && (
                <ActivateClinicLocationDialog
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
            {action === "deactivateClinicLocation" && (
                <DeactivateClinicLocationDialog
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
    withLanguage("src/modules/dentalClinic/clients/panel/private/locations/center/sheetView/clinicLocationSheetView.tsx"),
    withDebug(true, true, "cliniclocations"),
)(ClinicLocationSheetView);
