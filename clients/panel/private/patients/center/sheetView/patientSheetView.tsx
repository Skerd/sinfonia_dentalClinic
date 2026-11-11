import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import type {Patient} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/patient/patient.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import MedicalHistoryAnswers from "@dentalClinicModule/clients/panel/private/patients/center/sheetView/medicalHistoryAnswers.tsx";
import SheetNameTitle from "@dentalClinicModule/clients/panel/private/shared/sheetNameTitle.tsx";

type PatientSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patient?: Patient;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    onSheetRowPatched?: (patch: Partial<Patient>) => void;
    fetchId?: string;
};

function PatientSheetView({
    open,
    onOpenChange,
    patient: patientProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    onSheetRowPatched,
    fetchId,
}: PatientSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(patientProp || {_id: fetchId});
    const access = useAccess("patients");
    const viewConfig = useViewConfig("patients", "sheet");

    useEffect(() => {
        if (!patientProp) return;
        setSheetData(patientProp);
    }, [patientProp]);

    const entityId = patientProp?._id ?? fetchId;
    if (!viewConfig || !entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/dentalClinic/patient/single"
            fetchId={fetchId ?? entityId}
            onDataFetched={(data) => setSheetData(data)}
            data={sheetData}
            open={open}
            onOpenChange={onOpenChange}
            resolveLanguageKey={resolveLanguageKey}
            headerTitle={<SheetNameTitle name={`${(sheetData as Patient)?.firstName ?? ""} ${(sheetData as Patient)?.lastName ?? ""}`.trim()} code={(sheetData as Patient).number} typeLabel={String(resolveLanguageKey("patientSubtitle"))} />}
            access={access}
            hideActions={hideActions}
            onDelete={onDelete}
            onRestore={onRestore}
            editPath={`/dentalClinic/patients/edit?patientId=${entityId}`}
            onSheetRowPatched={(row) => {
                setSheetData(row);
                onSheetRowPatched?.(row as Partial<Patient>);
            }}
        >
            {(sheetData as Patient).number ? <MedicalHistoryAnswers history={(sheetData as Patient).medicalHistory} /> : null}
        </SheetViewRenderer>
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/patients/center/sheetView/patientSheetView.tsx"),
    withDebug(true, true, "patients"),
)(PatientSheetView);
