import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import type {Appointment} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/appointment/appointment.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import AppointmentMenu, {type AppointmentAction} from "@dentalClinicModule/clients/panel/private/appointments/center/actions/appointmentMenu.tsx";
import AppointmentDialogs from "@dentalClinicModule/clients/panel/private/appointments/center/dialogs/appointmentDialogs.tsx";

type AppointmentSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    appointment?: Appointment;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    onSheetRowPatched?: (patch: Partial<Appointment>) => void;
    fetchId?: string;
};

/** Appointments change only through their lifecycle actions, so the sheet owns that menu and has no Edit. */
function AppointmentSheetView({
    open,
    onOpenChange,
    appointment: appointmentProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    onSheetRowPatched,
    fetchId,
}: AppointmentSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(appointmentProp || {_id: fetchId});
    const [action, setAction] = useState("");
    const access = useAccess("appointments");
    const viewConfig = useViewConfig("appointments", "sheet");

    useEffect(() => {
        if (!open) setAction("");
    }, [open]);

    useEffect(() => {
        if (!appointmentProp) return;
        setSheetData(appointmentProp);
    }, [appointmentProp]);

    const entityId = appointmentProp?._id ?? fetchId;
    if (!viewConfig || !entityId) return null;
    const appointment = sheetData as Appointment;
    const patched = (row: Partial<Appointment>) => {
        setSheetData((current) => ({...current, ...row}));
        onSheetRowPatched?.(row);
    };

    return (
        <>
            <SheetViewRenderer
                config={viewConfig}
                url="/api/dentalClinic/appointment/single"
                fetchId={fetchId ?? entityId}
                onDataFetched={(data) => setSheetData(data)}
                data={sheetData}
                open={open}
                onOpenChange={onOpenChange}
                resolveLanguageKey={resolveLanguageKey}
                access={access}
                hideActions={hideActions}
                hideEdit
                onDelete={onDelete}
                onRestore={onRestore}
                editPath=""
                onSheetRowPatched={(row) => patched(row as Partial<Appointment>)}
                actionMenuAllowCustomChildren
                actionMenuChildren={appointment.status ? <AppointmentMenu appointment={appointment} onAction={(next: AppointmentAction) => setAction(next)} /> : null}
            />
            {action ? (
                <AppointmentDialogs
                    action={action}
                    appointment={appointment}
                    onClose={() => setAction("")}
                    onUpdated={patched}
                />
            ) : null}
        </>
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/appointments/center/sheetView/appointmentSheetView.tsx"),
    withDebug(true, true, "appointments"),
)(AppointmentSheetView);
