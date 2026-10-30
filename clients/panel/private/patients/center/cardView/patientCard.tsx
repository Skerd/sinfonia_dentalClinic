import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconLanguage, IconMail, IconPhone, IconWorld} from "@tabler/icons-react";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import type {Patient} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/patient/patient.dto.ts";
import PatientSheetView from "@dentalClinicModule/clients/panel/private/patients/center/sheetView/patientSheetView.tsx";
import {patientEditPath} from "@dentalClinicModule/clients/panel/private/patients/index.tsx";

type PatientCardProps = WithLanguageType & {
    patient: Patient;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: Patient, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
};

function PatientCard({patient, resolveLanguageKey, fetchId, hideActions = false, onDelete, onRestore, sheetOnly = false}: PatientCardProps) {
    return (
        <EntityCard
            resource="patients"
            entity={patient}
            fetchId={fetchId}
            singleUrl="/api/dentalClinic/patient/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={patientEditPath}
            Sheet={PatientSheetView}
            sheetEntityProp="patient"
            deleteUrl="/api/dentalClinic/patient"
            restoreUrl="/api/dentalClinic/patient/restore"
            failedTitle={String(resolveLanguageKey("failedTitle"))}
            failedDescription={String(resolveLanguageKey("failedDescription"))}
            titlePath="lastName"
        >
            {({entity: row}) => (
                <>
                    <EntityCard.Header titlePath="lastName" title={`${row.firstName} ${row.lastName}`} />
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconMail}
                            label={resolveLanguageKey("email")}
                            tooltip={resolveLanguageKey("email")}
                            path="email"
                            value={row.email}
                        />
                        <EntityCardRow
                            icon={IconPhone}
                            label={resolveLanguageKey("phone")}
                            tooltip={resolveLanguageKey("phone")}
                            path="phone"
                            value={row.phone}
                        />
                        <EntityCardRow
                            icon={IconWorld}
                            label={resolveLanguageKey("country")}
                            tooltip={resolveLanguageKey("country")}
                            path="address.country"
                            value={row.address?.country?.name}
                        />
                        <EntityCardRow
                            icon={IconLanguage}
                            label={resolveLanguageKey("preferredLanguage")}
                            tooltip={resolveLanguageKey("preferredLanguage")}
                            path="preferredLanguage"
                            value={resolveLanguageKey(`languageValues.${row.preferredLanguage}`)}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/patients/center/cardView/patientCard.tsx"),
    withDebug(true, true, "patients"),
)(PatientCard);
