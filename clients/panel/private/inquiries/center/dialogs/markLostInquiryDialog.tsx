import {useImperativeHandle, useState} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import ConfirmDialog from "@coreModule/components/custom/confirmDialog.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import {Textarea} from "@coreModule/components/ui/textarea.tsx";
import type {ClinicInquiry} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicInquiry/clinicInquiry.dto.ts";
import type {CloseInquiryFormType} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicInquiry/clinicInquiry.schema-def.ts";

type Props = WithLanguageType & WithAxiosType<ClinicInquiry, CloseInquiryFormType> & {
    inquiry: ClinicInquiry;
    onClose: () => void;
    onUpdated: (updated: ClinicInquiry) => void;
};

/** The patient went elsewhere or stopped answering; they are not told. The clinic loses access to the patient's files. */
function MarkLostInquiryDialog({inquiry, onClose, onUpdated, resolveLanguageKey, onFilterChange, innerRef, loading}: Props) {
    const [reason, setReason] = useState("");
    useImperativeHandle(innerRef, () => ({success: (data) => { onUpdated(data); onClose(); }}));

    return (
        <ConfirmDialog
            open
            onOpenChange={(next: boolean) => !loading && !next && onClose()}
            title={resolveLanguageKey("title")}
            desc={resolveLanguageKey("description")}
            confirmText={resolveLanguageKey("confirm")}
            cancelBtnText={resolveLanguageKey("cancel")}
            isLoading={loading}
            destructive
            handleConfirm={() => onFilterChange({_id: inquiry._id, ...(reason.trim() ? {reason: reason.trim()} : {})})}
        >
            <div className="flex flex-col gap-2">
                <Label htmlFor="inquiry-markLost-reason">{resolveLanguageKey("reasonLabel")}</Label>
                <Textarea id="inquiry-markLost-reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={resolveLanguageKey("reasonPlaceholder")} disabled={loading} />
            </div>
        </ConfirmDialog>
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/inquiries/center/dialogs/markLostInquiryDialog.tsx"),
    withAxios<ClinicInquiry, CloseInquiryFormType>({url: "/api/dentalClinic/clinicInquiry/markLost", method: "POST", data: {}}, true),
    withDebug(true, true, "clinicinquiries"),
)(MarkLostInquiryDialog);
