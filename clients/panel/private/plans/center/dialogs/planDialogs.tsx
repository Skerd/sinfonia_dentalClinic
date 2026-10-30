import type {TreatmentPlan} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/treatmentPlan/treatmentPlan.dto.ts";
import SendPlanDialog from "./sendPlanDialog.tsx";
import RevisePlanDialog from "./revisePlanDialog.tsx";
import RecordPlanPaymentDialog from "./recordPlanPaymentDialog.tsx";
import RefundPlanPaymentDialog from "./refundPlanPaymentDialog.tsx";

/**
 * The dialog for the action picked in a quote's menu. A revision is a new plan: `onCreated`
 * receives it, while `onUpdated` receives the plan that was sent.
 */
export default function PlanDialogs({
    action,
    plan,
    onClose,
    onUpdated,
    onCreated,
}: {
    action: string;
    plan: TreatmentPlan;
    onClose: () => void;
    onUpdated: (updated: TreatmentPlan) => void;
    onCreated: (created: TreatmentPlan) => void;
}) {
    switch (action) {
        case "send": return <SendPlanDialog plan={plan} onClose={onClose} onUpdated={onUpdated} />;
        case "revise": return <RevisePlanDialog plan={plan} onClose={onClose} onUpdated={onCreated} />;
        case "recordPayment": return <RecordPlanPaymentDialog plan={plan} onClose={onClose} onUpdated={onUpdated} />;
        case "refund": return <RefundPlanPaymentDialog plan={plan} onClose={onClose} onUpdated={onUpdated} />;
        default: return null;
    }
}
