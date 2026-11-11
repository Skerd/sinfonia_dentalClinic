import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import type {ClinicInquiry} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicInquiry/clinicInquiry.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import InquiryMenu, {type InquiryAction} from "@dentalClinicModule/clients/panel/private/inquiries/center/actions/inquiryMenu.tsx";
import InquiryDialogs from "@dentalClinicModule/clients/panel/private/inquiries/center/dialogs/inquiryDialogs.tsx";
import InquiryRequestDetails from "@dentalClinicModule/clients/panel/private/inquiries/center/sheetView/inquiryRequestDetails.tsx";
import InquiryThread from "@dentalClinicModule/clients/panel/private/inquiries/center/thread/inquiryThread.tsx";
import InquiryPlans from "@dentalClinicModule/clients/panel/private/inquiries/center/sheetView/inquiryPlans.tsx";
import MedicalHistoryAnswers from "@dentalClinicModule/clients/panel/private/patients/center/sheetView/medicalHistoryAnswers.tsx";
import SheetNameTitle from "@dentalClinicModule/clients/panel/private/shared/sheetNameTitle.tsx";
import StatusBadge from "@dentalClinicModule/clients/panel/private/shared/statusBadge.tsx";

type ClinicInquirySheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    inquiry?: ClinicInquiry;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    onSheetRowPatched?: (patch: Partial<ClinicInquiry>) => void;
    fetchId?: string;
};

const CAN_MESSAGE: ClinicInquiry["status"][] = ["new", "in_review", "info_requested", "quoted", "converted"];
const CAN_QUOTE: ClinicInquiry["status"][] = ["new", "in_review", "info_requested", "quoted"];

function ClinicInquirySheetView({
    open,
    onOpenChange,
    inquiry: inquiryProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    onSheetRowPatched,
    fetchId,
}: ClinicInquirySheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(inquiryProp || {_id: fetchId});
    const [action, setAction] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);
    const access = useAccess("clinicinquiries");
    const viewConfig = useViewConfig("clinicinquiries", "sheet");

    useEffect(() => {
        if (!open) setAction("");
    }, [open]);

    useEffect(() => {
        if (!inquiryProp) return;
        setSheetData(inquiryProp);
    }, [inquiryProp]);

    const entityId = inquiryProp?._id ?? fetchId;
    if (!viewConfig || !entityId) return null;
    const inquiry = sheetData as ClinicInquiry;

    const applyUpdate = (updated: ClinicInquiry) => {
        setSheetData(updated);
        onSheetRowPatched?.(updated);
    };

    return (
        <>
            <SheetViewRenderer
                key={refreshKey}
                config={viewConfig}
                url="/api/dentalClinic/clinicInquiry/single"
                fetchId={fetchId ?? entityId}
                onDataFetched={(data) => setSheetData(data)}
                data={sheetData}
                open={open}
                onOpenChange={onOpenChange}
                resolveLanguageKey={resolveLanguageKey}
                headerTitle={<SheetNameTitle name={`${inquiry.contact?.firstName ?? ""} ${inquiry.contact?.lastName ?? ""}`.trim()} code={inquiry.number} typeLabel={String(resolveLanguageKey("inquirySubtitle"))} />}
                headerDescription={<StatusBadge tableConfigKey="clinicinquiries" field="status" value={inquiry.status} label={String(resolveLanguageKey(`statusValues.${inquiry.status}`))} />}
                access={access}
                hideActions={hideActions}
                hideEdit
                onDelete={onDelete}
                onRestore={onRestore}
                editPath=""
                onSheetRowPatched={(row) => {
                    setSheetData(row);
                    onSheetRowPatched?.(row as Partial<ClinicInquiry>);
                }}
                actionMenuAllowCustomChildren
                actionMenuChildren={<InquiryMenu inquiry={inquiry} onAction={(next: InquiryAction) => setAction(next)} />}
            >
                {inquiry.status ? <InquiryRequestDetails inquiry={inquiry} /> : null}
                {inquiry.status ? <MedicalHistoryAnswers history={inquiry.medicalHistory} /> : null}
                {inquiry.status ? <InquiryPlans inquiryId={entityId} canQuote={CAN_QUOTE.includes(inquiry.status)} /> : null}
                {inquiry.status ? (
                    <InquiryThread
                        inquiryId={entityId}
                        canReply={CAN_MESSAGE.includes(inquiry.status)}
                        onSent={() => inquiry.status === "new" && setRefreshKey((key) => key + 1)}
                    />
                ) : null}
            </SheetViewRenderer>
            {action ? <InquiryDialogs action={action} inquiry={inquiry} onClose={() => setAction("")} onUpdated={applyUpdate} /> : null}
        </>
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/inquiries/center/sheetView/clinicInquirySheetView.tsx"),
    withDebug(true, true, "clinicinquiries"),
)(ClinicInquirySheetView);
