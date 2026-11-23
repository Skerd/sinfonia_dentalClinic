import {useMemo} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage, {EntityListCreateButton, EntityListHeader, type QuickFilterDef} from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {ClinicReview} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicReview/clinicReview.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ClinicReviewCard from "./center/cardView/clinicReviewCard.tsx";
import ClinicReviewSheetView from "./center/sheetView/clinicReviewSheetView.tsx";
import PublishClinicReview from "./center/actions/publishClinicReview.tsx";
import UnpublishClinicReview from "./center/actions/unpublishClinicReview.tsx";
import PublishClinicReviewDialog from "./center/dialogs/publishClinicReviewDialog.tsx";
import UnpublishClinicReviewDialog from "./center/dialogs/unpublishClinicReviewDialog.tsx";

export function clinicReviewEditPath(row: {_id: string}) {
    return `/dentalClinic/reviews/edit?clinicReviewId=${row._id}`;
}

function AllClinicReviews({resolveLanguageKey}: WithLanguageType) {
    const quickFilters = useMemo<QuickFilterDef[]>(() => [
        {
            field: "isPublished",
            label: resolveLanguageKey("fields.isPublished"),
            type: COLUMN_TYPE.BOOLEAN,
        },
    ], [resolveLanguageKey]);
    return (
        <EntityListPage<ClinicReview>
            apiUrl="/api/dentalClinic/clinicReview"
            collectionName="clinicreviews"
            accessModel="clinicreviews"
            tableConfigKey="clinicreviews"
            rowActionMenu={{allowMenuForCustomChildren: true}}
            header={(ctx) => (
                <EntityListHeader ctx={ctx}>
                    <EntityListCreateButton
                        ctx={ctx}
                        path="/dentalClinic/reviews/create"
                        icon={<IconPlus />}
                    />
                </EntityListHeader>
            )}
            buildEditPath={clinicReviewEditPath}
            resolveLanguageKey={resolveLanguageKey}
            quickFilters={quickFilters}
            sheetLanguagePath="src/modules/dentalClinic/clients/panel/private/reviews/center/sheetView/clinicReviewSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderActionMenuChildren={(entity, bindRowAction) => (
                <>
                    <PublishClinicReview entity={entity} onAction={bindRowAction} />
                    <UnpublishClinicReview entity={entity} onAction={bindRowAction} />
                </>
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) => {
                if (action === "publishClinicReview") {
                    return (
                        <PublishClinicReviewDialog
                            open
                            onClose={resetAction}
                            entity={entity}
                            onSuccess={() => listRef.current?.updateRow?.(entity._id, {isPublished: true})}
                        />
                    );
                }
                if (action === "unpublishClinicReview") {
                    return (
                        <UnpublishClinicReviewDialog
                            open
                            onClose={resetAction}
                            entity={entity}
                            onSuccess={() => listRef.current?.updateRow?.(entity._id, {isPublished: false})}
                        />
                    );
                }
                return null;
            }}
            renderSheet={({open, onOpenChange, entity, onDelete, onRestore, listRef}) => (
                <ClinicReviewSheetView
                    open={open}
                    onOpenChange={onOpenChange}
                    clinicReview={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onPublishedChanged={(isPublished: boolean) => listRef.current?.updateRow?.(entity._id, {isPublished})}
                    onSheetRowPatched={(row: Partial<ClinicReview>) => listRef.current?.updateRow?.(entity._id, row)}
                />
            )}
            renderCard={(row, onDelete, onRestore, listRef) => (
                <ClinicReviewCard
                    clinicReview={row}
                    onDelete={(deleted: ClinicReview | undefined, response?: DeletedData) => onDelete(deleted, response)}
                    onRestore={() => onRestore(row)}
                    onPublishedChanged={(isPublished: boolean) => listRef.current?.updateRow?.(row._id, {isPublished})}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/reviews/index.tsx"),
    withDebug(true, true, "clinicreviews"),
)(AllClinicReviews);
