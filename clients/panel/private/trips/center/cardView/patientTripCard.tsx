import {compose} from "redux";
import type {RefObject} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconBed, IconCar, IconPlaneArrival, IconPlaneDeparture} from "@tabler/icons-react";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import type {PatientTrip} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/patientTrip/patientTrip.dto.ts";
import PatientTripSheetView from "@dentalClinicModule/clients/panel/private/trips/center/sheetView/patientTripSheetView.tsx";
import {patientTripEditPath} from "@dentalClinicModule/clients/panel/private/trips/index.tsx";

type PatientTripCardProps = WithLanguageType & {
    patientTrip: PatientTrip;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: PatientTrip, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<PatientTrip> | null>;
};

function PatientTripCard({
    patientTrip,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: PatientTripCardProps) {
    return (
        <EntityCard
            resource="patienttrips"
            entity={patientTrip}
            fetchId={fetchId}
            singleUrl="/api/dentalClinic/patientTrip/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={patientTripEditPath}
            Sheet={PatientTripSheetView}
            sheetEntityProp="patientTrip"
            deleteUrl="/api/dentalClinic/patientTrip"
            restoreUrl="/api/dentalClinic/patientTrip/restore"
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            titlePath="patient"
            innerRef={innerRef}
        >
            {({entity: row}) => (
                <>
                    <EntityCard.Header titlePath="patient" title={row.patient ? `${row.patient.firstName} ${row.patient.lastName}` : undefined} />
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconPlaneArrival}
                            label={resolveLanguageKey("arrivalAt")}
                            tooltip={resolveLanguageKey("arrivalAt")}
                            path="arrivalAt"
                            type="dateTime"
                            value={row.arrivalAt}
                        />
                        <EntityCardRow
                            icon={IconPlaneDeparture}
                            label={resolveLanguageKey("departureAt")}
                            tooltip={resolveLanguageKey("departureAt")}
                            path="departureAt"
                            type="dateTime"
                            value={row.departureAt}
                        />
                        <EntityCardRow
                            icon={IconBed}
                            label={resolveLanguageKey("accommodation")}
                            tooltip={resolveLanguageKey("accommodation")}
                            path="accommodation"
                            value={row.accommodation}
                        />
                        <EntityCardRow
                            icon={IconCar}
                            label={resolveLanguageKey("transfer")}
                            tooltip={resolveLanguageKey("transfer")}
                            path="transfer"
                            type="boolean"
                            value={row.transfer}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/trips/center/cardView/patientTripCard.tsx"),
    withDebug(true, true, "patienttrips"),
)(PatientTripCard);
