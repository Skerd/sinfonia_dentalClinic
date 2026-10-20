import {useImperativeHandle, useState} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import ConfirmDialog from "@coreModule/components/custom/confirmDialog.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import {Textarea} from "@coreModule/components/ui/textarea.tsx";
import type {Appointment} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/appointment/appointment.dto.ts";
import type {CancelAppointmentFormType} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/appointment/appointment.forms.ts";

type Props = WithLanguageType & WithAxiosType<Appointment, CancelAppointmentFormType> & {
    appointment: Appointment;
    onClose: () => void;
    onUpdated: (updated: Appointment) => void;
};

/** Staff cancellation, at any time before the visit. */
function CancelAppointmentDialog({appointment, onClose, onUpdated, resolveLanguageKey, onFilterChange, innerRef, loading}: Props) {
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
            handleConfirm={() => onFilterChange({_id: appointment._id, ...(reason.trim() ? {reason: reason.trim()} : {})})}
        >
            <div className="flex flex-col gap-2">
                <Label htmlFor="appointment-cancel-reason">{resolveLanguageKey("reasonLabel")}</Label>
                <Textarea id="appointment-cancel-reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={resolveLanguageKey("reasonPlaceholder")} disabled={loading} />
            </div>
        </ConfirmDialog>
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/appointments/center/dialogs/cancelAppointmentDialog.tsx"),
    withAxios<Appointment, CancelAppointmentFormType>({url: "/api/dentalClinic/appointment/cancel", method: "POST", data: {}}, true),
    withDebug(true, true, "appointments"),
)(CancelAppointmentDialog);
