import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {ClinicService} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicService/clinicService.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ClinicServiceCard from "./center/cardView/clinicServiceCard.tsx";
import ClinicServiceSheetView from "./center/sheetView/clinicServiceSheetView.tsx";

export function clinicServiceEditPath(row: {_id: string}) {
    return `/dentalClinic/services/edit?clinicServiceId=${row._id}`;
}

function AllClinicServices({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<ClinicService>
            apiUrl="/api/dentalClinic/clinicService"
            collectionName="clinicservices"
            accessModel="clinicservices"
            tableConfigKey="clinicservices"
            createPath="/dentalClinic/services/create"
            createIcon={<IconPlus />}
            createLanguageKey="create"
            buildEditPath={clinicServiceEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/dentalClinic/clients/panel/private/services/center/sheetView/clinicServiceSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderSheet={({open, onOpenChange, entity, onDelete, onRestore}) => (
                <ClinicServiceSheetView
                    open={open}
                    onOpenChange={onOpenChange}
                    clinicService={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                />
            )}
            renderCard={(row, onDelete, onRestore) => (
                <ClinicServiceCard
                    clinicService={row}
                    onDelete={(deleted: ClinicService | undefined, response?: DeletedData) => onDelete(deleted, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/services/index.tsx"),
    withDebug(true, true, "clinicservices"),
)(AllClinicServices);
