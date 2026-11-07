import {describe, expect, it} from "vitest";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {addDays, dayNumber, formatDay, priceLabel, weekdayShort} from "../clinicFormat.ts";
import {bookableServices, type ClinicConfig} from "../clinicConfigContext.tsx";

const t: ResolveLanguageKey = (key: string) => `t:${key}`;
const money = (amount: number | undefined) => `CHF ${amount}`;

describe("priceLabel", () => {
    it("shows a fixed price as the amount and a 'from' price with its prefix", () => {
        expect(priceLabel({priceType: "fixed", price: 120}, money, t)).toBe("CHF 120");
        expect(priceLabel({priceType: "from", price: 80}, money, t)).toBe("t:priceFrom CHF 80");
    });

    it("never shows an amount for a free or on-request treatment, even when one is stored", () => {
        expect(priceLabel({priceType: "free", price: 50}, money, t)).toBe("t:priceFree");
        expect(priceLabel({priceType: "on_request", price: 50}, money, t)).toBe("t:priceOnRequest");
    });
});

describe("calendar days", () => {
    it("adds days across month and year ends, and back", () => {
        expect(addDays("2026-10-28", 7)).toBe("2026-11-04");
        expect(addDays("2026-12-29", 7)).toBe("2027-01-05");
        expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
    });

    it("formats a local date as that calendar day, not the UTC instant before it", () => {
        expect(formatDay("2026-11-01", "en-GB")).toBe("Sun 1 Nov");
        expect(weekdayShort("2026-11-01", "en-GB")).toBe("Sun");
        expect(dayNumber("2026-11-09")).toBe("9");
    });
});

describe("bookableServices", () => {
    const service = (id: string) => ({_id: id, name: id, slug: id, category: "checkup" as const, images: [], videos: [], durationMinutes: 30, priceType: "fixed" as const, price: 100});
    const practitioner = (id: string, services: string[]) => ({_id: id, displayName: id, role: "dentist" as const, languages: [], services, locations: ["l1"]});

    it("offers only the treatments someone can be booked for", () => {
        const config = {
            services: [service("cleaning"), service("implant"), service("whitening")],
            practitioners: [practitioner("ana", ["cleaning"]), practitioner("ben", ["cleaning", "implant"])],
        } satisfies Pick<ClinicConfig, "services" | "practitioners">;

        expect(bookableServices({...baseConfig, ...config}).map((s) => s._id)).toEqual(["cleaning", "implant"]);
    });
});

const baseConfig: ClinicConfig = {
    company: {_id: "c1", name: "Smile"},
    currency: {_id: "chf", name: "Swiss franc", symbol: "CHF", abbreviation: "CHF"},
    publicBookingEnabled: true,
    inquiriesEnabled: false,
    profile: {languagesSpoken: [], implantBrands: [], accreditations: [], gallery: []},
    guestBookingAllowed: true,
    requireStaffConfirmation: false,
    patientNoteEnabled: false,
    minNoticeHours: 0,
    maxAdvanceDays: 60,
    cancellationDeadlineHours: 0,
    rescheduleDeadlineHours: 0,
    locations: [],
    services: [],
    practitioners: [],
};
