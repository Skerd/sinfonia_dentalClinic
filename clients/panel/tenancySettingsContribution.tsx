import {IconBell, IconCalendarEvent, IconCoins, IconDental, IconInbox, IconMessage, IconShieldLock, IconWorld} from "@tabler/icons-react";
import type {TenancySettingsContribution} from "@coreModule/helpers/types/tenancySettingsContribution.types.ts";
import type {NavLinkItem} from "@coreModule/helpers/types/sidebarNav.types.ts";
import {clinicConfigSectionPath, type ClinicConfigSection} from "@dentalClinicModule/clients/panel/private/settings/clinicConfigSections.ts";

const SECTIONS: {section: ClinicConfigSection; icon: NavLinkItem["icon"]}[] = [
    {section: "booking", icon: IconCalendarEvent},
    {section: "prices", icon: IconCoins},
    {section: "patients", icon: IconMessage},
    {section: "privacy", icon: IconShieldLock},
    {section: "alerts", icon: IconBell},
    {section: "inquiries", icon: IconInbox},
    {section: "profile", icon: IconWorld},
];

/** Clinic setup under Tenancy → Configurations; daily work stays in the Dental clinic sidebar group. */
const dentalClinicTenancySettingsContribution: TenancySettingsContribution = {
    id: "dentalClinic",
    order: 37,
    getTenancySettingsItems(resolveLanguageKey) {
        const item = (section: ClinicConfigSection, icon: NavLinkItem["icon"]): NavLinkItem => ({
            title: resolveLanguageKey(`menus.tenancy.systemSettings.clinicConfig.${section}.title`),
            url: clinicConfigSectionPath(section),
            icon,
            permissions: ["clinicconfigs"],
            usersPermissions: [],
            atLeastOnePermission: true,
        });
        return {
            title: resolveLanguageKey("menus.tenancy.systemSettings.clinicConfig.title"),
            icon: IconDental,
            permissions: [],
            usersPermissions: [],
            atLeastOnePermission: true,
            items: SECTIONS.map(({section, icon}) => item(section, icon)),
        };
    },
};

export default dentalClinicTenancySettingsContribution;
