import {compose} from "redux";
import {useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {formatPlanAmount} from "@dentalClinicModule/clients/portal/cases/planAmount.ts";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Checkbox} from "@coreModule/components/ui/checkbox.tsx";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@coreModule/components/ui/dialog.tsx";
import FormField from "@coreModule/clients/portal/shared/formField.tsx";
import FormStatus from "@coreModule/clients/portal/shared/formStatus.tsx";
import type {AcceptTreatmentPlanFormType} from "armonia/src/modules/dentalClinic/api/dentalClinic/public/patientPortal/patientPortal.forms.ts";
import type {PatientPlan} from "armonia/src/modules/dentalClinic/api/dentalClinic/public/patientPortal/patientPortal.response.types.ts";

const ACCEPT_PLAN_REQUEST: HttpRequest = {method: "POST", url: "/api/dentalClinic/patientPortal/acceptPlan"};

type Props = WithLanguageType & {
    plan: PatientPlan;
    onClose: () => void;
    onAccepted: () => void;
};

/**
 * Accepting a quote: the patient types their full name as a signature and confirms what happens
 * next (this clinic gets their contact, the other clinics are told they chose another).
 */
function AcceptOfferDialog({plan, onClose, onAccepted, resolveLanguageKey}: Props) {
    const [signedName, setSignedName] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [acceptCount, setAcceptCount] = useState(0);
    const total = formatPlanAmount(plan, plan.totals.total);

    const body: AcceptTreatmentPlanFormType = {plan: plan._id, signedName: signedName.trim(), acceptTerms: agreed};
    const acceptRequest = useHttpRequest(ACCEPT_PLAN_REQUEST, body, acceptCount, true, {success: () => onAccepted()});
    const state = acceptRequest.loading ? "sending" : acceptRequest.error ? "failed" : "idle";
    const accept = () => setAcceptCount((count) => count + 1);

    return (
        <Dialog open onOpenChange={(open) => !open && state !== "sending" && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{resolveLanguageKey("title").replace("{clinic}", plan.clinic.name)}</DialogTitle>
                    <DialogDescription>{resolveLanguageKey("description").replace("{total}", total)}</DialogDescription>
                </DialogHeader>
                <ul className="list-inside list-disc text-sm text-muted-foreground">
                    <li>{resolveLanguageKey("pointContact")}</li>
                    <li>{resolveLanguageKey("pointOthers")}</li>
                    <li>{resolveLanguageKey("pointProvisional")}</li>
                </ul>
                <FormField required autoComplete="name" label={resolveLanguageKey("signedName")} value={signedName} onChange={(event) => setSignedName(event.target.value)} />
                <label className="flex items-start gap-2 text-sm">
                    <Checkbox checked={agreed} onCheckedChange={(checked) => setAgreed(checked === true)} className="mt-0.5" />
                    <span>{resolveLanguageKey("agree")}</span>
                </label>
                {state === "failed" ? <FormStatus tone="error">{resolveLanguageKey("failed")}</FormStatus> : null}
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose} disabled={state === "sending"}>{resolveLanguageKey("cancel")}</Button>
                    <Button type="button" onClick={accept} disabled={state === "sending" || !agreed || signedName.trim().length < 3}>{resolveLanguageKey("confirm")}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default compose(withLanguage("src/modules/dentalClinic/clients/portal/cases/acceptOfferDialog.tsx"))(AcceptOfferDialog);
