import {compose} from "redux";
import {useMemo} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage, {type QuickFilterDef} from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators.ts";
import {PATIENT_LANGUAGES, PATIENT_SOURCES} from "armonia/src/modules/dentalClinic/constants/index.ts";
import {PATIENT_SEXES} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/patient/patient.schema-def.ts";
import type {Patient} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/patient/patient.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import PatientCard from "./center/cardView/patientCard.tsx";
import PatientSheetView from "./center/sheetView/patientSheetView.tsx";

export function patientEditPath(row: {_id: string}) {
    return `/dentalClinic/patients/edit?patientId=${row._id}`;
}

function AllPatients({resolveLanguageKey}: WithLanguageType) {
    const quickFilters = useMemo<QuickFilterDef[]>(() => [
        {
            field: "source",
            label: String(resolveLanguageKey("fields.source")),
            type: COLUMN_TYPE.ENUM,
            enumValues: PATIENT_SOURCES.map((value) => ({
                value,
                label: String(resolveLanguageKey(`fields.!enums.source.${value}`)),
            })),
        },
        {
            field: "preferredLanguage",
            label: String(resolveLanguageKey("fields.preferredLanguage")),
            type: COLUMN_TYPE.ENUM,
            enumValues: PATIENT_LANGUAGES.map((value) => ({
                value,
                label: String(resolveLanguageKey(`fields.!enums.preferredLanguage.${value}`)),
            })),
        },
        {
            field: "sex",
            label: String(resolveLanguageKey("fields.sex")),
            type: COLUMN_TYPE.ENUM,
            enumValues: PATIENT_SEXES.map((value) => ({
                value,
                label: String(resolveLanguageKey(`fields.!enums.sex.${value}`)),
            })),
        },
    ], [resolveLanguageKey]);

    return (
        <EntityListPage<Patient>
            apiUrl="/api/dentalClinic/patient"
            collectionName="patients"
            accessModel="patients"
            tableConfigKey="patients"
            createPath="/dentalClinic/patients/create"
            createIcon={<IconPlus />}
            createLanguageKey="create"
            buildEditPath={patientEditPath}
            resolveLanguageKey={resolveLanguageKey}
            quickFilters={quickFilters}
            sheetLanguagePath="src/modules/dentalClinic/clients/panel/private/patients/center/sheetView/patientSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderSheet={({open, onOpenChange, entity, onDelete, onRestore, listRef}) => (
                <PatientSheetView
                    open={open}
                    onOpenChange={onOpenChange}
                    patient={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onSheetRowPatched={(row: Partial<Patient>) => listRef.current?.updateRow?.(entity._id, row)}
                />
            )}
            renderCard={(row, onDelete, onRestore) => (
                <PatientCard
                    patient={row}
                    onDelete={(deleted: Patient | undefined, response?: DeletedData) => onDelete(deleted, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/patients/index.tsx"),
    withDebug(true, true, "patients"),
)(AllPatients);
