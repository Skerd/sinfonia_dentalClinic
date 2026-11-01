import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconCash, IconInbox, IconStatusChange, IconTag} from "@tabler/icons-react";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import {formatCurrency} from "@coreModule/helpers/general/numbers.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import type {TreatmentPlan} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/treatmentPlan/treatmentPlan.dto.ts";
import TreatmentPlanSheetView from "@dentalClinicModule/clients/panel/private/plans/center/sheetView/treatmentPlanSheetView.tsx";
import PlanMenu from "@dentalClinicModule/clients/panel/private/plans/center/actions/planMenu.tsx";
import PlanDialogs from "@dentalClinicModule/clients/panel/private/plans/center/dialogs/planDialogs.tsx";
import {treatmentPlanEditPath} from "@dentalClinicModule/clients/panel/private/plans/planPaths.ts";

type TreatmentPlanCardProps = WithLanguageType & {
    plan: TreatmentPlan;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: TreatmentPlan, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
};

function TreatmentPlanCard({plan, resolveLanguageKey, fetchId, hideActions = false, onDelete, onRestore, sheetOnly = false}: TreatmentPlanCardProps) {
    return (
        <EntityCard
            resource="treatmentplans"
            entity={plan}
            fetchId={fetchId}
            singleUrl="/api/dentalClinic/treatmentPlan/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={treatmentPlanEditPath}
            Sheet={TreatmentPlanSheetView}
            sheetEntityProp="plan"
            deleteUrl="/api/dentalClinic/treatmentPlan"
            restoreUrl="/api/dentalClinic/treatmentPlan/restore"
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            titlePath="number"
            sheetProps={({entity, setEntity}) => ({
                fetchId,
                onSheetRowPatched: (row: Partial<TreatmentPlan>) => setEntity({...entity, ...row}),
            })}
            extraDialogs={({action, setAction, entity, setEntity}) =>
                action ? (
                    <PlanDialogs action={action} plan={entity} onClose={() => setAction("")} onUpdated={(updated) => setEntity(updated)} onCreated={() => setAction("")} />
                ) : null}
        >
            {({entity: row, setAction}) => (
                <>
                    <EntityCard.Header titlePath="number" title={row.number}>
                        <PlanMenu plan={row} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <EntityCardRow icon={IconTag} label={resolveLanguageKey("optionLabel")} tooltip={resolveLanguageKey("optionLabel")} path="optionLabel" value={row.optionLabel} />
                        <EntityCardRow icon={IconInbox} label={resolveLanguageKey("inquiry")} tooltip={resolveLanguageKey("inquiry")} path="inquiry" value={row.inquiry?.number} />
                        <EntityCardRow icon={IconStatusChange} label={resolveLanguageKey("status")} tooltip={resolveLanguageKey("status")} path="status" value={resolveLanguageKey(`statusValues.${row.status}`)} />
                        <EntityCardRow
                            icon={IconCash}
                            label={resolveLanguageKey("total")}
                            tooltip={resolveLanguageKey("total")}
                            path="totals"
                            value={row.currency?.abbreviation ? formatCurrency(row.totals.total, row.currency.abbreviation) : row.totals?.total}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/plans/center/cardView/treatmentPlanCard.tsx"),
    withDebug(true, true, "treatmentplans"),
)(TreatmentPlanCard);
