import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {formatCurrency} from "@coreModule/helpers/general/numbers.ts";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import type {TreatmentPlan} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/treatmentPlan/treatmentPlan.dto.ts";
import {DATE_FORMATS, formatDate} from "@coreModule/helpers/general/dateTime.ts";

const ACCEPTED_AT: Intl.DateTimeFormatOptions = {...DATE_FORMATS.mediumDate, hour: "2-digit", minute: "2-digit"};

type Props = WithLanguageType & {
    plan: Pick<TreatmentPlan, "phases" | "lines" | "totals" | "currency" | "refundableUntilDays" | "acceptance" | "status" | "amountPaid" | "amountDue">;
};

/** The quote as the patient reads it: each phase with its lines, then the totals and deposit, and once accepted what was paid. */
function PlanBreakdown({plan, resolveLanguageKey}: Props) {
    // Up to the currency's own precision (D90), cents when it does not say, and whole amounts without trailing zeros.
    const maximumFractionDigits = plan.currency?.decimalPlaces ?? 2;
    const money = (amount: number) => (plan.currency?.abbreviation
        ? formatCurrency(amount, plan.currency.abbreviation, {minimumFractionDigits: 0, maximumFractionDigits})
        : String(amount));
    return (
        <div className="flex flex-col gap-5 px-4 pb-4">
            {plan.phases.map((phase, index) => (
                <section key={`${phase.title}-${index}`} className="flex flex-col gap-2">
                    <div>
                        <h4 className="text-sm font-medium">{index + 1}. {phase.title}</h4>
                        <p className="text-xs text-muted-foreground">
                            {resolveLanguageKey("phaseSummary").replace("{visits}", String(phase.visits)).replace("{days}", String(phase.estimatedDays))}
                            {index > 0 && phase.minGapDaysAfterPrevious ? ` · ${resolveLanguageKey("phaseGap").replace("{days}", String(phase.minGapDaysAfterPrevious))}` : ""}
                        </p>
                    </div>
                    <ul className="flex flex-col divide-y rounded-md border text-sm">
                        {plan.lines.filter((line) => line.phase === index + 1).map((line, row) => (
                            <li key={`${line.name}-${row}`} className="flex items-start justify-between gap-3 px-3 py-2">
                                <div className="flex min-w-0 flex-col gap-0.5">
                                    <span className="flex items-center gap-2">
                                        {line.name}
                                        {line.kind === "package" ? <Badge variant="outline">{resolveLanguageKey("package")}</Badge> : null}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {[line.teeth.length ? `${resolveLanguageKey("teeth")} ${line.teeth.join(", ")}` : "", line.material, line.brand,
                                            line.warrantyYears ? resolveLanguageKey("warranty").replace("{years}", String(line.warrantyYears)) : ""]
                                            .filter(Boolean).join(" · ")}
                                    </span>
                                </div>
                                <span className="shrink-0 text-right tabular-nums">
                                    {line.quantity} × {money(line.unitPrice)}
                                    {line.discount ? <span className="block text-xs text-muted-foreground">−{money(line.discount)}</span> : null}
                                    <span className="block font-medium">{money(line.total)}</span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>
            ))}
            <dl className="grid grid-cols-2 gap-1 text-sm">
                {plan.totals.discount ? <><dt className="text-muted-foreground">{resolveLanguageKey("discount")}</dt><dd className="text-right tabular-nums">−{money(plan.totals.discount)}</dd></> : null}
                <dt className="font-medium">{resolveLanguageKey("total")}</dt>
                <dd className="text-right font-medium tabular-nums">{money(plan.totals.total)}</dd>
                {plan.totals.deposit ? (
                    <>
                        <dt className="text-muted-foreground">{resolveLanguageKey("deposit")}</dt>
                        <dd className="text-right tabular-nums">{money(plan.totals.deposit)}</dd>
                    </>
                ) : null}
                {plan.status === "accepted" ? (
                    <>
                        <dt className="text-muted-foreground">{resolveLanguageKey("paid")}</dt>
                        <dd className="text-right tabular-nums">{money(plan.amountPaid ?? 0)}</dd>
                        <dt className="font-medium">{resolveLanguageKey("due")}</dt>
                        <dd className="text-right font-medium tabular-nums">{money(plan.amountDue ?? 0)}</dd>
                    </>
                ) : null}
            </dl>
            {plan.acceptance ? (
                <p className="text-xs text-muted-foreground">
                    {/* A staff-recorded yes says how it was given; a portal acceptance is the patient's own signature. */}
                    {resolveLanguageKey(plan.acceptance.channel ? `acceptedVia.${plan.acceptance.channel}` : "acceptedBy")
                        .replace("{name}", plan.acceptance.name)
                        .replace("{date}", formatDate(plan.acceptance.at, {format: ACCEPTED_AT}))}
                </p>
            ) : null}
        </div>
    );
}

export default compose(withLanguage("src/modules/dentalClinic/clients/panel/private/plans/center/sheetView/planBreakdown.tsx"))(PlanBreakdown);
