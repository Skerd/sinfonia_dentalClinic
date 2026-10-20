import {compose} from "redux";
import type {RefObject} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconCalendarCheck, IconCash, IconClock, IconTag} from "@tabler/icons-react";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import type {ClinicService} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicService/clinicService.dto.ts";
import ClinicServiceSheetView from "@dentalClinicModule/clients/panel/private/services/center/sheetView/clinicServiceSheetView.tsx";
import {clinicServiceEditPath} from "@dentalClinicModule/clients/panel/private/services/index.tsx";

type ClinicServiceCardProps = WithLanguageType & {
    clinicService: ClinicService;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: ClinicService, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
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
