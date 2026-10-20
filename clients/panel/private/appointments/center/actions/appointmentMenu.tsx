import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {IconCalendarRepeat, IconCheck, IconCircleCheck, IconUserOff, IconX} from "@tabler/icons-react";
import type {Appointment} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/appointment/appointment.dto.ts";

/** The lifecycle moves an appointment allows in its current state, for the row and sheet menus. */
export type AppointmentAction = "confirm" | "reschedule" | "complete" | "noShow" | "cancel";

type Props = WithLanguageType & {
    appointment: Appointment;
    onAction: (action: AppointmentAction) => void;
};

function AppointmentMenu({appointment, onAction, resolveLanguageKey}: Props) {
    const {write} = useAccess("appointments");
    if (appointment.deletedAt || !write?.status) return null;

    const {status} = appointment;
    const open = status === "pending" || status === "confirmed";
    const item = (action: AppointmentAction, Icon: typeof IconCheck, destructive = false) => (
        <DropdownMenuItem key={action} onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAction(action); }}>
            <Icon size={16} className={destructive ? "text-destructive" : undefined} />
            <p className={destructive ? "text-destructive" : undefined}>{resolveLanguageKey(action)}</p>
        </DropdownMenuItem>
    );

    return (
        <>
            {status === "pending" && item("confirm", IconCheck)}
            {open && item("reschedule", IconCalendarRepeat)}
            {status === "confirmed" && item("complete", IconCircleCheck)}
            {status === "confirmed" && item("noShow", IconUserOff, true)}
            {open && item("cancel", IconX, true)}
        </>
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/appointments/center/actions/appointmentMenu.tsx"),
    withDebug(true, true, "appointments"),
)(AppointmentMenu);
