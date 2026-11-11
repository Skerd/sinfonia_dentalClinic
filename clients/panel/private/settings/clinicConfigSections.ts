/** Path segments under `/tenancy/systemSettings/clinicConfig/`. One page per settings block. */
export const CLINIC_CONFIG_SECTIONS = ["booking", "prices", "patients", "privacy", "alerts", "inquiries", "profile"] as const;

export type ClinicConfigSection = (typeof CLINIC_CONFIG_SECTIONS)[number];

export function isClinicConfigSection(value: string | undefined): value is ClinicConfigSection {
    return !!value && (CLINIC_CONFIG_SECTIONS as readonly string[]).includes(value);
}

export function clinicConfigSectionPath(section: ClinicConfigSection): string {
    return `/tenancy/systemSettings/clinicConfig/${section}`;
}
