import {compose} from "redux";
import {useCallback, useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {formatCurrency} from "@coreModule/helpers/general/numbers.ts";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import type {PatientPlan, PatientPlansResponse} from "armonia/src/modules/dentalClinic/api/dentalClinic/public/patientPortal/patientPortal.response.types.ts";
import AcceptOfferDialog from "./acceptOfferDialog.tsx";
import PlanPayment from "./planPayment.tsx";
import CaseTrips from "./caseTrips.tsx";
import {downloadOfferPdf} from "./patientFiles.ts";

type Props = WithLanguageType & {
    requestGroup: string;
    /** A quote was accepted: the case should reload. */
    onAccepted: () => void;
};

const money = (plan: PatientPlan, amount: number) => (plan.currency?.abbreviation ? formatCurrency(amount, plan.currency.abbreviation) : String(amount));

/** Every clinic's quote side by side: price, deposit, trips, days, warranty and brands. */
function CaseOffers({requestGroup, onAccepted, resolveLanguageKey}: Props) {
    const [plans, setPlans] = useState<PatientPlan[] | null>(null);
    const [onlinePayment, setOnlinePayment] = useState(false);
    const [open, setOpen] = useState<string | null>(null);
    const [accepting, setAccepting] = useState<PatientPlan | null>(null);

    const load = useCallback(() => {
        apiClient.post<PatientPlansResponse>("/api/dentalClinic/patientPortal/plans", {requestGroup})
            .then((res) => { setPlans(res.data.data); setOnlinePayment(res.data.onlinePayment); })
            .catch(() => setPlans([]));
    }, [requestGroup]);

    useEffect(() => { load(); }, [load]);

    const shown = (plans ?? []).filter((plan) => plan.status === "sent" || plan.status === "accepted");
    if (!shown.length) return null;
    const accepted = shown.find((plan) => plan.status === "accepted");
    const anyAccepted = !!accepted;

    return (
        <section className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold">{resolveLanguageKey("title")}</h3>
            <div className="overflow-x-auto rounded-lg border">
                <table className="w-full min-w-[640px] text-sm">
                    <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                        <tr>
                            <th className="px-3 py-2">{resolveLanguageKey("clinic")}</th>
                            <th className="px-3 py-2 text-right">{resolveLanguageKey("total")}</th>
                            <th className="px-3 py-2 text-right">{resolveLanguageKey("deposit")}</th>
                            <th className="px-3 py-2 text-right">{resolveLanguageKey("trips")}</th>
                            <th className="px-3 py-2 text-right">{resolveLanguageKey("days")}</th>
                            <th className="px-3 py-2 text-right">{resolveLanguageKey("warranty")}</th>
                            <th className="px-3 py-2">{resolveLanguageKey("brands")}</th>
                            <th className="px-3 py-2" />
                        </tr>
                    </thead>
                    <tbody>
                        {shown.map((plan) => {
                            const warranty = Math.max(0, ...plan.lines.map((line) => line.warrantyYears ?? 0));
                            const brands = [...new Set(plan.lines.map((line) => line.brand).filter(Boolean))];
                            return (
                                <tr key={plan._id} className="border-t align-top">
                                    <td className="px-3 py-2">
                                        <span className="font-medium">{plan.clinic.name}</span>
                                        {plan.optionLabel ? <span className="block text-xs text-muted-foreground">{plan.optionLabel}</span> : null}
                                        {plan.status === "accepted" ? <Badge className="mt-1">{resolveLanguageKey("accepted")}</Badge> : null}
                                    </td>
                                    <td className="px-3 py-2 text-right font-medium tabular-nums">{money(plan, plan.totals.total)}</td>
                                    <td className="px-3 py-2 text-right tabular-nums">{plan.totals.deposit ? money(plan, plan.totals.deposit) : "—"}</td>
                                    <td className="px-3 py-2 text-right tabular-nums">{plan.phases.length}</td>
                                    <td className="px-3 py-2 text-right tabular-nums">{plan.phases.reduce((sum, phase) => sum + phase.estimatedDays, 0)}</td>
                                    <td className="px-3 py-2 text-right tabular-nums">{warranty ? resolveLanguageKey("years").replace("{years}", String(warranty)) : "—"}</td>
                                    <td className="px-3 py-2 text-xs">{brands.join(", ") || "—"}</td>
                                    <td className="px-3 py-2">
                                        <div className="flex flex-col items-end gap-1">
                                            <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(open === plan._id ? null : plan._id)}>
                                                {resolveLanguageKey(open === plan._id ? "hide" : "details")}
                                            </Button>
                                            {plan.status === "sent" && !anyAccepted ? (
                                                <Button type="button" size="sm" onClick={() => setAccepting(plan)}>{resolveLanguageKey("accept")}</Button>
                                            ) : null}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {accepted ? <PlanPayment plan={accepted} onlinePayment={onlinePayment} onPaid={load} /> : null}
            {accepted ? <CaseTrips requestGroup={requestGroup} /> : null}

            {shown.filter((plan) => plan._id === open).map((plan) => (
                <div key={plan._id} className="flex flex-col gap-3 rounded-lg border p-4">
                    {plan.phases.map((phase, index) => (
                        <div key={`${phase.title}-${index}`} className="flex flex-col gap-1">
                            <p className="text-sm font-medium">{index + 1}. {phase.title}</p>
                            <p className="text-xs text-muted-foreground">
                                {resolveLanguageKey("phaseSummary").replace("{visits}", String(phase.visits)).replace("{days}", String(phase.estimatedDays))}
                                {index > 0 && phase.minGapDaysAfterPrevious ? ` · ${resolveLanguageKey("phaseGap").replace("{days}", String(phase.minGapDaysAfterPrevious))}` : ""}
                            </p>
                            <ul className="text-sm">
                                {plan.lines.filter((line) => line.phase === index + 1).map((line, row) => (
                                    <li key={`${line.name}-${row}`} className="flex justify-between gap-3 border-t py-1.5">
                                        <span>
                                            {line.name}
                                            <span className="block text-xs text-muted-foreground">
                                                {[line.teeth.length ? `${resolveLanguageKey("teeth")} ${line.teeth.join(", ")}` : "", line.material, line.brand].filter(Boolean).join(" · ")}
                                            </span>
                                        </span>
                                        <span className="shrink-0 tabular-nums">{money(plan, line.total)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                    {plan.validUntil ? <p className="text-xs text-muted-foreground">{resolveLanguageKey("validUntil")} {plan.validUntil}</p> : null}
                    {plan.notes ? <p className="whitespace-pre-line text-sm">{plan.notes}</p> : null}
                    {plan.terms ? <p className="whitespace-pre-line text-xs text-muted-foreground">{plan.terms}</p> : null}
                    <Button type="button" variant="outline" size="sm" className="self-start" onClick={() => downloadOfferPdf(plan)}>{resolveLanguageKey("pdf")}</Button>
                </div>
            ))}

            {accepting ? (
                <AcceptOfferDialog
                    plan={accepting}
                    onClose={() => setAccepting(null)}
                    onAccepted={() => { setAccepting(null); load(); onAccepted(); }}
                />
            ) : null}
        </section>
    );
}

export default compose(withLanguage("src/modules/dentalClinic/clients/portal/cases/caseOffers.tsx"))(CaseOffers);
