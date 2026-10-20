import {useImperativeHandle, useState} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import ConfirmDialog from "@coreModule/components/custom/confirmDialog.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import type {Appointment} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/appointment/appointment.dto.ts";
import type {RescheduleAppointmentFormType} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/appointment/appointment.forms.ts";

type Props = WithLanguageType & WithAxiosType<Appointment, RescheduleAppointmentFormType> & {
    appointment: Appointment;
    onClose: () => void;
    onUpdated: (updated: Appointment) => void;
};

/** New start in the location's local time, with the same dentist. Checked like a new booking. */
function RescheduleAppointmentDialog({appointment, onClose, onUpdated, resolveLanguageKey, onFilterChange, innerRef, loading}: Props) {
    const [date, setDate] = useState("");
    const [time, setTime] = useState("09:00");
    useImperativeHandle(innerRef, () => ({success: (data) => { onUpdated(data); onClose(); }}));

    return (
        <ConfirmDialog
            open
            onOpenChange={(next: boolean) => !loading && !next && onClose()}
            title={resolveLanguageKey("title")}
            desc={`${resolveLanguageKey("description")} (${appointment.snapshot?.timezone ?? ""})`}
            confirmText={resolveLanguageKey("confirm")}
            cancelBtnText={resolveLanguageKey("cancel")}
            isLoading={loading}
            disabled={!date || !time}
            handleConfirm={() => onFilterChange({_id: appointment._id, date, time})}
        >
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="appointment-move-date">{resolveLanguageKey("dateLabel")}</Label>
                    <Input id="appointment-move-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} disabled={loading} />
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="appointment-move-time">{resolveLanguageKey("timeLabel")}</Label>
                    <Input id="appointment-move-time" type="time" step={300} value={time} onChange={(e) => setTime(e.target.value)} disabled={loading} />
                </div>
            </div>
        </ConfirmDialog>
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/appointments/center/dialogs/rescheduleAppointmentDialog.tsx"),
    withAxios<Appointment, RescheduleAppointmentFormType>({url: "/api/dentalClinic/appointment/reschedule", method: "POST", data: {}}, true),
    withDebug(true, true, "appointments"),
)(RescheduleAppointmentDialog);
