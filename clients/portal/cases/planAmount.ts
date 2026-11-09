import {formatCurrency} from "@coreModule/helpers/general/numbers.ts";
import type {PatientPlan} from "armonia/src/modules/dentalClinic/api/dentalClinic/public/patientPortal/patientPortal.response.types.ts";

/**
 * A plan amount as the patient must see it: whole amounts without decimals, any other amount with all the currency's
 * decimals (D90; cents when the currency does not say), so 1234.5 reads 1,234.50. The core default rounds to whole
 * units, which hides what is actually charged.
 */
export function formatPlanAmount(plan: Pick<PatientPlan, "currency">, amount: number): string {
    if (!plan.currency?.abbreviation) return String(amount);
    const digits = Number.isInteger(amount) ? 0 : plan.currency.decimalPlaces ?? 2;
    return formatCurrency(amount, plan.currency.abbreviation, {minimumFractionDigits: digits, maximumFractionDigits: digits});
}
