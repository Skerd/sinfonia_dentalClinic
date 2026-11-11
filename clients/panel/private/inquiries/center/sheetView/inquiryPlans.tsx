import {compose} from "redux";
import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {IconFileInvoice, IconPlus} from "@tabler/icons-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {formatCurrency} from "@coreModule/helpers/general/numbers.ts";
import DisplayCard from "@coreModule/components/viewEngine/widgets/display/displayCard.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import type {TreatmentPlan} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/treatmentPlan/treatmentPlan.dto.ts";
import {treatmentPlanCreatePath} from "@dentalClinicModule/clients/panel/private/plans/planPaths.ts";
import StatusBadge from "@coreModule/components/entityPage/sheet/statusBadge.tsx";
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
        filter: {id: "inquiry-plans", operator: "and", rules: [{id: "inquiry", field: "inquiry", operator: "equals", value: inquiryId}]},
    }, plansCount);
    const plans = plansRequest.error ? [] : plansRequest.data?.data ?? null;

    if (!access.read?.lines) return null;

    const createButton = canQuote && access.create ? (
        <Button asChild size="sm" variant="outline">
            <Link to={treatmentPlanCreatePath({inquiry: inquiryId})}><IconPlus size={16} />{resolveLanguageKey("create")}</Link>
        </Button>
    ) : null;
    const none = String(resolveLanguageKey("none"));

    // Each quote as the sheet's own card: option, total and status, with its PDF one click away.
    return (
        <section className="flex flex-col gap-2">
            {plans?.length === 0 ? (
                // The stacked layout (the only one with header actions) needs an element value; nothing shows under the title.
                <DisplayCard show stackBody title={none} tooltip={none} Icon={IconFileInvoice} value={<span />} dontRenderValue headerActions={createButton} />
            ) : null}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {(plans ?? []).map((plan) => {
                    const title = plan.optionLabel || plan.number;
                    const total = plan.currency?.abbreviation ? formatCurrency(plan.totals.total, plan.currency.abbreviation) : String(plan.totals.total);
                    return (
                        <DisplayCard
                            key={plan._id}
                            show
                            stackBody
                            title={title}
                            tooltip={plan.number}
                            Icon={IconFileInvoice}
                            headerActions={<Button type="button" size="sm" variant="ghost" onClick={() => downloadPlanPdf(plan)}>PDF</Button>}
                            value={(
                                <span className="flex flex-wrap items-center gap-2">
                                    <span className="font-medium tabular-nums">{total}</span>
                                    <StatusBadge tableConfigKey="treatmentplans" field="status" value={plan.status} label={String(resolveLanguageKey(`status.${plan.status}`))} />
                                </span>
                            )}
                        />
                    );
                })}
            </div>
            {plans?.length && createButton ? <div className="flex justify-end">{createButton}</div> : null}
        </section>
    );
}

export default compose(withLanguage("src/modules/dentalClinic/clients/panel/private/inquiries/center/sheetView/inquiryPlans.tsx"))(InquiryPlans);
