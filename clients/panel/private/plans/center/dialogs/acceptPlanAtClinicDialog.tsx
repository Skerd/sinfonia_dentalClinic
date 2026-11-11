import {useImperativeHandle, useState} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import ConfirmDialog from "@coreModule/components/custom/confirmDialog.tsx";
import {RadioGroup, RadioGroupItem} from "@coreModule/components/ui/radio-group.tsx";
import type {TreatmentPlan} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/treatmentPlan/treatmentPlan.dto.ts";
import type {AcceptPlanAtClinicFormType} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/treatmentPlan/treatmentPlan.schema-def.ts";
import {TREATMENT_PLAN_ACCEPTANCE_CHANNELS, type TreatmentPlanAcceptanceChannel} from "armonia/src/modules/dentalClinic/constants/index.ts";

type Props = WithLanguageType & WithAxiosType<TreatmentPlan, AcceptPlanAtClinicFormType> & {
    plan: TreatmentPlan;
    onClose: () => void;
    onUpdated: (updated: TreatmentPlan) => void;
};

/** Records that the patient accepted the quote at the desk or on the phone; payments can be taken afterwards. */
function AcceptPlanAtClinicDialog({plan, onClose, onUpdated, resolveLanguageKey, onFilterChange, innerRef, loading}: Props) {
    const [channel, setChannel] = useState<TreatmentPlanAcceptanceChannel>("in_person");
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
            handleConfirm={() => onFilterChange({_id: plan._id, channel})}
        >
            <RadioGroup
                className="flex flex-col gap-2"
                value={channel}
                onValueChange={(value) => setChannel(TREATMENT_PLAN_ACCEPTANCE_CHANNELS.find((choice) => choice === value) ?? "in_person")}
                disabled={loading}
            >
                {TREATMENT_PLAN_ACCEPTANCE_CHANNELS.map((choice) => (
                    <label key={choice} className="flex items-center gap-2 text-sm">
                        <RadioGroupItem value={choice} />
                        {resolveLanguageKey(`channel.${choice}`)}
                    </label>
                ))}
            </RadioGroup>
        </ConfirmDialog>
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/plans/center/dialogs/acceptPlanAtClinicDialog.tsx"),
    withAxios<TreatmentPlan, AcceptPlanAtClinicFormType>({url: "/api/dentalClinic/treatmentPlan/acceptForPatient", method: "POST", data: {}}, true),
    withDebug(true, true, "treatmentplans"),
)(AcceptPlanAtClinicDialog);
