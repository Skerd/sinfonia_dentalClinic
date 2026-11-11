/** A new booking starting at an empty slot of the day view; the create page reads these back as its defaults. */
export function appointmentCreatePath(slot: {date: string; time: string; practitioner: string; location: string}) {
    return `/dentalClinic/appointments/create?${new URLSearchParams(slot)}`;
}
