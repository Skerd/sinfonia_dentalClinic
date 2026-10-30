import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {FORM_EXTRAS_OBJECT_ID_CHIP_LABEL_REFS} from "@coreModule/components/custom/inputs/objectIdChipsInput.tsx";
import {editClinicConfigFormSchema} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicConfig/editClinicConfig.form.validator.ts";
import type {EditClinicConfigFormType} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicConfig/clinicConfig.schema-def.ts";
import type {ClinicConfig} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicConfig/clinicConfig.dto.ts";
import type {SimpleBlankUser} from "armonia/src/modules/core/dto/user.dto.ts";
import {getName} from "@coreModule/helpers/general/names.ts";
import {isClinicConfigSection, type ClinicConfigSection} from "@dentalClinicModule/clients/panel/private/settings/clinicConfigSections.ts";

/** Matches `skipRenderWhenFormExtraNotTruthy` on each block in `clinicConfig.views.ts`. */
const SECTION_FLAGS: Record<ClinicConfigSection, string> = {
    booking: "sectionBooking",
    patients: "sectionPatients",
    privacy: "sectionPrivacy",
    alerts: "sectionAlerts",
    inquiries: "sectionInquiries",
    profile: "sectionProfile",
};

function openSectionFlag(): string {
    const segment = window.location.pathname.split("/").filter(Boolean)[3];
    const section: ClinicConfigSection = isClinicConfigSection(segment) ? segment : "booking";
    return SECTION_FLAGS[section];
}

const chipLabelState = {
    loadedId: null as string | null,
    notifyUsers: {current: {} as Record<string, string>},
    inquiryNotifyUsers: {current: {} as Record<string, string>},
};

function userDisplayName(user: SimpleBlankUser): string {
    return getName(user) || user._id;
}

export default createGenericEditPage<ClinicConfig, EditClinicConfigFormType>({
    languagePath: "src/modules/dentalClinic/clients/panel/private/settings/editClinicConfig.tsx",
    collectionName: "clinicconfigs",
    accessModel: "clinicconfigs",
    apiUrl: "/api/dentalClinic/clinicConfig",
    schema: editClinicConfigFormSchema,
    mapEntityData: (data) => ({
        ...data,
        currency: data.currency?._id,
        notifyUsers: data.notifyUsers?.map((user) => user._id) ?? [],
        inquiryNotifyUsers: data.inquiryNotifyUsers?.map((user) => user._id) ?? [],
    }),
    buildFormExtras: (_entityId, _params, entity) => {
        if (entity && chipLabelState.loadedId !== entity._id) {
            chipLabelState.loadedId = entity._id;
            chipLabelState.notifyUsers.current = {};
            chipLabelState.inquiryNotifyUsers.current = {};
        }
        const users = entity?.notifyUsers?.filter((user) => !!user?._id) ?? [];
        for (const user of users) chipLabelState.notifyUsers.current[user._id] = userDisplayName(user);
        const inquiryUsers = entity?.inquiryNotifyUsers?.filter((user) => !!user?._id) ?? [];
        for (const user of inquiryUsers) chipLabelState.inquiryNotifyUsers.current[user._id] = userDisplayName(user);
        return {
            notifyUsers: users.map((user) => ({value: user._id, label: userDisplayName(user)})),
            inquiryNotifyUsers: inquiryUsers.map((user) => ({value: user._id, label: userDisplayName(user)})),
            [FORM_EXTRAS_OBJECT_ID_CHIP_LABEL_REFS]: {
                notifyUsers: chipLabelState.notifyUsers,
                inquiryNotifyUsers: chipLabelState.inquiryNotifyUsers,
            },
            [openSectionFlag()]: true,
        };
    },
    submitIcon: <Save />,
});
