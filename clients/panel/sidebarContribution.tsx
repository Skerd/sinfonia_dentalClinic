import {IconCalendarEvent, IconCalendarOff, IconLayoutColumns, IconMapPin, IconStethoscope, IconDental, IconFolders, IconInbox, IconFileInvoice, IconPlaneArrival, IconStar} from "@tabler/icons-react";
import type {SidebarContribution} from "@coreModule/helpers/types/sidebarContribution.types.ts";
import type {NavGroup, NavItem} from "@coreModule/helpers/types/sidebarNav.types.ts";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";

/** Appointments, patients, and the rest of the day's work. Setup is under Tenancy → Configurations. */
const dentalClinicSidebarContribution: SidebarContribution = {
    id: "dentalClinic",
    order: 37,
    getNavGroups(resolveLanguageKey: ResolveLanguageKey): NavGroup[] {
        const item = (key: string, icon: NavItem["icon"], permission: string): NavItem => ({
            title: resolveLanguageKey(`menus.dentalClinic.${key}.title`),
            url: `/dentalClinic/${key}`,
            icon,
            permissions: [permission],
            usersPermissions: [],
            atLeastOnePermission: true,
        });
        return [
            {
                title: resolveLanguageKey("menus.dentalClinic.title"),
                permissions: [],
                usersPermissions: [],
                atLeastOnePermission: true,
                items: [
                    item("day", IconLayoutColumns, "appointments"),
                    item("appointments", IconCalendarEvent, "appointments"),
                    item("inquiries", IconInbox, "clinicinquiries"),
                    item("plans", IconFileInvoice, "treatmentplans"),
                    item("patients", IconFolders, "patients"),
                    item("trips", IconPlaneArrival, "patienttrips"),
                    item("reviews", IconStar, "clinicreviews"),
                    item("team", IconStethoscope, "practitioners"),
                    item("timeOff", IconCalendarOff, "scheduleexceptions"),
                    item("services", IconDental, "clinicservices"),
                    item("locations", IconMapPin, "cliniclocations"),
                ],
            },
        ];
    },
};

export default dentalClinicSidebarContribution;
