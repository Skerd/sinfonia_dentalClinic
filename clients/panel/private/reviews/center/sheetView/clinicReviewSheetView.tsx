import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import type {ClinicReview} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicReview/clinicReview.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ReportMenuItem, {REPORT_TO_PLATFORM_ACTION} from "@coreModule/components/custom/report/reportMenuItem.tsx";
import {CLINIC_REVIEW_REPORT_KIND} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicReview/clinicReview.dto.ts";
import {ReportDialog} from "@coreModule/components/custom/report/reportButton.tsx";

type ClinicReviewSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clinicReview?: ClinicReview;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    onSheetRowPatched?: (patch: Partial<ClinicReview>) => void;
    fetchId?: string;
};

function ClinicReviewSheetView({
    open,
    onOpenChange,
    clinicReview: clinicReviewProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    onSheetRowPatched,
    fetchId,
}: ClinicReviewSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(clinicReviewProp || {_id: fetchId});
    const [action, setAction] = useState("");
    const access = useAccess("clinicreviews");
    const viewConfig = useViewConfig("clinicreviews", "sheet");

    useEffect(() => {
        if (!open) setAction("");
    }, [open]);

    useEffect(() => {
        if (!clinicReviewProp) return;
        setSheetData(clinicReviewProp);
    }, [clinicReviewProp]);

    const entityId = clinicReviewProp?._id ?? fetchId;
    if (!viewConfig || !entityId) return null;

    const asEntity = sheetData as ClinicReview;

    return (
        <>
            <SheetViewRenderer
                config={viewConfig}
                url="/api/dentalClinic/clinicReview/single"
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
                hideEdit
                editPath=""
                onSheetRowPatched={(row) => {
                    setSheetData(row);
                    onSheetRowPatched?.(row as Partial<ClinicReview>);
                }}
                actionMenuAllowCustomChildren
                actionMenuChildren={<ReportMenuItem hidden={asEntity.hiddenByPlatform} onAction={(a: string) => setAction(a)} />}
            />
            {action === REPORT_TO_PLATFORM_ACTION && (
                <ReportDialog kind={CLINIC_REVIEW_REPORT_KIND} recordId={asEntity._id} open onOpenChange={(next) => { if (!next) setAction(""); }} />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/reviews/center/sheetView/clinicReviewSheetView.tsx"),
    withDebug(true, true, "clinicreviews"),
)(ClinicReviewSheetView);
