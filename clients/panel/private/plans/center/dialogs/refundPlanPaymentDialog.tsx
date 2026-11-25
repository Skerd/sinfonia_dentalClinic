import {useImperativeHandle, useState} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import ConfirmDialog from "@coreModule/components/custom/confirmDialog.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import type {TreatmentPlan} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/treatmentPlan/treatmentPlan.dto.ts";
import type {RefundPlanPaymentFormType} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/treatmentPlan/treatmentPlan.schema-def.ts";
import {CARD_PAYMENTS_AVAILABLE} from "armonia/src/modules/finance/helpers/cardPaymentAvailability.ts";

type Props = WithLanguageType & WithAxiosType<TreatmentPlan, RefundPlanPaymentFormType> & {
    plan: TreatmentPlan;
    onClose: () => void;
    onUpdated: (updated: TreatmentPlan) => void;
};

/** Gives money back: card payments through the gateway, money taken at the clinic by hand (the only kind while cards are coming soon, D190). */
function RefundPlanPaymentDialog({plan, onClose, onUpdated, resolveLanguageKey, onFilterChange, innerRef, loading}: Props) {
    const paid = plan.amountPaid ?? 0;
    const [amount, setAmount] = useState(String(paid));
    const [reason, setReason] = useState("");
    useImperativeHandle(innerRef, () => ({success: (data) => { onUpdated(data); onClose(); }}));
    const value = Number(amount);

    return (
        <ConfirmDialog
            open
            onOpenChange={(next: boolean) => !loading && !next && onClose()}
            title={resolveLanguageKey("title")}
            desc={resolveLanguageKey(CARD_PAYMENTS_AVAILABLE ? "description" : "descriptionAtClinic")}
            confirmText={resolveLanguageKey("confirm")}
            cancelBtnText={resolveLanguageKey("cancel")}
            destructive
            isLoading={loading}
            disabled={!(value > 0 && value <= paid + 0.005 && reason.trim())}
            handleConfirm={() => onFilterChange({_id: plan._id, amount: value, reason: reason.trim()})}
        >
            <div className="flex flex-col gap-2">
                <Label htmlFor="plan-refund-amount">{resolveLanguageKey("amountLabel")}</Label>
                <Input id="plan-refund-amount" type="number" min={0} step="any" value={amount} onChange={(e) => setAmount(e.target.value)} disabled={loading} />
            </div>
            <div className="flex flex-col gap-2">
                <Label htmlFor="plan-refund-reason">{resolveLanguageKey("reasonLabel")}</Label>
                <Input id="plan-refund-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder={resolveLanguageKey("reasonPlaceholder")} disabled={loading} />
            </div>
        </ConfirmDialog>
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/plans/center/dialogs/refundPlanPaymentDialog.tsx"),
    withAxios<TreatmentPlan, RefundPlanPaymentFormType>({url: "/api/dentalClinic/treatmentPlan/refund", method: "POST", data: {}}, true),
    withDebug(true, true, "treatmentplans"),
)(RefundPlanPaymentDialog);
