import {useImperativeHandle} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import ConfirmDialog from "@coreModule/components/custom/confirmDialog.tsx";
import type {TreatmentPlan} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/treatmentPlan/treatmentPlan.dto.ts";

type Props = WithLanguageType & WithAxiosType<TreatmentPlan, {_id: string}> & {
    plan: TreatmentPlan;
    onClose: () => void;
    onUpdated: (updated: TreatmentPlan) => void;
};

/** Copies a sent quote into a new draft; sending the draft replaces the original. */
function RevisePlanDialog({plan, onClose, onUpdated, resolveLanguageKey, onFilterChange, innerRef, loading}: Props) {
    useImperativeHandle(innerRef, () => ({success: (data) => { onUpdated(data); onClose(); }}));

    return (
        <ConfirmDialog
            open
            onOpenChange={(next: boolean) => !loading && !next && onClose()}
            title={resolveLanguageKey("title")}
            desc={resolveLanguageKey("description")}
            confirmText={resolveLanguageKey("confirm")}
            cancelBtnText={resolveLanguageKey("cancel")}
            isLoading={loading}
            handleConfirm={() => onFilterChange({_id: plan._id})}
        />
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/plans/center/dialogs/revisePlanDialog.tsx"),
    withAxios<TreatmentPlan, {_id: string}>({url: "/api/dentalClinic/treatmentPlan/revise", method: "POST", data: {}}, true),
    withDebug(true, true, "treatmentplans"),
)(RevisePlanDialog);
