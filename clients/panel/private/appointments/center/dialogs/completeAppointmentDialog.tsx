import {useImperativeHandle} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import ConfirmDialog from "@coreModule/components/custom/confirmDialog.tsx";
import type {Appointment} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/appointment/appointment.dto.ts";

type Props = WithLanguageType & WithAxiosType<Appointment, {_id: string}> & {
    appointment: Appointment;
    onClose: () => void;
    onUpdated: (updated: Appointment) => void;
};

/** The visit happened. */
function CompleteAppointmentDialog({appointment, onClose, onUpdated, resolveLanguageKey, onFilterChange, innerRef, loading}: Props) {
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
            handleConfirm={() => onFilterChange({_id: appointment._id})}
        />
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/appointments/center/dialogs/completeAppointmentDialog.tsx"),
    withAxios<Appointment, {_id: string}>({url: "/api/dentalClinic/appointment/complete", method: "POST", data: {}}, true),
    withDebug(true, true, "appointments"),
)(CompleteAppointmentDialog);
