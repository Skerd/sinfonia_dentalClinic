export function treatmentPlanEditPath(row: {_id: string}) {
    return `/dentalClinic/plans/edit?treatmentPlanId=${row._id}`;
}

/** A new quote answering a request, or for a patient. */
export function treatmentPlanCreatePath(target: {inquiry?: string; patient?: string}) {
    const params = new URLSearchParams();
    if (target.inquiry) params.set("inquiry", target.inquiry);
    if (target.patient) params.set("patient", target.patient);
    return `/dentalClinic/plans/create?${params}`;
}
