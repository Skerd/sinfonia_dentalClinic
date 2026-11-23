import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import type {ClinicReview} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicReview/clinicReview.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import PublishClinicReview from "@dentalClinicModule/clients/panel/private/reviews/center/actions/publishClinicReview.tsx";
import UnpublishClinicReview from "@dentalClinicModule/clients/panel/private/reviews/center/actions/unpublishClinicReview.tsx";
import PublishClinicReviewDialog from "@dentalClinicModule/clients/panel/private/reviews/center/dialogs/publishClinicReviewDialog.tsx";
import UnpublishClinicReviewDialog from "@dentalClinicModule/clients/panel/private/reviews/center/dialogs/unpublishClinicReviewDialog.tsx";

type ClinicReviewSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clinicReview?: ClinicReview;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    onSheetRowPatched?: (patch: Partial<ClinicReview>) => void;
    onPublishedChanged?: (isPublished: boolean) => void;
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
    onPublishedChanged,
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
                editPath={`/dentalClinic/reviews/edit?clinicReviewId=${entityId}`}
                onSheetRowPatched={(row) => {
                    setSheetData(row);
                    onSheetRowPatched?.(row as Partial<ClinicReview>);
                }}
                actionMenuAllowCustomChildren
                actionMenuChildren={
                    <>
                        <PublishClinicReview entity={asEntity} onAction={(a: string) => setAction(a)} />
                        <UnpublishClinicReview entity={asEntity} onAction={(a: string) => setAction(a)} />
                    </>
                }
            />
            {action === "publishClinicReview" && (
                <PublishClinicReviewDialog
                    open
                    onClose={() => setAction("")}
                    entity={asEntity}
                    onSuccess={() => {
                        setSheetData((prev) => ({...prev, isPublished: true}));
                        onSheetRowPatched?.({isPublished: true});
                        onPublishedChanged?.(true);
                    }}
                />
            )}
            {action === "unpublishClinicReview" && (
                <UnpublishClinicReviewDialog
                    open
                    onClose={() => setAction("")}
                    entity={asEntity}
                    onSuccess={() => {
                        setSheetData((prev) => ({...prev, isPublished: false}));
                        onSheetRowPatched?.({isPublished: false});
                        onPublishedChanged?.(false);
                    }}
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/reviews/center/sheetView/clinicReviewSheetView.tsx"),
    withDebug(true, true, "clinicreviews"),
)(ClinicReviewSheetView);
