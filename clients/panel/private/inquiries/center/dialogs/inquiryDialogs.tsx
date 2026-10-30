import type {ClinicInquiry} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicInquiry/clinicInquiry.dto.ts";
import StartReviewInquiryDialog from "./startReviewInquiryDialog.tsx";
import RequestInquiryInfoDialog from "./requestInquiryInfoDialog.tsx";
import ConvertInquiryDialog from "./convertInquiryDialog.tsx";
import AssignInquiryDialog from "./assignInquiryDialog.tsx";
import DeclineInquiryDialog from "./declineInquiryDialog.tsx";
import MarkLostInquiryDialog from "./markLostInquiryDialog.tsx";

/** The dialog for the action picked in an estimate request's menu. */
export default function InquiryDialogs({
    action,
    inquiry,
    onClose,
    onUpdated,
}: {
    action: string;
    inquiry: ClinicInquiry;
    onClose: () => void;
    onUpdated: (updated: ClinicInquiry) => void;
}) {
    const props = {inquiry, onClose, onUpdated};
    switch (action) {
        case "startReview": return <StartReviewInquiryDialog {...props} />;
        case "requestInfo": return <RequestInquiryInfoDialog {...props} />;
        case "convert": return <ConvertInquiryDialog {...props} />;
        case "assign": return <AssignInquiryDialog {...props} />;
        case "decline": return <DeclineInquiryDialog {...props} />;
        case "markLost": return <MarkLostInquiryDialog {...props} />;
        default: return null;
    }
}
