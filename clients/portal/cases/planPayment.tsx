import {compose} from "redux";
import {useMemo, useState} from "react";
import {toast} from "sonner";
import {Lock} from "lucide-react";
import {loadStripe} from "@stripe/stripe-js";
import {Elements, PaymentElement, useElements, useStripe} from "@stripe/react-stripe-js";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {formatCurrency} from "@coreModule/helpers/general/numbers.ts";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import type {
    PatientDepositPaymentResponse,
    PatientPlan,
} from "armonia/src/modules/dentalClinic/api/dentalClinic/public/patientPortal/patientPortal.response.types.ts";

type Props = WithLanguageType & {
    plan: PatientPlan;
    /** Card payments can be taken on this platform. */
    onlinePayment: boolean;
    /** The payment went through: the plan should reload (the clinic's records follow shortly). */
    onPaid: () => void;
};

type CardFormProps = Pick<WithLanguageType, "resolveLanguageKey"> & {clientSecret: string; onPaid: () => void};

/** Card entry for the deposit. Rendered inside Stripe `<Elements>`. */
function CardForm({clientSecret, onPaid, resolveLanguageKey}: CardFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [submitting, setSubmitting] = useState(false);

    async function handlePay() {
        if (!stripe || !elements) return;
        setSubmitting(true);
        try {
            // A previous attempt may already have been charged — never charge twice.
            const {paymentIntent} = await stripe.retrievePaymentIntent(clientSecret);
            if (paymentIntent?.status === "succeeded" || paymentIntent?.status === "processing") {
                onPaid();
                return;
            }
            const result = await stripe.confirmPayment({
                elements,
                confirmParams: {return_url: window.location.href},
                redirect: "if_required",
            });
            if (result.error) {
                toast.error(result.error.message ?? String(resolveLanguageKey("payFailed")));
                return;
            }
            onPaid();
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <PaymentElement />
            <Button type="button" onClick={() => void handlePay()} disabled={!stripe || submitting}>
                <Lock className="h-4 w-4" aria-hidden />
                {resolveLanguageKey(submitting ? "processing" : "pay")}
            </Button>
        </div>
    );
}

/** The accepted plan's money: what was paid, what is left, and the deposit by card where it is offered. */
function PlanPayment({plan, onlinePayment, onPaid, resolveLanguageKey}: Props) {
    const [payment, setPayment] = useState<PatientDepositPaymentResponse["data"] | null>(null);
    const [starting, setStarting] = useState(false);
    const publishableKey = payment?.publishableKey;
    const stripePromise = useMemo(() => (publishableKey ? loadStripe(publishableKey) : null), [publishableKey]);
    const money = (amount: number) => (plan.currency?.abbreviation ? formatCurrency(amount, plan.currency.abbreviation) : String(amount));
    const due = Math.max(0, plan.totals.total - plan.amountPaid);

    function startPayment() {
        setStarting(true);
        apiClient.post<PatientDepositPaymentResponse>("/api/dentalClinic/patientPortal/payDeposit", {plan: plan._id})
            .then((res) => setPayment(res.data.data))
            .catch(() => toast.error(String(resolveLanguageKey("payUnavailable"))))
            .finally(() => setStarting(false));
    }

    return (
        <section className="flex flex-col gap-3 rounded-lg border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">{resolveLanguageKey("title").replace("{clinic}", plan.clinic.name)}</h3>
                <Badge variant="outline">{resolveLanguageKey(`status.${plan.paymentStatus}`)}</Badge>
            </div>
            <dl className="grid grid-cols-2 gap-1 text-sm">
                <dt className="text-muted-foreground">{resolveLanguageKey("total")}</dt>
                <dd className="text-right tabular-nums">{money(plan.totals.total)}</dd>
                {plan.totals.deposit ? (
                    <>
                        <dt className="text-muted-foreground">{resolveLanguageKey("deposit")}</dt>
                        <dd className="text-right tabular-nums">{money(plan.totals.deposit)}</dd>
                    </>
                ) : null}
                <dt className="text-muted-foreground">{resolveLanguageKey("paid")}</dt>
                <dd className="text-right tabular-nums">{money(plan.amountPaid)}</dd>
                <dt className="font-medium">{resolveLanguageKey("due")}</dt>
                <dd className="text-right font-medium tabular-nums">{money(due)}</dd>
            </dl>

            {plan.depositDue > 0 && onlinePayment && !payment ? (
                <Button type="button" className="self-start" onClick={startPayment} disabled={starting}>
                    {resolveLanguageKey("payDeposit").replace("{amount}", money(plan.depositDue))}
                </Button>
            ) : null}
            {plan.depositDue > 0 && !onlinePayment ? (
                <p className="text-sm text-muted-foreground">{resolveLanguageKey("payAtClinic")}</p>
            ) : null}
            {payment && stripePromise ? (
                <Elements stripe={stripePromise} options={{clientSecret: payment.clientSecret}}>
                    <CardForm
                        clientSecret={payment.clientSecret}
                        resolveLanguageKey={resolveLanguageKey}
                        onPaid={() => {
                            setPayment(null);
                            toast.success(String(resolveLanguageKey("paymentReceived")));
                            onPaid();
                        }}
                    />
                </Elements>
            ) : null}
            {due > 0 && plan.depositDue <= 0 ? (
                <p className="text-xs text-muted-foreground">{resolveLanguageKey("restAtClinic")}</p>
            ) : null}
        </section>
    );
}

export default compose(withLanguage("src/modules/dentalClinic/clients/portal/cases/planPayment.tsx"))(PlanPayment);
