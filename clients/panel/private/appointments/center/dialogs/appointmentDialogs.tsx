import type {Appointment} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/appointment/appointment.dto.ts";
import ConfirmAppointmentDialog from "./confirmAppointmentDialog.tsx";
import RescheduleAppointmentDialog from "./rescheduleAppointmentDialog.tsx";
import CompleteAppointmentDialog from "./completeAppointmentDialog.tsx";
import NoShowAppointmentDialog from "./noShowAppointmentDialog.tsx";
import CancelAppointmentDialog from "./cancelAppointmentDialog.tsx";

/** The dialog for the action picked in an appointment's menu. */
export default function AppointmentDialogs({
    action,
    appointment,
    onClose,
    onUpdated,
}: {
    action: string;
    appointment: Appointment;
    onClose: () => void;
    onUpdated: (updated: Appointment) => void;
}) {
    const props = {appointment, onClose, onUpdated};
    switch (action) {
        case "confirm": return <ConfirmAppointmentDialog {...props} />;
        case "reschedule": return <RescheduleAppointmentDialog {...props} />;
        case "complete": return <CompleteAppointmentDialog {...props} />;
        case "noShow": return <NoShowAppointmentDialog {...props} />;
        case "cancel": return <CancelAppointmentDialog {...props} />;
        default: return null;
    }
}
