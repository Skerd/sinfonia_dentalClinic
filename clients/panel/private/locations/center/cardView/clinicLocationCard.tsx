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

type ClinicLocationCardProps = WithLanguageType & {
    clinicLocation: ClinicLocation;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: ClinicLocation, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
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
        >
            {({entity: row}) => (
                <>
                    <EntityCard.Header titlePath="name" title={row.name} />
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
