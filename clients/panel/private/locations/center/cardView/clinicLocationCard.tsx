import {compose} from "redux";
import type {RefObject} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconClock, IconPhone, IconToggleRight} from "@tabler/icons-react";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import type {ClinicLocation} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicLocation/clinicLocation.dto.ts";
import ClinicLocationSheetView from "@dentalClinicModule/clients/panel/private/locations/center/sheetView/clinicLocationSheetView.tsx";
import {clinicLocationEditPath} from "@dentalClinicModule/clients/panel/private/locations/index.tsx";
import ActivateClinicLocation from "@dentalClinicModule/clients/panel/private/locations/center/actions/activateClinicLocation.tsx";
import DeactivateClinicLocation from "@dentalClinicModule/clients/panel/private/locations/center/actions/deactivateClinicLocation.tsx";
import ActivateClinicLocationDialog from "@dentalClinicModule/clients/panel/private/locations/center/dialogs/activateClinicLocationDialog.tsx";
import DeactivateClinicLocationDialog from "@dentalClinicModule/clients/panel/private/locations/center/dialogs/deactivateClinicLocationDialog.tsx";

type ClinicLocationCardProps = WithLanguageType & {
    clinicLocation: ClinicLocation;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: ClinicLocation, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    onActiveChanged?: (isActive: boolean) => void;
    innerRef?: RefObject<WithAxiosLifecycleRef<ClinicLocation> | null>;
};

function ClinicLocationCard({
    clinicLocation,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    onActiveChanged,
    innerRef,
}: ClinicLocationCardProps) {
    return (
        <EntityCard
            resource="cliniclocations"
            entity={clinicLocation}
            fetchId={fetchId}
            singleUrl="/api/dentalClinic/clinicLocation/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={clinicLocationEditPath}
            Sheet={ClinicLocationSheetView}
            sheetEntityProp="clinicLocation"
            deleteUrl="/api/dentalClinic/clinicLocation"
            restoreUrl="/api/dentalClinic/clinicLocation/restore"
            failedTitle={String(resolveLanguageKey("failedTitle"))}
            failedDescription={String(resolveLanguageKey("failedDescription"))}
            titlePath="name"
            innerRef={innerRef}
            sheetProps={({entity, setEntity}) => ({
                fetchId,
                onActiveChanged: (isActive: boolean) => {
                    setEntity({...entity, isActive});
                    onActiveChanged?.(isActive);
                },
                onSheetRowPatched: (row: Partial<ClinicLocation>) => {
                    setEntity({...entity, ...row});
                    if (typeof row.isActive === "boolean") onActiveChanged?.(row.isActive);
                },
            })}
            extraDialogs={({action, setAction, entity, setEntity}) => (
                <>
                    {action === "activateClinicLocation" && (
                        <ActivateClinicLocationDialog
                            open
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={() => {
                                setEntity({...entity, isActive: true});
                                onActiveChanged?.(true);
                            }}
                        />
                    )}
                    {action === "deactivateClinicLocation" && (
                        <DeactivateClinicLocationDialog
                            open
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={() => {
                                setEntity({...entity, isActive: false});
                                onActiveChanged?.(false);
                            }}
                        />
                    )}
                </>
            )}
        >
            {({entity: row, setAction}) => (
                <>
                    <EntityCard.Header titlePath="name" title={row.name}>
                        <ActivateClinicLocation entity={row} onAction={setAction} />
                        <DeactivateClinicLocation entity={row} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconClock}
                            label={resolveLanguageKey("timezone")}
                            tooltip={resolveLanguageKey("timezone")}
                            path="timezone"
                            value={row.timezone}
                        />
                        <EntityCardRow
                            icon={IconPhone}
                            label={resolveLanguageKey("phone")}
                            tooltip={resolveLanguageKey("phone")}
                            path="phone"
                            value={row.phone}
                        />
                        <EntityCardRow
                            icon={IconToggleRight}
                            label={resolveLanguageKey("isActive")}
                            tooltip={resolveLanguageKey("isActive")}
                            path="isActive"
                            type="boolean"
                            value={row.isActive}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/locations/center/cardView/clinicLocationCard.tsx"),
    withDebug(true, true, "cliniclocations"),
)(ClinicLocationCard);
