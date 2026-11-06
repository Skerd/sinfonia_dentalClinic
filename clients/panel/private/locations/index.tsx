import {compose} from "redux";
import {useMemo} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage, {EntityListCreateButton, EntityListHeader, type QuickFilterDef} from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators.ts";
import type {ClinicLocation} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicLocation/clinicLocation.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ClinicLocationCard from "./center/cardView/clinicLocationCard.tsx";
import ClinicLocationSheetView from "./center/sheetView/clinicLocationSheetView.tsx";
import ActivateClinicLocation from "./center/actions/activateClinicLocation.tsx";
import DeactivateClinicLocation from "./center/actions/deactivateClinicLocation.tsx";
import ActivateClinicLocationDialog from "./center/dialogs/activateClinicLocationDialog.tsx";
import DeactivateClinicLocationDialog from "./center/dialogs/deactivateClinicLocationDialog.tsx";

export function clinicLocationEditPath(row: {_id: string}) {
    return `/dentalClinic/locations/edit?clinicLocationId=${row._id}`;
}

function AllClinicLocations({resolveLanguageKey}: WithLanguageType) {
    const quickFilters = useMemo<QuickFilterDef[]>(() => [
        {
            field: "isActive",
            label: String(resolveLanguageKey("fields.isActive")),
            type: COLUMN_TYPE.BOOLEAN,
        },
    ], [resolveLanguageKey]);

    return (
        <EntityListPage<ClinicLocation>
            apiUrl="/api/dentalClinic/clinicLocation"
            collectionName="cliniclocations"
            accessModel="cliniclocations"
            tableConfigKey="cliniclocations"
            rowActionMenu={{allowMenuForCustomChildren: true}}
            header={(ctx) => (
                <EntityListHeader ctx={ctx}>
                    <EntityListCreateButton
                        ctx={ctx}
                        path="/dentalClinic/locations/create"
                        icon={<IconPlus />}
                    />
                </EntityListHeader>
            )}
            buildEditPath={clinicLocationEditPath}
            resolveLanguageKey={resolveLanguageKey}
            quickFilters={quickFilters}
            sheetLanguagePath="src/modules/dentalClinic/clients/panel/private/locations/center/sheetView/clinicLocationSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderActionMenuChildren={(entity, bindRowAction) => (
                <>
                    <ActivateClinicLocation entity={entity} onAction={bindRowAction} />
                    <DeactivateClinicLocation entity={entity} onAction={bindRowAction} />
                </>
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) => {
                if (action === "activateClinicLocation") {
                    return (
                        <ActivateClinicLocationDialog
                            open
                            onClose={resetAction}
                            entity={entity}
                            onSuccess={() => listRef.current?.updateRow?.(entity._id, {isActive: true})}
                        />
                    );
                }
                if (action === "deactivateClinicLocation") {
                    return (
                        <DeactivateClinicLocationDialog
                            open
                            onClose={resetAction}
                            entity={entity}
                            onSuccess={() => listRef.current?.updateRow?.(entity._id, {isActive: false})}
                        />
                    );
                }
                return null;
            }}
            renderSheet={({open, onOpenChange, entity, onDelete, onRestore, listRef}) => (
                <ClinicLocationSheetView
                    open={open}
                    onOpenChange={onOpenChange}
                    clinicLocation={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onActiveChanged={(isActive: boolean) => listRef.current?.updateRow?.(entity._id, {isActive})}
                    onSheetRowPatched={(row: Partial<ClinicLocation>) => listRef.current?.updateRow?.(entity._id, row)}
                />
            )}
            renderCard={(row, onDelete, onRestore, listRef) => (
                <ClinicLocationCard
                    clinicLocation={row}
                    onDelete={(deleted: ClinicLocation | undefined, response?: DeletedData) => onDelete(deleted, response)}
                    onRestore={() => onRestore(row)}
                    onActiveChanged={(isActive: boolean) => listRef.current?.updateRow?.(row._id, {isActive})}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/locations/index.tsx"),
    withDebug(true, true, "cliniclocations"),
)(AllClinicLocations);
