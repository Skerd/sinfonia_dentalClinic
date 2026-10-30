import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {PatientTrip} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/patientTrip/patientTrip.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import PatientTripCard from "./center/cardView/patientTripCard.tsx";
import PatientTripSheetView from "./center/sheetView/patientTripSheetView.tsx";

export function patientTripEditPath(row: {_id: string}) {
    return `/dentalClinic/trips/edit?patientTripId=${row._id}`;
}

function AllPatientTrips({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<PatientTrip>
            apiUrl="/api/dentalClinic/patientTrip"
            collectionName="patienttrips"
            accessModel="patienttrips"
            tableConfigKey="patienttrips"
            createPath="/dentalClinic/trips/create"
            createIcon={<IconPlus />}
            createLanguageKey="create"
            buildEditPath={patientTripEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/dentalClinic/clients/panel/private/trips/center/sheetView/patientTripSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderSheet={({open, onOpenChange, entity, onDelete, onRestore}) => (
                <PatientTripSheetView
                    open={open}
                    onOpenChange={onOpenChange}
                    patientTrip={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                />
            )}
            renderCard={(row, onDelete, onRestore) => (
                <PatientTripCard
                    patientTrip={row}
                    onDelete={(deleted: PatientTrip | undefined, response?: DeletedData) => onDelete(deleted, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/trips/index.tsx"),
    withDebug(true, true, "patienttrips"),
)(AllPatientTrips);
