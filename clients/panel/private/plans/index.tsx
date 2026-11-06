import {compose} from "redux";
import {useMemo} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage, {EntityListCreateButton, EntityListHeader, type QuickFilterDef} from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators.ts";
import {TREATMENT_PLAN_PAYMENT_STATUSES, TREATMENT_PLAN_STATUSES} from "armonia/src/modules/dentalClinic/constants/index.ts";
import type {TreatmentPlan} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/treatmentPlan/treatmentPlan.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import TreatmentPlanCard from "./center/cardView/treatmentPlanCard.tsx";
import TreatmentPlanSheetView from "./center/sheetView/treatmentPlanSheetView.tsx";
import PlanMenu from "./center/actions/planMenu.tsx";
import PlanDialogs from "./center/dialogs/planDialogs.tsx";
import {treatmentPlanEditPath} from "./planPaths.ts";

/** Treatment plans and quotes: drafts, quotes sent to patients, accepted plans. */
function AllTreatmentPlans({resolveLanguageKey}: WithLanguageType) {
    const quickFilters = useMemo<QuickFilterDef[]>(() => [
        {
            field: "status",
            label: String(resolveLanguageKey("fields.status")),
            type: COLUMN_TYPE.ENUM,
            enumValues: TREATMENT_PLAN_STATUSES.map((value) => ({
                value,
                label: String(resolveLanguageKey(`fields.!enums.status.${value}`)),
            })),
        },
        {
            field: "paymentStatus",
            label: String(resolveLanguageKey("fields.paymentStatus")),
            type: COLUMN_TYPE.ENUM,
            enumValues: TREATMENT_PLAN_PAYMENT_STATUSES.map((value) => ({
                value,
                label: String(resolveLanguageKey(`fields.!enums.paymentStatus.${value}`)),
            })),
        },
        {
            field: "patient",
            label: String(resolveLanguageKey("fields.patient")),
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/dentalClinic/patient/select",
        },
    ], [resolveLanguageKey]);

    return (
        <EntityListPage<TreatmentPlan>
            apiUrl="/api/dentalClinic/treatmentPlan"
            collectionName="treatmentplans"
            accessModel="treatmentplans"
            tableConfigKey="treatmentplans"
            header={(ctx) => (
                <EntityListHeader ctx={ctx}>
                    <EntityListCreateButton
                        ctx={ctx}
                        path="/dentalClinic/plans/create"
                        icon={<IconPlus />}
                    />
                </EntityListHeader>
            )}
            buildEditPath={treatmentPlanEditPath}
            resolveLanguageKey={resolveLanguageKey}
            quickFilters={quickFilters}
            sheetLanguagePath="src/modules/dentalClinic/clients/panel/private/plans/center/sheetView/treatmentPlanSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            rowActionMenu={{allowMenuForCustomChildren: true}}
            renderActionMenuChildren={(row, bindRowAction) => <PlanMenu plan={row} onAction={bindRowAction} />}
            renderSheetActionMenuChildren={(row, bindRowAction) => <PlanMenu plan={row} onAction={bindRowAction} />}
            renderFloatingModals={({action, entity, resetAction, listRef}) => (
                <PlanDialogs
                    action={action}
                    plan={entity}
                    onClose={resetAction}
                    onUpdated={(updated) => listRef.current?.updateRow?.(entity._id, updated)}
                    onCreated={() => listRef.current?.refetch?.()}
                />
            )}
            renderSheet={({open, onOpenChange, entity, onDelete, onRestore, listRef}) => (
                <TreatmentPlanSheetView
                    open={open}
                    onOpenChange={onOpenChange}
                    plan={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onSheetRowPatched={(row: Partial<TreatmentPlan>) => listRef.current?.updateRow?.(entity._id, row)}
                    onPlanCreated={() => listRef.current?.refetch?.()}
                />
            )}
            renderCard={(row, onDelete, onRestore) => (
                <TreatmentPlanCard
                    plan={row}
                    onDelete={(deleted: TreatmentPlan | undefined, response?: DeletedData) => onDelete(deleted, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/plans/index.tsx"),
    withDebug(true, true, "treatmentplans"),
)(AllTreatmentPlans);
