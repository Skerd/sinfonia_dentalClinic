import {compose} from "redux";
import type {RefObject} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconCalendarCheck, IconCertificate, IconStethoscope} from "@tabler/icons-react";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import type {Practitioner} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/practitioner/practitioner.dto.ts";
import PractitionerSheetView from "@dentalClinicModule/clients/panel/private/team/center/sheetView/practitionerSheetView.tsx";
import {practitionerEditPath} from "@dentalClinicModule/clients/panel/private/team/index.tsx";

type PractitionerCardProps = WithLanguageType & {
    practitioner: Practitioner;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: Practitioner, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
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
        >
            {({entity: row}) => (
                <>
                    <EntityCard.Header titlePath="displayName" title={row.displayName} />
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
