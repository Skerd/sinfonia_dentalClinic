import {useImperativeHandle, useState} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import ConfirmDialog from "@coreModule/components/custom/confirmDialog.tsx";
import {Checkbox} from "@coreModule/components/ui/checkbox.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import {Textarea} from "@coreModule/components/ui/textarea.tsx";
import {INFO_REQUEST_KINDS, type InfoRequestKind} from "armonia/src/modules/dentalClinic/constants/index.ts";
import type {ClinicInquiry} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicInquiry/clinicInquiry.dto.ts";
import type {RequestInquiryInfoFormType} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicInquiry/clinicInquiry.schema-def.ts";

type Props = WithLanguageType & WithAxiosType<ClinicInquiry, RequestInquiryInfoFormType> & {
    inquiry: ClinicInquiry;
    onClose: () => void;
    onUpdated: (updated: ClinicInquiry) => void;
};

/** Asks the patient for what the clinic needs to quote; they are emailed and see it in their account. */
function RequestInquiryInfoDialog({inquiry, onClose, onUpdated, resolveLanguageKey, onFilterChange, innerRef, loading}: Props) {
    const [kinds, setKinds] = useState<InfoRequestKind[]>(["opg"]);
    const [note, setNote] = useState("");
    useImperativeHandle(innerRef, () => ({success: (data) => { onUpdated(data); onClose(); }}));

    const toggle = (kind: InfoRequestKind, checked: boolean) =>
        setKinds((current) => (checked ? [...current, kind] : current.filter((entry) => entry !== kind)));

    return (
        <ConfirmDialog
            open
            onOpenChange={(next: boolean) => !loading && !next && onClose()}
            title={resolveLanguageKey("title")}
            desc={resolveLanguageKey("description")}
            confirmText={resolveLanguageKey("confirm")}
            cancelBtnText={resolveLanguageKey("cancel")}
            isLoading={loading}
            disabled={!kinds.length}
            handleConfirm={() => onFilterChange({_id: inquiry._id, kinds, ...(note.trim() ? {note: note.trim()} : {})})}
        >
            <div className="flex flex-col gap-3">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {INFO_REQUEST_KINDS.map((kind) => (
                        <label key={kind} className="flex items-center gap-2 text-sm">
                            <Checkbox checked={kinds.includes(kind)} disabled={loading} onCheckedChange={(checked) => toggle(kind, checked === true)} />
                            {resolveLanguageKey(`kind.${kind}`)}
                        </label>
                    ))}
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="inquiry-info-note">{resolveLanguageKey("noteLabel")}</Label>
                    <Textarea id="inquiry-info-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder={resolveLanguageKey("notePlaceholder")} disabled={loading} />
                </div>
            </div>
        </ConfirmDialog>
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/inquiries/center/dialogs/requestInquiryInfoDialog.tsx"),
    withAxios<ClinicInquiry, RequestInquiryInfoFormType>({url: "/api/dentalClinic/clinicInquiry/requestInfo", method: "POST", data: {}}, true),
    withDebug(true, true, "clinicinquiries"),
)(RequestInquiryInfoDialog);
