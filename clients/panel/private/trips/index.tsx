import {compose} from "redux";
import {useMemo} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage, {EntityListCreateButton, EntityListHeader, type QuickFilterDef} from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators.ts";
import {PATIENT_TRIP_STATUSES} from "armonia/src/modules/dentalClinic/constants/index.ts";
import type {PatientTrip} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/patientTrip/patientTrip.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import PatientTripCard from "./center/cardView/patientTripCard.tsx";
import PatientTripSheetView from "./center/sheetView/patientTripSheetView.tsx";

export function patientTripEditPath(row: {_id: string}) {
    return `/dentalClinic/trips/edit?patientTripId=${row._id}`;
}

function AllPatientTrips({resolveLanguageKey}: WithLanguageType) {
    const quickFilters = useMemo<QuickFilterDef[]>(() => [
        {
            field: "status",
            label: String(resolveLanguageKey("fields.status")),
            type: COLUMN_TYPE.ENUM,
            enumValues: PATIENT_TRIP_STATUSES.map((value) => ({
                value,
                label: String(resolveLanguageKey(`fields.!enums.status.${value}`)),
            })),
        },
        {
            field: "patient",
            label: String(resolveLanguageKey("fields.patient")),
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/dentalClinic/patient/select",
        },
        {
            field: "transfer",
            label: String(resolveLanguageKey("fields.transfer")),
            type: COLUMN_TYPE.BOOLEAN,
        },
    ], [resolveLanguageKey]);

    return (
        <EntityListPage<PatientTrip>
            apiUrl="/api/dentalClinic/patientTrip"
            collectionName="patienttrips"
            accessModel="patienttrips"
            tableConfigKey="patienttrips"
            header={(ctx) => (
                <EntityListHeader ctx={ctx}>
                    <EntityListCreateButton
                        ctx={ctx}
                        path="/dentalClinic/trips/create"
                        icon={<IconPlus />}
                    />
                </EntityListHeader>
            )}
            buildEditPath={patientTripEditPath}
            resolveLanguageKey={resolveLanguageKey}
            quickFilters={quickFilters}
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
