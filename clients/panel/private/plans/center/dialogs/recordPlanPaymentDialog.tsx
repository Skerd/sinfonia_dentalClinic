import {useImperativeHandle, useState} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import ConfirmDialog from "@coreModule/components/custom/confirmDialog.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import type {TreatmentPlan} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/treatmentPlan/treatmentPlan.dto.ts";
import type {RecordPlanPaymentFormType} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/treatmentPlan/treatmentPlan.schema-def.ts";

type Props = WithLanguageType & WithAxiosType<TreatmentPlan, RecordPlanPaymentFormType> & {
    plan: TreatmentPlan;
    onClose: () => void;
    onUpdated: (updated: TreatmentPlan) => void;
};

/** Money the clinic took itself (cash, card terminal, transfer). Defaults to what is still due. */
function RecordPlanPaymentDialog({plan, onClose, onUpdated, resolveLanguageKey, onFilterChange, innerRef, loading}: Props) {
    const due = plan.amountDue ?? 0;
    const [amount, setAmount] = useState(String(due));
    const [note, setNote] = useState("");
    useImperativeHandle(innerRef, () => ({success: (data) => { onUpdated(data); onClose(); }}));
    const value = Number(amount);

    return (
        <ConfirmDialog
            open
            onOpenChange={(next: boolean) => !loading && !next && onClose()}
            title={resolveLanguageKey("title")}
            desc={resolveLanguageKey("description")}
            confirmText={resolveLanguageKey("confirm")}
            cancelBtnText={resolveLanguageKey("cancel")}
            isLoading={loading}
            disabled={!(value > 0 && value <= due + 0.005)}
            handleConfirm={() => onFilterChange({_id: plan._id, amount: value, ...(note.trim() ? {note: note.trim()} : {})})}
        >
            <div className="flex flex-col gap-2">
                <Label htmlFor="plan-payment-amount">{resolveLanguageKey("amountLabel")}</Label>
                <Input id="plan-payment-amount" type="number" min={0} step="any" value={amount} onChange={(e) => setAmount(e.target.value)} disabled={loading} />
            </div>
            <div className="flex flex-col gap-2">
                <Label htmlFor="plan-payment-note">{resolveLanguageKey("noteLabel")}</Label>
                <Input id="plan-payment-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder={resolveLanguageKey("notePlaceholder")} disabled={loading} />
            </div>
        </ConfirmDialog>
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/plans/center/dialogs/recordPlanPaymentDialog.tsx"),
    withAxios<TreatmentPlan, RecordPlanPaymentFormType>({url: "/api/dentalClinic/treatmentPlan/recordPayment", method: "POST", data: {}}, true),
    withDebug(true, true, "treatmentplans"),
)(RecordPlanPaymentDialog);
