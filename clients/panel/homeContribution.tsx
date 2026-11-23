import type {HomeContribution} from "@coreModule/helpers/types/homeContribution.types.ts";

/**
 * What a new dental clinic company sets up before it can take customers (D178), in the order it needs them; each
 * step is done once its list has a row. Each step's guide points at the fields that matter most (D179), and the tour
 * shows the pages a clinic uses every day. Texts are in this module's `menus.json` (`setup`, `guide`).
 */
const contribution: HomeContribution = {
    id: "dentalClinic",
    order: 30,
    getSetupSteps: ({resolveLanguageKey: t}) => {
        const tip = (target: string, name: string) => ({
            target,
            title: t(`menus.dentalClinic.guide.${name}Title`),
            text: t(`menus.dentalClinic.guide.${name}Text`),
        });
        const save = {target: "form.save", title: t("home.guide.saveTitle"), text: t("home.guide.saveText")};
        return [
            {
                key: "dentalClinic.location",
                title: t("menus.dentalClinic.setup.location"),
                to: "/dentalClinic/locations/create",
                accessModel: "cliniclocations",
                doneWhen: {list: {url: "/api/dentalClinic/clinicLocation"}},
                guide: [tip("field.name", "locationName"), tip("field.address.country", "locationAddress"), tip("field.openingHours", "locationHours"), save],
            },
            {
                key: "dentalClinic.service",
                title: t("menus.dentalClinic.setup.service"),
                to: "/dentalClinic/services/create",
                accessModel: "clinicservices",
                doneWhen: {list: {url: "/api/dentalClinic/clinicService"}},
                guide: [
                    tip("field.name", "serviceName"),
                    tip("field.category", "serviceCategory"),
                    tip("field.durationMinutes", "serviceDuration"),
                    tip("field.priceType", "servicePrice"),
                    tip("field.isPublic", "servicePublic"),
                    save,
                ],
            },
            {
                key: "dentalClinic.practitioner",
                title: t("menus.dentalClinic.setup.practitioner"),
                to: "/dentalClinic/team/create",
                accessModel: "practitioners",
                doneWhen: {list: {url: "/api/dentalClinic/practitioner"}},
                guide: [
                    tip("field.displayName", "practitionerName"),
                    tip("field.services", "practitionerServices"),
                    tip("field.schedule", "practitionerHours"),
                    tip("field.isBookable", "practitionerBookable"),
                    save,
                ],
            },
        ];
    },
    // Sidebar links, shown from wherever the person is; the tour then ends at the last one's page help.
    getTour: ({resolveLanguageKey: t}) => (["day", "appointments", "inquiries", "patients"] as const).map((page) => ({
        target: `nav:/dentalClinic/${page}`,
        // Named as the sidebar names them.
        title: t(`menus.dentalClinic.${page}.title`),
        text: t(`menus.dentalClinic.guide.tour.${page}`),
    })),
};

export default contribution;
