import type {HomeContribution} from "@coreModule/helpers/types/homeContribution.types.ts";

/**
 * What a new dental clinic company sets up before it can take customers (D178), in the order it needs them; each
 * step is done once its list has a row. Labels are in this module's `menus.json`.
 */
const contribution: HomeContribution = {
    id: "dentalClinic",
    order: 30,
    getSetupSteps: ({resolveLanguageKey: t}) => [
        {
            key: "dentalClinic.location",
            title: t("menus.dentalClinic.setup.location"),
            to: "/dentalClinic/locations/create",
            accessModel: "cliniclocations",
            doneWhen: {list: {url: "/api/dentalClinic/clinicLocation"}},
        },
        {
            key: "dentalClinic.service",
            title: t("menus.dentalClinic.setup.service"),
            to: "/dentalClinic/services/create",
            accessModel: "clinicservices",
            doneWhen: {list: {url: "/api/dentalClinic/clinicService"}},
        },
        {
            key: "dentalClinic.practitioner",
            title: t("menus.dentalClinic.setup.practitioner"),
            to: "/dentalClinic/team/create",
            accessModel: "practitioners",
            doneWhen: {list: {url: "/api/dentalClinic/practitioner"}},
        },
    ],
};

export default contribution;
