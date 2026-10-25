import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import type {Practitioner} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/practitioner/practitioner.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ActivatePractitioner from "@dentalClinicModule/clients/panel/private/team/center/actions/activatePractitioner.tsx";
import DeactivatePractitioner from "@dentalClinicModule/clients/panel/private/team/center/actions/deactivatePractitioner.tsx";
import ActivatePractitionerDialog from "@dentalClinicModule/clients/panel/private/team/center/dialogs/activatePractitionerDialog.tsx";
import DeactivatePractitionerDialog from "@dentalClinicModule/clients/panel/private/team/center/dialogs/deactivatePractitionerDialog.tsx";

type PractitionerSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    practitioner?: Practitioner;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    onSheetRowPatched?: (patch: Partial<Practitioner>) => void;
    onActiveChanged?: (isActive: boolean) => void;
    fetchId?: string;
};

function PractitionerSheetView({
    open,
    onOpenChange,
    practitioner: practitionerProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    onSheetRowPatched,
    onActiveChanged,
    fetchId,
}: PractitionerSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(practitionerProp || {_id: fetchId});
    const [action, setAction] = useState("");
    const access = useAccess("practitioners");
    const viewConfig = useViewConfig("practitioners", "sheet");

    useEffect(() => {
        if (!open) setAction("");
    }, [open]);

    useEffect(() => {
        if (!practitionerProp) return;
        setSheetData(practitionerProp);
    }, [practitionerProp]);

    const entityId = practitionerProp?._id ?? fetchId;
    if (!viewConfig || !entityId) return null;

    const asEntity = sheetData as Practitioner;

    return (
        <>
            <SheetViewRenderer
                config={viewConfig}
                url="/api/dentalClinic/practitioner/single"
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
                editPath={`/dentalClinic/team/edit?practitionerId=${entityId}`}
                onSheetRowPatched={(row) => {
                    setSheetData(row);
                    onSheetRowPatched?.(row as Partial<Practitioner>);
                }}
                actionMenuAllowCustomChildren
                actionMenuChildren={
                    <>
                        <ActivatePractitioner entity={asEntity} onAction={(a: string) => setAction(a)} />
                        <DeactivatePractitioner entity={asEntity} onAction={(a: string) => setAction(a)} />
                    </>
                }
            />
            {action === "activatePractitioner" && (
                <ActivatePractitionerDialog
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
            {action === "deactivatePractitioner" && (
                <DeactivatePractitionerDialog
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
    withLanguage("src/modules/dentalClinic/clients/panel/private/team/center/sheetView/practitionerSheetView.tsx"),
    withDebug(true, true, "practitioners"),
)(PractitionerSheetView);
