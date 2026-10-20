import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {Practitioner} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/practitioner/practitioner.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import PractitionerCard from "./center/cardView/practitionerCard.tsx";
import PractitionerSheetView from "./center/sheetView/practitionerSheetView.tsx";

export function practitionerEditPath(row: {_id: string}) {
    return `/dentalClinic/team/edit?practitionerId=${row._id}`;
}

function AllPractitioners({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<Practitioner>
            apiUrl="/api/dentalClinic/practitioner"
            collectionName="practitioners"
            accessModel="practitioners"
            tableConfigKey="practitioners"
            createPath="/dentalClinic/team/create"
            createIcon={<IconPlus />}
            createLanguageKey="create"
            buildEditPath={practitionerEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/dentalClinic/clients/panel/private/team/center/sheetView/practitionerSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderSheet={({open, onOpenChange, entity, onDelete, onRestore}) => (
                <PractitionerSheetView
                    open={open}
                    onOpenChange={onOpenChange}
                    practitioner={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                />
            )}
            renderCard={(row, onDelete, onRestore) => (
                <PractitionerCard
                    practitioner={row}
                    onDelete={(deleted: Practitioner | undefined, response?: DeletedData) => onDelete(deleted, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/team/index.tsx"),
    withDebug(true, true, "practitioners"),
)(AllPractitioners);
