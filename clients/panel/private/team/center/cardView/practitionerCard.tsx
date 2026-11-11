import {compose} from "redux";
import type {RefObject} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconCertificate, IconDental, IconMapPin} from "@tabler/icons-react";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import TableAvatar from "@coreModule/components/entityPage/list/tableAvatar.tsx";
import {accessFieldPathExists} from "@coreModule/helpers/context/accessContext.tsx";
import StatusBadge from "@dentalClinicModule/clients/panel/private/shared/statusBadge.tsx";
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
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
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
            {({entity: row, read, setAction}) => (
                <>
                    <EntityCard.Header
                        titlePath="displayName"
                        title={row.displayName}
                        icon={accessFieldPathExists(read, "photo") && row.photo?._id ? <TableAvatar mediaId={row.photo._id} /> : undefined}
                        badgesBesideTitle
                        badges={
                            <>
                                <StatusBadge tableConfigKey="practitioners" field="role" value={row.role} label={String(resolveLanguageKey(`roleValues.${row.role}`))} />
                                {/* Only the exception is shown (UX-02). */}
                                {!row.isActive ? <Badge variant="secondary" className="text-xs">{resolveLanguageKey("inactive")}</Badge> : null}
                                {row.isActive && !row.isBookable ? <Badge variant="secondary" className="text-xs">{resolveLanguageKey("notBookable")}</Badge> : null}
                            </>
                        }
                    >
                        <ActivatePractitioner entity={row} onAction={setAction} />
                        <DeactivatePractitioner entity={row} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        {row.title ? (
                            <EntityCardRow icon={IconCertificate} label={resolveLanguageKey("title")} tooltip={resolveLanguageKey("title")} path="title" value={row.title} />
                        ) : null}
                        {row.locations?.length ? (
                            <EntityCardRow
                                icon={IconMapPin}
                                label={resolveLanguageKey("locations")}
                                tooltip={resolveLanguageKey("locations")}
                                path="locations"
                                value={row.locations.map((location) => location.name).join(", ")}
                            />
                        ) : null}
                        {row.services?.length ? (
                            <EntityCardRow
                                icon={IconDental}
                                label={resolveLanguageKey("services")}
                                tooltip={resolveLanguageKey("services")}
                                path="services"
                                value={row.services.map((service) => service.name).join(", ")}
                            />
                        ) : null}
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
