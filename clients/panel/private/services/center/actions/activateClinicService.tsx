import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Power} from "lucide-react";
import type {ClinicService} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicService/clinicService.dto.ts";

type ActivateClinicServiceProps = WithLanguageType & {
    entity: Pick<ClinicService, "_id" | "isActive">;
    onAction: (action: string) => void;
};

function ActivateClinicService({entity, resolveLanguageKey, onAction}: ActivateClinicServiceProps) {
    const {write} = useAccess("clinicservices");

    if (!write?.isActive) return null;
    if (entity.isActive) return null;

    return (
        <DropdownMenuItem onClick={() => onAction("activateClinicService")}>
            <Power className="text-success" size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/services/center/actions/activateClinicService.tsx"),
    withDebug(true, true, "clinicservices"),
)(ActivateClinicService);
