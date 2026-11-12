import {describe, expect, it} from "vitest";
import {formatCurrency} from "@coreModule/helpers/general/numbers.ts";
import {formatPlanAmount} from "../planAmount.ts";

const currency = (abbreviation: string, decimalPlaces?: number) => ({_id: "c1", name: abbreviation, symbol: abbreviation, abbreviation, decimalPlaces});

describe("formatPlanAmount (plan amounts in the portal and the panel)", () => {
    it("shows the cents a patient is charged instead of rounding to whole units", () => {
        const shown = formatPlanAmount({currency: currency("CHF", 2)}, 1234.5);
        expect(shown).toBe(formatCurrency(1234.5, "CHF", {minimumFractionDigits: 2, maximumFractionDigits: 2}));
        expect(shown).not.toBe(formatCurrency(1234.5, "CHF"));
        expect(shown).toMatch(/234[.,']50/);
    });

    it("keeps whole amounts without trailing zeros", () => {
        expect(formatPlanAmount({currency: currency("CHF", 2)}, 1200)).toBe(formatCurrency(1200, "CHF"));
    });

    it("follows the currency's own precision, and cents when the currency does not say", () => {
        expect(formatPlanAmount({currency: currency("KWD", 3)}, 10.1)).toBe(formatCurrency(10.1, "KWD", {minimumFractionDigits: 3, maximumFractionDigits: 3}));
        expect(formatPlanAmount({currency: currency("JPY", 0)}, 2015)).toBe(formatCurrency(2015, "JPY", {minimumFractionDigits: 0, maximumFractionDigits: 0}));
        expect(formatPlanAmount({currency: currency("EUR")}, 99.9)).toBe(formatCurrency(99.9, "EUR", {minimumFractionDigits: 2, maximumFractionDigits: 2}));
    });

    it("shows the bare number when the plan has no currency", () => {
        expect(formatPlanAmount({}, 12.5)).toBe("12.5");
    });
});
