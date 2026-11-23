import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {IconWorld} from "@tabler/icons-react";
import type {ClinicReview} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicReview/clinicReview.dto.ts";

type PublishClinicReviewProps = WithLanguageType & {
    entity: Pick<ClinicReview, "_id" | "isPublished">;
    onAction: (action: string) => void;
};

function PublishClinicReview({entity, resolveLanguageKey, onAction}: PublishClinicReviewProps) {
    const {write} = useAccess("clinicreviews");

    if (!write?.isPublished) return null;
    if (entity.isPublished) return null;

    return (
        <DropdownMenuItem onClick={() => onAction("publishClinicReview")}>
            <IconWorld className="text-success" size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/reviews/center/actions/publishClinicReview.tsx"),
    withDebug(true, true, "clinicreviews"),
)(PublishClinicReview);
