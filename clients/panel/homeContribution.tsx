import type {HomeContribution} from "@coreModule/helpers/types/homeContribution.types.ts";

/**
 * What a new dental clinic company sets up before it can take customers (D178), in the order it needs them; each
 * step is done once its list has a row. Each step's guide points at the fields that matter most (D179), and the tour
 * walks every page of the module (D180). Texts are in this module's `menus.json` (`setup`, `guide`).
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
    // Every page of the module in sidebar order, then its settings, each explained by its own ⓘ help (D180); a page the
    // person may not read is left out. The settings pages share one help, so the tour opens the first of them.
    getTour: ({resolveLanguageKey: t}) => [
        {
            target: "page.help",
            to: "/dentalClinic/day",
            accessModel: "appointments",
            title: t("menus.dentalClinic.guide.tour.introTitle"),
            text: t("menus.dentalClinic.guide.tour.introText"),
        },
        ...([
            ["/dentalClinic/day", "appointments"],
            ["/dentalClinic/appointments", "appointments"],
            ["/dentalClinic/inquiries", "clinicinquiries"],
            ["/dentalClinic/plans", "treatmentplans"],
            ["/dentalClinic/patients", "patients"],
            ["/dentalClinic/trips", "patienttrips"],
            ["/dentalClinic/reviews", "clinicreviews"],
            ["/dentalClinic/team", "practitioners"],
            ["/dentalClinic/timeOff", "scheduleexceptions"],
            ["/dentalClinic/services", "clinicservices"],
            ["/dentalClinic/locations", "cliniclocations"],
            ["/tenancy/systemSettings/clinicConfig/booking", "clinicconfigs"],
        ] as const).map(([page, accessModel]) => ({page, accessModel})),
    ],
};

export default contribution;
