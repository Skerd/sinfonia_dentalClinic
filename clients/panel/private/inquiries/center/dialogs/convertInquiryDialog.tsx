import {useImperativeHandle} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import ConfirmDialog from "@coreModule/components/custom/confirmDialog.tsx";
import type {ClinicInquiry} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicInquiry/clinicInquiry.dto.ts";

type Props = WithLanguageType & WithAxiosType<ClinicInquiry, {_id: string}> & {
    inquiry: ClinicInquiry;
    onClose: () => void;
    onUpdated: (updated: ClinicInquiry) => void;
};

/** Opens the patient's folder at this clinic from the request. */
function ConvertInquiryDialog({inquiry, onClose, onUpdated, resolveLanguageKey, onFilterChange, innerRef, loading}: Props) {
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
            handleConfirm={() => onFilterChange({_id: inquiry._id})}
        />
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/inquiries/center/dialogs/convertInquiryDialog.tsx"),
    withAxios<ClinicInquiry, {_id: string}>({url: "/api/dentalClinic/clinicInquiry/convert", method: "POST", data: {}}, true),
    withDebug(true, true, "clinicinquiries"),
)(ConvertInquiryDialog);
