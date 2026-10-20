import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {ClinicLocation} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicLocation/clinicLocation.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ClinicLocationCard from "./center/cardView/clinicLocationCard.tsx";
import ClinicLocationSheetView from "./center/sheetView/clinicLocationSheetView.tsx";

export function clinicLocationEditPath(row: {_id: string}) {
    return `/dentalClinic/locations/edit?clinicLocationId=${row._id}`;
}

function AllClinicLocations({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<ClinicLocation>
            apiUrl="/api/dentalClinic/clinicLocation"
            collectionName="cliniclocations"
            accessModel="cliniclocations"
            tableConfigKey="cliniclocations"
            createPath="/dentalClinic/locations/create"
            createIcon={<IconPlus />}
            createLanguageKey="create"
            buildEditPath={clinicLocationEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/dentalClinic/clients/panel/private/locations/center/sheetView/clinicLocationSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderSheet={({open, onOpenChange, entity, onDelete, onRestore}) => (
                <ClinicLocationSheetView
                    open={open}
                    onOpenChange={onOpenChange}
                    clinicLocation={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                />
            )}
            renderCard={(row, onDelete, onRestore) => (
                <ClinicLocationCard
                    clinicLocation={row}
                    onDelete={(deleted: ClinicLocation | undefined, response?: DeletedData) => onDelete(deleted, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/locations/index.tsx"),
    withDebug(true, true, "cliniclocations"),
)(AllClinicLocations);
