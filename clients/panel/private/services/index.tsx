import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {ClinicService} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicService/clinicService.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ClinicServiceCard from "./center/cardView/clinicServiceCard.tsx";
import ClinicServiceSheetView from "./center/sheetView/clinicServiceSheetView.tsx";
import ActivateClinicService from "./center/actions/activateClinicService.tsx";
import DeactivateClinicService from "./center/actions/deactivateClinicService.tsx";
import ActivateClinicServiceDialog from "./center/dialogs/activateClinicServiceDialog.tsx";
import DeactivateClinicServiceDialog from "./center/dialogs/deactivateClinicServiceDialog.tsx";

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
            rowActionMenu={{allowMenuForCustomChildren: true}}
            createPath="/dentalClinic/services/create"
            createIcon={<IconPlus />}
            createLanguageKey="create"
            buildEditPath={clinicServiceEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/dentalClinic/clients/panel/private/services/center/sheetView/clinicServiceSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderActionMenuChildren={(entity, bindRowAction) => (
                <>
                    <ActivateClinicService entity={entity} onAction={bindRowAction} />
                    <DeactivateClinicService entity={entity} onAction={bindRowAction} />
                </>
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) => {
                if (action === "activateClinicService") {
                    return (
                        <ActivateClinicServiceDialog
                            open
                            onClose={resetAction}
                            entity={entity}
                            onSuccess={() => listRef.current?.updateRow?.(entity._id, {isActive: true})}
                        />
                    );
                }
                if (action === "deactivateClinicService") {
                    return (
                        <DeactivateClinicServiceDialog
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
                <ClinicServiceSheetView
                    open={open}
                    onOpenChange={onOpenChange}
                    clinicService={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onActiveChanged={(isActive: boolean) => listRef.current?.updateRow?.(entity._id, {isActive})}
                    onSheetRowPatched={(row: Partial<ClinicService>) => listRef.current?.updateRow?.(entity._id, row)}
                />
            )}
            renderCard={(row, onDelete, onRestore, listRef) => (
                <ClinicServiceCard
                    clinicService={row}
                    onDelete={(deleted: ClinicService | undefined, response?: DeletedData) => onDelete(deleted, response)}
                    onRestore={() => onRestore(row)}
                    onActiveChanged={(isActive: boolean) => listRef.current?.updateRow?.(row._id, {isActive})}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/services/index.tsx"),
    withDebug(true, true, "clinicservices"),
)(AllClinicServices);
