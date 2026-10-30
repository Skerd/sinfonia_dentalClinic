import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import type {TreatmentPlan} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/treatmentPlan/treatmentPlan.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import PlanMenu, {type PlanAction} from "@dentalClinicModule/clients/panel/private/plans/center/actions/planMenu.tsx";
import PlanDialogs from "@dentalClinicModule/clients/panel/private/plans/center/dialogs/planDialogs.tsx";
import PlanBreakdown from "@dentalClinicModule/clients/panel/private/plans/center/sheetView/planBreakdown.tsx";
import {treatmentPlanEditPath} from "@dentalClinicModule/clients/panel/private/plans/planPaths.ts";

type TreatmentPlanSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    plan?: TreatmentPlan;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    onSheetRowPatched?: (patch: Partial<TreatmentPlan>) => void;
    /** A revision was made from this plan. */
    onPlanCreated?: (created: TreatmentPlan) => void;
    fetchId?: string;
};

function TreatmentPlanSheetView({
    open,
    onOpenChange,
    plan: planProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    onSheetRowPatched,
    onPlanCreated,
    fetchId,
}: TreatmentPlanSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(planProp || {_id: fetchId});
    const [action, setAction] = useState("");
    const access = useAccess("treatmentplans");
    const viewConfig = useViewConfig("treatmentplans", "sheet");

    useEffect(() => {
        if (!open) setAction("");
    }, [open]);

    useEffect(() => {
        if (!planProp) return;
        setSheetData(planProp);
    }, [planProp]);

    const entityId = planProp?._id ?? fetchId;
    if (!viewConfig || !entityId) return null;
    const plan = sheetData as TreatmentPlan;

    return (
        <>
            <SheetViewRenderer
                config={viewConfig}
                url="/api/dentalClinic/treatmentPlan/single"
                fetchId={fetchId ?? entityId}
                onDataFetched={(data) => setSheetData(data)}
                data={sheetData}
                open={open}
                onOpenChange={onOpenChange}
                resolveLanguageKey={resolveLanguageKey}
                access={access}
                hideActions={hideActions}
                hideEdit={plan.status !== "draft"}
                onDelete={onDelete}
                onRestore={onRestore}
                editPath={treatmentPlanEditPath({_id: entityId})}
                onSheetRowPatched={(row) => {
                    setSheetData(row);
                    onSheetRowPatched?.(row as Partial<TreatmentPlan>);
                }}
                actionMenuAllowCustomChildren
                actionMenuChildren={<PlanMenu plan={plan} onAction={(next: PlanAction) => setAction(next)} />}
            >
                {plan.phases ? <PlanBreakdown plan={plan} /> : null}
            </SheetViewRenderer>
            {action ? (
                <PlanDialogs
                    action={action}
                    plan={plan}
                    onClose={() => setAction("")}
                    onUpdated={(updated) => { setSheetData(updated); onSheetRowPatched?.(updated); }}
                    onCreated={(created) => onPlanCreated?.(created)}
                />
            ) : null}
        </>
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/plans/center/sheetView/treatmentPlanSheetView.tsx"),
    withDebug(true, true, "treatmentplans"),
)(TreatmentPlanSheetView);
