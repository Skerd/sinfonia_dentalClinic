import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import type {PatientTrip} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/patientTrip/patientTrip.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";

type PatientTripSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patientTrip?: PatientTrip;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    onSheetRowPatched?: (patch: Partial<PatientTrip>) => void;
    fetchId?: string;
};

function PatientTripSheetView({
    open,
    onOpenChange,
    patientTrip: patientTripProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    onSheetRowPatched,
    fetchId,
}: PatientTripSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(patientTripProp || {_id: fetchId});
    const access = useAccess("patienttrips");
    const viewConfig = useViewConfig("patienttrips", "sheet");

    useEffect(() => {
        if (!patientTripProp) return;
        setSheetData(patientTripProp);
    }, [patientTripProp]);

    const entityId = patientTripProp?._id ?? fetchId;
    if (!viewConfig || !entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/dentalClinic/patientTrip/single"
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
            editPath={`/dentalClinic/trips/edit?patientTripId=${entityId}`}
            onSheetRowPatched={(row) => {
                setSheetData(row);
                onSheetRowPatched?.(row as Partial<PatientTrip>);
            }}
        />
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/trips/center/sheetView/patientTripSheetView.tsx"),
    withDebug(true, true, "patienttrips"),
)(PatientTripSheetView);
