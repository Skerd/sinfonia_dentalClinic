import {compose} from "redux";
import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {IconPlus} from "@tabler/icons-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {formatCurrency} from "@coreModule/helpers/general/numbers.ts";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import type {TreatmentPlan} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/treatmentPlan/treatmentPlan.dto.ts";
import {treatmentPlanCreatePath} from "@dentalClinicModule/clients/panel/private/plans/planPaths.ts";
import {downloadPlanPdf} from "@dentalClinicModule/clients/panel/private/plans/center/actions/downloadPlanPdf.ts";

const PLANS_REQUEST: HttpRequest = {method: "POST", url: "/api/dentalClinic/treatmentPlan"};

type Props = WithLanguageType & {
    inquiryId: string;
    /** New quotes only while the request is open. */
    canQuote: boolean;
};

/** The quotes made for this request, and a way to make one. */
function InquiryPlans({inquiryId, canQuote, resolveLanguageKey}: Props) {
    const access = useAccess("treatmentplans");
    const [plansCount, setPlansCount] = useState(0);
    useEffect(() => {
        if (access.read?.lines) setPlansCount((count) => count + 1);
    }, [access.read?.lines, inquiryId]);
    const plansRequest = useHttpRequest<{data: TreatmentPlan[]}>(PLANS_REQUEST, {
        limit: 50,
        offset: 0,
        filters: {id: "inquiry-plans", operator: "and", rules: [{id: "inquiry", field: "inquiry", operator: "equals", value: inquiryId}]},
    }, plansCount);
    const plans = plansRequest.error ? [] : plansRequest.data?.data ?? null;

    if (!access.read?.lines) return null;

    return (
        <section className="flex flex-col gap-3 border-t px-4 py-4">
            <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-medium">{resolveLanguageKey("title")}</h4>
                {canQuote && access.create ? (
                    <Button asChild size="sm" variant="outline">
                        <Link to={treatmentPlanCreatePath({inquiry: inquiryId})}><IconPlus size={16} />{resolveLanguageKey("create")}</Link>
                    </Button>
                ) : null}
            </div>
            {plans?.length === 0 ? <p className="text-sm text-muted-foreground">{resolveLanguageKey("none")}</p> : null}
            <ul className="flex flex-col gap-2">
                {(plans ?? []).map((plan) => (
                    <li key={plan._id} className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm">
                        <div className="flex min-w-0 flex-col">
                            <span className="truncate font-medium">{plan.optionLabel || plan.number}</span>
                            <span className="text-xs text-muted-foreground">
                                {plan.number} · {plan.currency?.abbreviation ? formatCurrency(plan.totals.total, plan.currency.abbreviation) : plan.totals.total}
                            </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            <Badge variant="secondary">{resolveLanguageKey(`status.${plan.status}`)}</Badge>
                            <Button type="button" size="sm" variant="ghost" onClick={() => downloadPlanPdf(plan)}>PDF</Button>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}

export default compose(withLanguage("src/modules/dentalClinic/clients/panel/private/inquiries/center/sheetView/inquiryPlans.tsx"))(InquiryPlans);
