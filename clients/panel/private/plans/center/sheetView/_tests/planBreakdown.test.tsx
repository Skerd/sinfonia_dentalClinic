import {render, screen, within} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import type {ComponentProps, ComponentType} from "react";
import type {TreatmentPlanLine} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/treatmentPlan/treatmentPlan.dto.ts";
import {formatCurrency} from "@coreModule/helpers/general/numbers.ts";

/** Templated keys keep their placeholders, so the filled-in values can be checked. */
const {templates} = vi.hoisted(() => ({
    templates: {
        phaseSummary: "{visits} visits, {days} days",
        phaseGap: "wait {days} days",
        warranty: "{years}y warranty",
        acceptedBy: "Accepted by {name}",
    } as Record<string, string>,
}));

vi.mock("@coreModule/helpers/hocs/withLanguage.tsx", () => ({
    default: () => (Wrapped: ComponentType<Record<string, unknown>>) =>
        (props: Record<string, unknown>) => <Wrapped {...props} resolveLanguageKey={(key: string) => templates[key] ?? key}/>,
}));

import PlanBreakdown from "../planBreakdown.tsx";

type Plan = ComponentProps<typeof PlanBreakdown>["plan"];

/** Up to cents, as the clinic site shows prices. */
const chf = (amount: number) => formatCurrency(amount, "CHF", {minimumFractionDigits: 0, maximumFractionDigits: 2});
/** `toHaveTextContent` folds the no-break space Intl puts after the currency into a plain one. */
const chfText = (amount: number) => chf(amount).replace(/\s/g, " ");

const line = (overrides: Partial<TreatmentPlanLine>): TreatmentPlanLine => ({
    phase: 1, kind: "treatment", name: "line", teeth: [], quantity: 1, unitPrice: 0, total: 0, ...overrides,
});

const plan: Plan = {
    status: "sent",
    currency: {_id: "chf", name: "Swiss franc", symbol: "CHF", abbreviation: "CHF"},
    phases: [
        {title: "Extraction", visits: 1, estimatedDays: 1, minGapDaysAfterPrevious: 5},
        {title: "Implants", visits: 2, estimatedDays: 3, minGapDaysAfterPrevious: 90},
    ],
    lines: [
        line({phase: 2, kind: "package", name: "Implant package", teeth: ["36", "46"], material: "Titanium", brand: "Straumann", quantity: 2, unitPrice: 1500, discount: 200, warrantyYears: 10, total: 2800}),
        line({phase: 1, name: "Extraction", teeth: ["36"], quantity: 1, unitPrice: 150, total: 150}),
    ],
    totals: {subtotal: 3150, discount: 200, total: 2950, deposit: 500},
    amountPaid: 0,
    amountDue: 2950,
};

const phaseOf = (title: string) => {
    // The phase's number sits in its badge; the heading reads "1. Extraction" to assistive tech.
    const section = screen.getByRole("heading", {name: new RegExp(`\\d\\. ${title}$`)}).closest("section");
    if (!section) throw new Error(`expected the ${title} phase`);
    return section;
};

const totalsOf = () => {
    const dl = screen.getByText("total").closest("dl");
    if (!dl) throw new Error("expected the totals");
    // Each amount is a card holding its label and value, in reading order.
    return Array.from(dl.querySelectorAll("dt, dd")).map((cell) => cell.textContent);
};

describe("treatment plan breakdown", () => {
    it("lists each line under its own phase, whatever order the lines come in", () => {
        render(<PlanBreakdown plan={plan}/>);

        expect(within(phaseOf("Extraction")).getAllByRole("listitem")).toHaveLength(1);
        expect(within(phaseOf("Implants")).getByText("Implant package")).toBeInTheDocument();
        expect(within(phaseOf("Extraction")).queryByText("Implant package")).not.toBeInTheDocument();
    });

    it("shows the waiting time before a phase only from the second phase on", () => {
        render(<PlanBreakdown plan={plan}/>);

        expect(within(phaseOf("Extraction")).getByText("1 visits, 1 days")).toBeInTheDocument();
        expect(within(phaseOf("Implants")).getByText("2 visits, 3 days · wait 90 days")).toBeInTheDocument();
    });

    it("describes a line by teeth, material, brand and warranty, with quantity, discount and total", () => {
        render(<PlanBreakdown plan={plan}/>);

        const item = within(phaseOf("Implants")).getByRole("listitem");
        expect(within(item).getByText("package")).toBeInTheDocument();
        expect(within(item).getByText("teeth 36, 46 · Titanium · Straumann · 10y warranty")).toBeInTheDocument();
        expect(item).toHaveTextContent(`2 × ${chfText(1500)}`);
        expect(item).toHaveTextContent(`−${chfText(200)}`);
        expect(item).toHaveTextContent(chfText(2800));
    });

    it("shows the discount only when there is one, and what is still due only once accepted (deposit and paid are in the overview)", () => {
        const {unmount} = render(<PlanBreakdown plan={plan}/>);
        expect(totalsOf()).toEqual(["discount", `−${chf(200)}`, "total", chf(2950)]);
        unmount();

        render(<PlanBreakdown plan={{...plan, status: "accepted", totals: {...plan.totals, discount: 0, deposit: 0}, amountPaid: 500, amountDue: 2450}}/>);
        expect(totalsOf()).toEqual(["total", chf(2950), "due", chf(2450)]);
    });

    it("keeps the cents of a quote instead of rounding to whole francs", () => {
        render(<PlanBreakdown plan={{...plan,
            lines: [line({phase: 1, name: "Filling", quantity: 3, unitPrice: 33.33, total: 99.99})],
            totals: {subtotal: 99.99, discount: 0, total: 99.99, deposit: 0}}}/>);

        const item = within(phaseOf("Extraction")).getByRole("listitem");
        expect(item).toHaveTextContent(`3 × ${chfText(33.33)}`);
        expect(totalsOf()).toEqual(["total", chf(99.99)]);
        // Whole-unit rounding showed CHF 100 for a 99.99 quote.
        expect(chf(99.99)).not.toBe(formatCurrency(99.99, "CHF"));
    });

    it("shows a currency's third decimal, and no cents for a currency without them (D90)", () => {
        const {unmount} = render(<PlanBreakdown plan={{...plan, currency: {_id: "kwd", name: "Kuwaiti dinar", symbol: "KD", abbreviation: "KWD", decimalPlaces: 3},
            lines: [line({phase: 1, name: "Crown", quantity: 1, unitPrice: 10.125, total: 10.125})],
            totals: {subtotal: 10.125, discount: 0, total: 10.125, deposit: 0}}}/>);
        expect(totalsOf()).toEqual(["total", formatCurrency(10.125, "KWD", {minimumFractionDigits: 0, maximumFractionDigits: 3})]);
        expect(totalsOf()[1]).toContain("10.125");
        unmount();

        render(<PlanBreakdown plan={{...plan, currency: {_id: "jpy", name: "Yen", symbol: "¥", abbreviation: "JPY", decimalPlaces: 0},
            lines: [line({phase: 1, name: "Crown", quantity: 1, unitPrice: 2015, total: 2015})],
            totals: {subtotal: 2015.4, discount: 0, total: 2015.4, deposit: 202}}}/>);
        expect(totalsOf()).toEqual(["total", formatCurrency(2015.4, "JPY", {minimumFractionDigits: 0, maximumFractionDigits: 0})]);
        expect(totalsOf()[1]).not.toContain(".");
    });

    it("shows bare amounts when the plan has no currency", () => {
        render(<PlanBreakdown plan={{...plan, currency: undefined}}/>);

        expect(totalsOf()).toContain("2950");
    });

    it("names no one while the quote is not accepted", () => {
        render(<PlanBreakdown plan={plan}/>);
        expect(screen.queryByText(/Accepted by/)).not.toBeInTheDocument();
    });

    it("names who accepted the quote", () => {
        render(<PlanBreakdown plan={{...plan, status: "accepted", acceptance: {name: "Ada Lovelace", at: "2026-11-01T09:00:00.000Z"}}}/>);

        expect(screen.getByText("Accepted by Ada Lovelace")).toBeInTheDocument();
    });
});
