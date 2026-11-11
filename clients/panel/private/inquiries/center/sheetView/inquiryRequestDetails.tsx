import {compose} from "redux";
import {IconCircleCheck, IconClockHour4, IconDental} from "@tabler/icons-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {DATE_FORMATS, formatDate} from "@coreModule/helpers/general/dateTime.ts";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import DisplayCard from "@coreModule/components/viewEngine/widgets/display/displayCard.tsx";
import type {ClinicInquiry} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicInquiry/clinicInquiry.dto.ts";

type Props = WithLanguageType & {inquiry: Pick<ClinicInquiry, "treatmentsWanted" | "infoRequests">};

/** What the patient asks about, and what the clinic asked them for (received or still awaited), as the sheet's own cards. */
function InquiryRequestDetails({inquiry, resolveLanguageKey}: Props) {
    const title = String(resolveLanguageKey("treatmentsTitle"));
    return (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="sm:col-span-2">
                <DisplayCard
                    show
                    title={title}
                    tooltip={title}
                    Icon={IconDental}
                    value={(
                        <div className="mt-0.5 flex flex-wrap gap-1.5">
                            {(inquiry.treatmentsWanted ?? []).map((treatment) => (
                                <Badge key={treatment} variant="secondary">{resolveLanguageKey(`treatment.${treatment}`)}</Badge>
                            ))}
                        </div>
                    )}
                />
            </div>
            {(inquiry.infoRequests ?? []).map((request) => {
                const kind = String(resolveLanguageKey(`kind.${request.kind}`));
                const when = request.fulfilledAt
                    ? `${resolveLanguageKey("fulfilledOn")} ${formatDate(request.fulfilledAt, {format: DATE_FORMATS.mediumDate})}`
                    : `${resolveLanguageKey("requestedOn")} ${formatDate(request.requestedAt, {format: DATE_FORMATS.mediumDate})}`;
                return (
                    <DisplayCard
                        key={`${request.kind}-${request.requestedAt}`}
                        show
                        variant={request.fulfilledAt ? "success" : "warning"}
                        title={kind}
                        tooltip={String(resolveLanguageKey("infoRequestsTitle"))}
                        Icon={request.fulfilledAt ? IconCircleCheck : IconClockHour4}
                        value={request.note ? `${when} · ${request.note}` : when}
                    />
                );
            })}
        </div>
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/inquiries/center/sheetView/inquiryRequestDetails.tsx"),
)(InquiryRequestDetails);
