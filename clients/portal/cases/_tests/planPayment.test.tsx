import {render, screen} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import type {ComponentType} from "react";
import type {PatientPlan} from "armonia/src/modules/dentalClinic/api/dentalClinic/public/patientPortal/patientPortal.response.types.ts";

/** Templated keys keep their placeholders, so the filled-in values can be checked. */
const {templates} = vi.hoisted(() => ({
    templates: {title: "Your plan with {clinic}", payAtClinic: "Pay the deposit of {amount} at the clinic."} as Record<string, string>,
}));
vi.mock("@coreModule/helpers/hocs/withLanguage.tsx", () => ({
    default: () => (Wrapped: ComponentType<Record<string, unknown>>) =>
        (props: Record<string, unknown>) => <Wrapped {...props} resolveLanguageKey={(key: string) => templates[key] ?? key}/>,
}));
// The card form is never started in these tests.
vi.mock("@coreModule/helpers/hooks/useHttpRequest.ts", () => ({default: () => ({loading: false})}));

import PlanPayment from "../planPayment.tsx";

const plan: PatientPlan = {
    _id: "plan1",
    number: "TP-2027-0042",
    inquiry: "inq1",
    clinic: {_id: "clinic1", name: "Blloku Dental"},
    status: "accepted",
    currency: {_id: "eur", name: "Euro", symbol: "€", abbreviation: "EUR"},
    phases: [],
    lines: [],
    totals: {subtotal: 2010, discount: 0, total: 2010, deposit: 201},
    depositType: "percent",
    depositValue: 10,
    paymentStatus: "unpaid",
    amountPaid: 0,
    depositDue: 201,
};

describe("paying a plan's deposit while card payments are coming soon (D190)", () => {
    it("says the deposit is paid at the clinic and offers no card", () => {
        render(<PlanPayment plan={plan} onlinePayment={false} onPaid={vi.fn()}/>);
        expect(screen.getByText(/^Pay the deposit of .*201.* at the clinic\.$/)).toBeTruthy();
        expect(screen.queryByRole("button")).toBeNull();
        expect(screen.queryByText("bankTitle")).toBeNull();
    });

    it("adds the clinic's bank account, the IBAN in groups of four and the plan number as reference", () => {
        const bankTransfer = {holder: "Blloku Dental sh.p.k.", iban: "AL47212110090000000235698741", bic: "UBALALTR", bankName: "Union Bank", reference: "TP-2027-0042"};
        render(<PlanPayment plan={{...plan, bankTransfer}} onlinePayment={false} onPaid={vi.fn()}/>);
        expect(screen.getByText("bankTitle")).toBeTruthy();
        expect(screen.getByText("AL47 2121 1009 0000 0002 3569 8741")).toBeTruthy();
        expect(screen.getByText("Blloku Dental sh.p.k.")).toBeTruthy();
        expect(screen.getByText("UBALALTR")).toBeTruthy();
        expect(screen.getByText("Union Bank")).toBeTruthy();
        expect(screen.getByText("TP-2027-0042")).toBeTruthy();
    });

    it("shows no bank account once the deposit is paid", () => {
        render(<PlanPayment plan={{...plan, depositDue: 0, amountPaid: 201, paymentStatus: "deposit_paid"}} onlinePayment={false} onPaid={vi.fn()}/>);
        expect(screen.queryByText("bankTitle")).toBeNull();
        expect(screen.queryByText(/at the clinic\.$/)).toBeNull();
    });
});
