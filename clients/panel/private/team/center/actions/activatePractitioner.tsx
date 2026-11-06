import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {IconPower} from "@tabler/icons-react";
import type {Practitioner} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/practitioner/practitioner.dto.ts";

type ActivatePractitionerProps = WithLanguageType & {
    entity: Pick<Practitioner, "_id" | "isActive">;
    onAction: (action: string) => void;
};

function ActivatePractitioner({entity, resolveLanguageKey, onAction}: ActivatePractitionerProps) {
    const {write} = useAccess("practitioners");

    if (!write?.isActive) return null;
    if (entity.isActive) return null;

    return (
        <DropdownMenuItem onClick={() => onAction("activatePractitioner")}>
            <IconPower className="text-success" size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/team/center/actions/activatePractitioner.tsx"),
    withDebug(true, true, "practitioners"),
)(ActivatePractitioner);
