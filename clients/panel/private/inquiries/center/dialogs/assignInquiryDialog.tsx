import {useImperativeHandle, useState} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import ConfirmDialog from "@coreModule/components/custom/confirmDialog.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import {ApiSelect} from "@coreModule/components/viewEngine/widgets/inputs/apiSelect/apiSelect.tsx";
import type {ClinicInquiry} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicInquiry/clinicInquiry.dto.ts";
import type {AssignInquiryFormType} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicInquiry/clinicInquiry.schema-def.ts";

/** Staff only: patients are company members too (as customers). */
const STAFF_ONLY = {administration: true};

type Props = WithLanguageType & WithAxiosType<ClinicInquiry, AssignInquiryFormType> & {
    inquiry: ClinicInquiry;
    onClose: () => void;
    onUpdated: (updated: ClinicInquiry) => void;
};

/** Who answers this request; they are told about the patient's messages and files. Empty unassigns. */
function AssignInquiryDialog({inquiry, onClose, onUpdated, resolveLanguageKey, onFilterChange, innerRef, loading}: Props) {
    const [assignedTo, setAssignedTo] = useState(inquiry.assignedTo?._id ?? "");
    useImperativeHandle(innerRef, () => ({success: (data) => { onUpdated(data); onClose(); }}));
    const current = inquiry.assignedTo ? [{value: inquiry.assignedTo._id, label: `${inquiry.assignedTo.name} ${inquiry.assignedTo.surname}`.trim()}] : [];

    return (
        <ConfirmDialog
            open
            onOpenChange={(next: boolean) => !loading && !next && onClose()}
            title={resolveLanguageKey("title")}
            desc={resolveLanguageKey("description")}
            confirmText={resolveLanguageKey("confirm")}
            cancelBtnText={resolveLanguageKey("cancel")}
            isLoading={loading}
            handleConfirm={() => onFilterChange({_id: inquiry._id, ...(assignedTo ? {assignedTo} : {})})}
        >
            <div className="flex flex-col gap-2">
                <Label>{resolveLanguageKey("userLabel")}</Label>
                <ApiSelect
                    apiUrl="/api/company/users/select"
                    postBody={STAFF_ONLY}
                    pageSize={50}
                    value={assignedTo}
                    defaultOptions={current}
                    placeholder={String(resolveLanguageKey("userPlaceholder"))}
                    disabled={loading}
                    onValueChange={(value: string | string[]) => setAssignedTo(typeof value === "string" ? value : "")}
                />
            </div>
        </ConfirmDialog>
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/inquiries/center/dialogs/assignInquiryDialog.tsx"),
    withAxios<ClinicInquiry, AssignInquiryFormType>({url: "/api/dentalClinic/clinicInquiry/assign", method: "POST", data: {}}, true),
    withDebug(true, true, "clinicinquiries"),
)(AssignInquiryDialog);
