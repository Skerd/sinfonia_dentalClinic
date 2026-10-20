import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import type {Practitioner} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/practitioner/practitioner.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";

type PractitionerSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    practitioner?: Practitioner;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    onSheetRowPatched?: (patch: Partial<Practitioner>) => void;
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
    fetchId,
}: PractitionerSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(practitionerProp || {_id: fetchId});
    const access = useAccess("practitioners");
    const viewConfig = useViewConfig("practitioners", "sheet");

    useEffect(() => {
        if (!practitionerProp) return;
        setSheetData(practitionerProp);
    }, [practitionerProp]);

    const entityId = practitionerProp?._id ?? fetchId;
    if (!viewConfig || !entityId) return null;

    return (
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
        />
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/team/center/sheetView/practitionerSheetView.tsx"),
    withDebug(true, true, "practitioners"),
)(PractitionerSheetView);
