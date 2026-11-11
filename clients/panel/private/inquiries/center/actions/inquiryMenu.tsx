import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {IconEye, IconFilePlus, IconFileSearch, IconFolderPlus, IconThumbDown, IconUserCheck, IconUserOff} from "@tabler/icons-react";
import {useNavigate} from "react-router-dom";
import {treatmentPlanCreatePath} from "@dentalClinicModule/clients/panel/private/plans/planPaths.ts";
import type {ClinicInquiry} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicInquiry/clinicInquiry.dto.ts";

/** What can be done with an estimate request in its current state, for the row and sheet menus. */
export type InquiryAction = "startReview" | "requestInfo" | "convert" | "assign" | "decline" | "markLost";

const OPEN_STATUSES: ClinicInquiry["status"][] = ["new", "in_review", "info_requested", "quoted"];

type Props = WithLanguageType & {
    inquiry: ClinicInquiry;
    onAction: (action: InquiryAction) => void;
};

function InquiryMenu({inquiry, onAction, resolveLanguageKey}: Props) {
    const {write} = useAccess("clinicinquiries");
    const plans = useAccess("treatmentplans");
    const navigate = useNavigate();
    if (inquiry.deletedAt) return null;

    const open = OPEN_STATUSES.includes(inquiry.status);
    const item = (action: InquiryAction, Icon: typeof IconEye, destructive = false) => (
        <DropdownMenuItem key={action} onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAction(action); }}>
            <Icon size={16} className={destructive ? "text-destructive" : undefined} />
            <p className={destructive ? "text-destructive" : undefined}>{resolveLanguageKey(action)}</p>
        </DropdownMenuItem>
    );

    return (
        <>
            {write?.status && inquiry.status === "new" && item("startReview", IconEye)}
            {/* The quote form opens on this request, the way the sheet's Quotes section does. */}
            {plans.create && open ? (
                <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(treatmentPlanCreatePath({inquiry: inquiry._id})); }}>
                    <IconFilePlus size={16} />
                    <p>{resolveLanguageKey("writeQuote")}</p>
                </DropdownMenuItem>
            ) : null}
            {write?.status && open && item("requestInfo", IconFileSearch)}
            {write?.status && open && item("convert", IconFolderPlus)}
            {write?.assignedTo && (open || inquiry.status === "converted") && item("assign", IconUserCheck)}
            {write?.status && open && item("decline", IconThumbDown, true)}
            {write?.status && open && item("markLost", IconUserOff, true)}
        </>
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/inquiries/center/actions/inquiryMenu.tsx"),
    withDebug(true, true, "clinicinquiries"),
)(InquiryMenu);
