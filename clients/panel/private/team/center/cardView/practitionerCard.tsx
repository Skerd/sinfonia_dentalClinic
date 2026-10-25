import {compose} from "redux";
import type {RefObject} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconCalendarCheck, IconCertificate, IconStethoscope, IconToggleRight} from "@tabler/icons-react";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import type {Practitioner} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/practitioner/practitioner.dto.ts";
import PractitionerSheetView from "@dentalClinicModule/clients/panel/private/team/center/sheetView/practitionerSheetView.tsx";
import {practitionerEditPath} from "@dentalClinicModule/clients/panel/private/team/index.tsx";
import ActivatePractitioner from "@dentalClinicModule/clients/panel/private/team/center/actions/activatePractitioner.tsx";
import DeactivatePractitioner from "@dentalClinicModule/clients/panel/private/team/center/actions/deactivatePractitioner.tsx";
import ActivatePractitionerDialog from "@dentalClinicModule/clients/panel/private/team/center/dialogs/activatePractitionerDialog.tsx";
import DeactivatePractitionerDialog from "@dentalClinicModule/clients/panel/private/team/center/dialogs/deactivatePractitionerDialog.tsx";

type PractitionerCardProps = WithLanguageType & {
    practitioner: Practitioner;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: Practitioner, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    onActiveChanged?: (isActive: boolean) => void;
    innerRef?: RefObject<WithAxiosLifecycleRef<Practitioner> | null>;
};

function PractitionerCard({
    practitioner,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    onActiveChanged,
    innerRef,
}: PractitionerCardProps) {
    return (
        <EntityCard
            resource="practitioners"
            entity={practitioner}
            fetchId={fetchId}
            singleUrl="/api/dentalClinic/practitioner/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={practitionerEditPath}
            Sheet={PractitionerSheetView}
            sheetEntityProp="practitioner"
            deleteUrl="/api/dentalClinic/practitioner"
            restoreUrl="/api/dentalClinic/practitioner/restore"
            failedTitle={String(resolveLanguageKey("failedTitle"))}
            failedDescription={String(resolveLanguageKey("failedDescription"))}
            titlePath="displayName"
            innerRef={innerRef}
            sheetProps={({entity, setEntity}) => ({
                fetchId,
                onActiveChanged: (isActive: boolean) => {
                    setEntity({...entity, isActive});
                    onActiveChanged?.(isActive);
                },
                onSheetRowPatched: (row: Partial<Practitioner>) => {
                    setEntity({...entity, ...row});
                    if (typeof row.isActive === "boolean") onActiveChanged?.(row.isActive);
                },
            })}
            extraDialogs={({action, setAction, entity, setEntity}) => (
                <>
                    {action === "activatePractitioner" && (
                        <ActivatePractitionerDialog
                            open
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={() => {
                                setEntity({...entity, isActive: true});
                                onActiveChanged?.(true);
                            }}
                        />
                    )}
                    {action === "deactivatePractitioner" && (
                        <DeactivatePractitionerDialog
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
                    <EntityCard.Header titlePath="displayName" title={row.displayName}>
                        <ActivatePractitioner entity={row} onAction={setAction} />
                        <DeactivatePractitioner entity={row} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconCertificate}
                            label={resolveLanguageKey("title")}
                            tooltip={resolveLanguageKey("title")}
                            path="title"
                            value={row.title}
                        />
                        <EntityCardRow
                            icon={IconStethoscope}
                            label={resolveLanguageKey("role")}
                            tooltip={resolveLanguageKey("role")}
                            path="role"
                            type="enum"
                            languageKeyCategory="roleValues"
                            value={row.role}
                        />
                        <EntityCardRow
                            icon={IconCalendarCheck}
                            label={resolveLanguageKey("isBookable")}
                            tooltip={resolveLanguageKey("isBookable")}
                            path="isBookable"
                            type="boolean"
                            value={row.isBookable}
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
    withLanguage("src/modules/dentalClinic/clients/panel/private/team/center/cardView/practitionerCard.tsx"),
    withDebug(true, true, "practitioners"),
)(PractitionerCard);
