import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {IconCash, IconCopy, IconFileTypePdf, IconReceiptRefund, IconSend} from "@tabler/icons-react";
import type {TreatmentPlan} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/treatmentPlan/treatmentPlan.dto.ts";
import {downloadPlanPdf} from "./downloadPlanPdf.ts";

/** What can be done with a quote in its current state, for the row and sheet menus. */
export type PlanAction = "send" | "revise" | "recordPayment" | "refund";

type Props = WithLanguageType & {
    plan: TreatmentPlan;
    onAction: (action: PlanAction) => void;
};

function PlanMenu({plan, onAction, resolveLanguageKey}: Props) {
    const {write, read} = useAccess("treatmentplans");
    if (plan.deletedAt) return null;
    const item = (key: string, Icon: typeof IconSend, run: () => void) => (
        <DropdownMenuItem key={key} onClick={(e) => { e.preventDefault(); e.stopPropagation(); run(); }}>
            <Icon size={16} />
            <p>{resolveLanguageKey(key)}</p>
        </DropdownMenuItem>
    );

    return (
        <>
            {write?.status && plan.status === "draft" && item("send", IconSend, () => onAction("send"))}
            {write?.status && plan.status === "sent" && item("revise", IconCopy, () => onAction("revise"))}
            {write?.amountPaid && plan.status === "accepted" && plan.amountDue > 0 && item("recordPayment", IconCash, () => onAction("recordPayment"))}
            {write?.amountPaid && plan.amountPaid > 0 && item("refund", IconReceiptRefund, () => onAction("refund"))}
            {read?.lines && item("pdf", IconFileTypePdf, () => downloadPlanPdf(plan))}
        </>
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/plans/center/actions/planMenu.tsx"),
    withDebug(true, true, "treatmentplans"),
)(PlanMenu);
