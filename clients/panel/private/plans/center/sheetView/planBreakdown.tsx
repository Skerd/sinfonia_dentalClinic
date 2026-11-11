import type {ReactNode} from "react";
import {compose} from "redux";
import {IconCash, IconDiscount, IconReceipt, IconSignature} from "@tabler/icons-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {formatCurrency} from "@coreModule/helpers/general/numbers.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import type {TreatmentPlan} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/treatmentPlan/treatmentPlan.dto.ts";
import {DATE_FORMATS, formatDate} from "@coreModule/helpers/general/dateTime.ts";

const ACCEPTED_AT: Intl.DateTimeFormatOptions = {...DATE_FORMATS.mediumDate, hour: "2-digit", minute: "2-digit"};

type Props = WithLanguageType & {
    plan: Pick<TreatmentPlan, "phases" | "lines" | "totals" | "currency" | "refundableUntilDays" | "acceptance" | "status" | "amountPaid" | "amountDue">;
};

/** One money fact, laid out like the sheet's own cards (icon, muted label, value). */
function Amount({Icon, label, value, strong}: {Icon: typeof IconCash; label: ReactNode; value: ReactNode; strong?: boolean}) {
    return (
        <div className={cn("flex items-start gap-2 rounded-md p-2", strong ? "bg-primary/10" : "bg-muted/30")}>
            <span className="rounded-md bg-background p-2.5"><Icon className="size-5" aria-hidden /></span>
            <div className="flex min-w-0 flex-col gap-0.5">
                <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
                <dd className={cn("tabular-nums", strong ? "text-base font-semibold" : "text-sm font-medium")}>{value}</dd>
            </div>
        </div>
    );
}

/** The quote as the patient reads it: each phase with its lines, then the discount and total, and once accepted what is still due. */
function PlanBreakdown({plan, resolveLanguageKey}: Props) {
    // Up to the currency's own precision (D90), cents when it does not say, and whole amounts without trailing zeros.
    const maximumFractionDigits = plan.currency?.decimalPlaces ?? 2;
    const money = (amount: number) => (plan.currency?.abbreviation
        ? formatCurrency(amount, plan.currency.abbreviation, {minimumFractionDigits: 0, maximumFractionDigits})
        : String(amount));
    const accepted = plan.status === "accepted";
    return (
        <div className="flex flex-col gap-3">
            {plan.phases.map((phase, index) => (
                <section key={`${phase.title}-${index}`} className="flex flex-col gap-2 rounded-md bg-muted/30 p-2">
                    <div className="flex items-center gap-2">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-background text-sm font-semibold" aria-hidden>{index + 1}</span>
                        <div className="flex min-w-0 flex-col gap-0.5">
                            <h4 className="truncate text-sm font-medium" aria-label={`${index + 1}. ${phase.title}`}>{phase.title}</h4>
                            <p className="text-xs text-muted-foreground">
                                {resolveLanguageKey("phaseSummary").replace("{visits}", String(phase.visits)).replace("{days}", String(phase.estimatedDays))}
                                {index > 0 && phase.minGapDaysAfterPrevious ? ` · ${resolveLanguageKey("phaseGap").replace("{days}", String(phase.minGapDaysAfterPrevious))}` : ""}
                            </p>
                        </div>
                    </div>
                    <ul className="flex flex-col divide-y divide-border/50 rounded-md bg-background/60 text-sm">
                        {plan.lines.filter((line) => line.phase === index + 1).map((line, row) => (
                            <li key={`${line.name}-${row}`} className="flex items-start justify-between gap-3 px-3 py-2">
                                <div className="flex min-w-0 flex-col gap-0.5">
                                    <span className="flex items-center gap-2 font-medium">
                                        {line.name}
                                        {line.kind === "package" ? <Badge variant="outline">{resolveLanguageKey("package")}</Badge> : null}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {[line.teeth.length ? `${resolveLanguageKey("teeth")} ${line.teeth.join(", ")}` : "", line.material, line.brand,
                                            line.warrantyYears ? resolveLanguageKey("warranty").replace("{years}", String(line.warrantyYears)) : ""]
                                            .filter(Boolean).join(" · ")}
                                    </span>
                                </div>
                                <span className="flex shrink-0 flex-col items-end tabular-nums">
                                    <span className="text-xs text-muted-foreground">{line.quantity} × {money(line.unitPrice)}</span>
                                    {line.discount ? <span className="text-xs text-muted-foreground">−{money(line.discount)}</span> : null}
                                    <span className="font-medium">{money(line.total)}</span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>
            ))}
            <dl className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {plan.totals.discount ? <Amount Icon={IconDiscount} label={resolveLanguageKey("discount")} value={`−${money(plan.totals.discount)}`} /> : null}
                <Amount Icon={IconReceipt} label={resolveLanguageKey("total")} value={money(plan.totals.total)} strong />
                {/* The deposit and what was paid are in the sheet's overview, linked to their currency; here only what adds up. */}
                {accepted ? <Amount Icon={IconCash} label={resolveLanguageKey("due")} value={money(plan.amountDue ?? 0)} strong /> : null}
            </dl>
            {plan.acceptance ? (
                <p className="flex items-center gap-2 rounded-md bg-muted/30 p-2 text-sm text-muted-foreground">
                    <span className="rounded-md bg-background p-2.5"><IconSignature className="size-5" aria-hidden /></span>
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
