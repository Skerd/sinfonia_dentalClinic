import {compose} from "redux";
import type {RefObject} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconCalendarCheck, IconCash, IconClock, IconTag, IconToggleRight} from "@tabler/icons-react";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import type {ClinicService} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicService/clinicService.dto.ts";
import ClinicServiceSheetView from "@dentalClinicModule/clients/panel/private/services/center/sheetView/clinicServiceSheetView.tsx";
import {clinicServiceEditPath} from "@dentalClinicModule/clients/panel/private/services/index.tsx";
import ActivateClinicService from "@dentalClinicModule/clients/panel/private/services/center/actions/activateClinicService.tsx";
import DeactivateClinicService from "@dentalClinicModule/clients/panel/private/services/center/actions/deactivateClinicService.tsx";
import ActivateClinicServiceDialog from "@dentalClinicModule/clients/panel/private/services/center/dialogs/activateClinicServiceDialog.tsx";
import DeactivateClinicServiceDialog from "@dentalClinicModule/clients/panel/private/services/center/dialogs/deactivateClinicServiceDialog.tsx";

type ClinicServiceCardProps = WithLanguageType & {
    clinicService: ClinicService;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: ClinicService, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    onActiveChanged?: (isActive: boolean) => void;
    innerRef?: RefObject<WithAxiosLifecycleRef<ClinicService> | null>;
};

function ClinicServiceCard({
    clinicService,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    onActiveChanged,
    innerRef,
}: ClinicServiceCardProps) {
    return (
        <EntityCard
            resource="clinicservices"
            entity={clinicService}
            fetchId={fetchId}
            singleUrl="/api/dentalClinic/clinicService/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={clinicServiceEditPath}
            Sheet={ClinicServiceSheetView}
            sheetEntityProp="clinicService"
            deleteUrl="/api/dentalClinic/clinicService"
            restoreUrl="/api/dentalClinic/clinicService/restore"
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            titlePath="name"
            innerRef={innerRef}
            sheetProps={({entity, setEntity}) => ({
                fetchId,
                onActiveChanged: (isActive: boolean) => {
                    setEntity({...entity, isActive});
                    onActiveChanged?.(isActive);
                },
                onSheetRowPatched: (row: Partial<ClinicService>) => {
                    setEntity({...entity, ...row});
                    if (typeof row.isActive === "boolean") onActiveChanged?.(row.isActive);
                },
            })}
            extraDialogs={({action, setAction, entity, setEntity}) => (
                <>
                    {action === "activateClinicService" && (
                        <ActivateClinicServiceDialog
                            open
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={() => {
                                setEntity({...entity, isActive: true});
                                onActiveChanged?.(true);
                            }}
                        />
                    )}
                    {action === "deactivateClinicService" && (
                        <DeactivateClinicServiceDialog
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
                        <ActivateClinicService entity={row} onAction={setAction} />
                        <DeactivateClinicService entity={row} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconClock}
                            label={resolveLanguageKey("durationMinutes")}
                            tooltip={resolveLanguageKey("durationMinutes")}
                            path="durationMinutes"
                            type="number"
                            value={row.durationMinutes}
                        />
                        <EntityCardRow
                            icon={IconTag}
                            label={resolveLanguageKey("priceType")}
                            tooltip={resolveLanguageKey("priceType")}
                            path="priceType"
                            type="enum"
                            languageKeyCategory="priceTypeValues"
                            value={row.priceType}
                        />
                        <EntityCardRow
                            icon={IconCash}
                            label={resolveLanguageKey("price")}
                            tooltip={resolveLanguageKey("price")}
                            path="price"
                            type="number"
                            value={row.price}
                        />
                        <EntityCardRow
                            icon={IconCalendarCheck}
                            label={resolveLanguageKey("onlineBookable")}
                            tooltip={resolveLanguageKey("onlineBookable")}
                            path="onlineBookable"
                            type="boolean"
                            value={row.onlineBookable}
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
    withLanguage("src/modules/dentalClinic/clients/panel/private/services/center/cardView/clinicServiceCard.tsx"),
    withDebug(true, true, "clinicservices"),
)(ClinicServiceCard);
