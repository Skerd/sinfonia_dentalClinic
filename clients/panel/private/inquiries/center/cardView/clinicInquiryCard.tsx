import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconCalendarEvent, IconCash, IconDental, IconMessage, IconWorld} from "@tabler/icons-react";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import type {ClinicInquiry} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicInquiry/clinicInquiry.dto.ts";
import ClinicInquirySheetView from "@dentalClinicModule/clients/panel/private/inquiries/center/sheetView/clinicInquirySheetView.tsx";
import StatusBadge from "@dentalClinicModule/clients/panel/private/shared/statusBadge.tsx";
import {formatCurrency} from "@coreModule/helpers/general/numbers.ts";
import InquiryMenu from "@dentalClinicModule/clients/panel/private/inquiries/center/actions/inquiryMenu.tsx";
import InquiryDialogs from "@dentalClinicModule/clients/panel/private/inquiries/center/dialogs/inquiryDialogs.tsx";

type ClinicInquiryCardProps = WithLanguageType & {
    inquiry: ClinicInquiry;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: ClinicInquiry, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
};

function ClinicInquiryCard({inquiry, resolveLanguageKey, fetchId, hideActions = false, onDelete, onRestore, sheetOnly = false}: ClinicInquiryCardProps) {
    return (
        <EntityCard
            resource="clinicinquiries"
            entity={inquiry}
            fetchId={fetchId}
            singleUrl="/api/dentalClinic/clinicInquiry/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={() => ""}
            Sheet={ClinicInquirySheetView}
            sheetEntityProp="inquiry"
            deleteUrl="/api/dentalClinic/clinicInquiry"
            restoreUrl="/api/dentalClinic/clinicInquiry/restore"
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            titlePath="number"
            sheetProps={({entity, setEntity}) => ({
                fetchId,
                onSheetRowPatched: (row: Partial<ClinicInquiry>) => setEntity({...entity, ...row}),
            })}
            extraDialogs={({action, setAction, entity, setEntity}) =>
                action ? (
                    <InquiryDialogs action={action} inquiry={entity} onClose={() => setAction("")} onUpdated={(updated) => setEntity(updated)} />
                ) : null}
        >
            {({entity: row, setAction}) => {
                const name = [row.contact?.firstName, row.contact?.lastName].filter(Boolean).join(" ");
                const wanted = (row.treatmentsWanted ?? []).map((category) => String(resolveLanguageKey(`treatment.${category}`))).join(", ");
                return (
                <>
                    {/* The patient's name leads; the request number is the subtitle (UX-01). */}
                    <EntityCard.Header
                        titlePath={name ? "contact" : "number"}
                        title={name || row.number}
                        subtitlePath="number"
                        subtitle={name ? row.number : undefined}
                        badgesBesideTitle
                        badges={
                            <StatusBadge
                                tableConfigKey="clinicinquiries"
                                field="status"
                                value={row.status}
                                label={String(resolveLanguageKey(`statusValues.${row.status}`))}
                            />
                        }
                    >
                        <InquiryMenu inquiry={row} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        {wanted ? (
                            <EntityCardRow icon={IconDental} label={resolveLanguageKey("treatmentsWanted")} tooltip={resolveLanguageKey("treatmentsWanted")} path="treatmentsWanted" value={wanted} />
                        ) : null}
                        {row.contact?.country?.name ? (
                            <EntityCardRow icon={IconWorld} label={resolveLanguageKey("country")} tooltip={resolveLanguageKey("country")} path="contact" value={row.contact.country.name} />
                        ) : null}
                        <EntityCardRow icon={IconCalendarEvent} label={resolveLanguageKey("receivedAt")} tooltip={resolveLanguageKey("receivedAt")} path="createdAt" type="date" value={row.createdAt} />
                        {row.budget != null && row.budgetCurrency ? (
                            <EntityCardRow
                                icon={IconCash}
                                label={resolveLanguageKey("budget")}
                                tooltip={resolveLanguageKey("budget")}
                                path="budget"
                                value={formatCurrency(row.budget, row.budgetCurrency.abbreviation)}
                            />
                        ) : null}
                        {row.unreadForClinic ? (
                            <EntityCardRow icon={IconMessage} label={resolveLanguageKey("unread")} tooltip={resolveLanguageKey("unread")} path="unreadForClinic" type="number" value={row.unreadForClinic} />
                        ) : null}
                    </EntityCard.Body>
                </>
                );
            }}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/inquiries/center/cardView/clinicInquiryCard.tsx"),
    withDebug(true, true, "clinicinquiries"),
)(ClinicInquiryCard);
