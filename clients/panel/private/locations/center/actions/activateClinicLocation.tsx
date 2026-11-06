import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {IconPower} from "@tabler/icons-react";
import type {ClinicLocation} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicLocation/clinicLocation.dto.ts";

type ActivateClinicLocationProps = WithLanguageType & {
    entity: Pick<ClinicLocation, "_id" | "isActive">;
    onAction: (action: string) => void;
};

function ActivateClinicLocation({entity, resolveLanguageKey, onAction}: ActivateClinicLocationProps) {
    const {write} = useAccess("cliniclocations");

    if (!write?.isActive) return null;
    if (entity.isActive) return null;

    return (
        <DropdownMenuItem onClick={() => onAction("activateClinicLocation")}>
            <IconPower className="text-success" size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/locations/center/actions/activateClinicLocation.tsx"),
    withDebug(true, true, "cliniclocations"),
)(ActivateClinicLocation);
