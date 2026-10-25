import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {PowerOff} from "lucide-react";
import type {ClinicLocation} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicLocation/clinicLocation.dto.ts";

type DeactivateClinicLocationProps = WithLanguageType & {
    entity: Pick<ClinicLocation, "_id" | "isActive">;
    onAction: (action: string) => void;
};

function DeactivateClinicLocation({entity, resolveLanguageKey, onAction}: DeactivateClinicLocationProps) {
    const {write} = useAccess("cliniclocations");

    if (!write?.isActive) return null;
    if (!entity.isActive) return null;

    return (
        <DropdownMenuItem onClick={() => onAction("deactivateClinicLocation")}>
            <PowerOff className="text-destructive" size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/locations/center/actions/deactivateClinicLocation.tsx"),
    withDebug(true, true, "cliniclocations"),
)(DeactivateClinicLocation);
