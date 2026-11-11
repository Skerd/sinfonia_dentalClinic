import {useImperativeHandle, useState} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import ConfirmDialog from "@coreModule/components/custom/confirmDialog.tsx";
import {DateInput} from "@coreModule/components/custom/inputs/dateInput.tsx";
import {companyToday, zonedParts} from "@coreModule/helpers/general/dateTime.ts";
import {Label} from "@coreModule/components/ui/label.tsx";
import type {Appointment} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/appointment/appointment.dto.ts";
import type {RescheduleAppointmentFormType} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/appointment/appointment.forms.ts";

type Props = WithLanguageType & WithAxiosType<Appointment, RescheduleAppointmentFormType> & {
    appointment: Appointment;
    onClose: () => void;
    onUpdated: (updated: Appointment) => void;
};

/** The booking's current start as the location's wall clock, so the dialog opens on it. */
function currentStart(appointment: Appointment): {date: string; time: string} {
    const timeZone = appointment.snapshot?.timezone;
    const start = new Date(appointment.startAt);
    const parts = timeZone ? zonedParts(start, timeZone) : null;
    if (!timeZone || !parts) return {date: "", time: "09:00"};
    return {date: companyToday(timeZone, start), time: `${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`};
}

/** New start in the location's local time, with the same dentist. Checked like a new booking. */
function RescheduleAppointmentDialog({appointment, onClose, onUpdated, resolveLanguageKey, onFilterChange, innerRef, loading}: Props) {
    const [date, setDate] = useState(() => currentStart(appointment).date);
    const [time, setTime] = useState(() => currentStart(appointment).time);
    const timeZone = appointment.snapshot?.timezone;
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
            <div className="grid grid-cols-[minmax(0,1fr)_8rem] gap-4">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="appointment-move-date">{resolveLanguageKey("dateLabel")}</Label>
                    <DateInput
                        id="appointment-move-date"
                        valueFormat="YYYY-MM-DD"
                        value={date}
                        onChange={setDate}
                        minDate={timeZone ? companyToday(timeZone) : undefined}
                        disabled={loading}
                        clearable={false}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="appointment-move-time">{resolveLanguageKey("timeLabel")}</Label>
                    <DateInput id="appointment-move-time" timeOnly valueFormat="HH:mm" value={time} onChange={setTime} clearable={false} disabled={loading} />
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
