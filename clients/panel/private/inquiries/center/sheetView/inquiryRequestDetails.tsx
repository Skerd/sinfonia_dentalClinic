import {compose} from "redux";
import {IconCircleCheck, IconClockHour4} from "@tabler/icons-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import type {ClinicInquiry} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicInquiry/clinicInquiry.dto.ts";

type Props = WithLanguageType & {inquiry: Pick<ClinicInquiry, "treatmentsWanted" | "infoRequests">};

/** What the patient asks about, and what the clinic asked them for (answered or still open). */
function InquiryRequestDetails({inquiry, resolveLanguageKey}: Props) {
    const dateFormat = new Intl.DateTimeFormat(undefined, {dateStyle: "medium"});
    return (
        <div className="flex flex-col gap-4 px-4 pb-4">
            <section className="flex flex-col gap-2">
                <h4 className="text-sm font-medium">{resolveLanguageKey("treatmentsTitle")}</h4>
                <div className="flex flex-wrap gap-1.5">
                    {(inquiry.treatmentsWanted ?? []).map((treatment) => (
                        <Badge key={treatment} variant="secondary">{resolveLanguageKey(`treatment.${treatment}`)}</Badge>
                    ))}
                </div>
            </section>
            {inquiry.infoRequests?.length ? (
                <section className="flex flex-col gap-2">
                    <h4 className="text-sm font-medium">{resolveLanguageKey("infoRequestsTitle")}</h4>
                    <ul className="flex flex-col gap-1.5">
                        {inquiry.infoRequests.map((request) => (
                            <li key={`${request.kind}-${request.requestedAt}`} className="flex items-start gap-2 text-sm">
                                {request.fulfilledAt
                                    ? <IconCircleCheck size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                                    : <IconClockHour4 size={16} className="mt-0.5 shrink-0 text-amber-600" />}
                                <div className="flex flex-col">
                                    <span>{resolveLanguageKey(`kind.${request.kind}`)}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {request.fulfilledAt
                                            ? `${resolveLanguageKey("fulfilledOn")} ${dateFormat.format(new Date(request.fulfilledAt))}`
                                            : `${resolveLanguageKey("requestedOn")} ${dateFormat.format(new Date(request.requestedAt))}`}
                                    </span>
                                    {request.note ? <span className="text-xs text-muted-foreground">{request.note}</span> : null}
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            ) : null}
        </div>
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/inquiries/center/sheetView/inquiryRequestDetails.tsx"),
)(InquiryRequestDetails);
