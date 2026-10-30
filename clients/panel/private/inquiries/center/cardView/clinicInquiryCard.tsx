import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconMessage, IconStatusChange, IconUser, IconWorld} from "@tabler/icons-react";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import type {ClinicInquiry} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicInquiry/clinicInquiry.dto.ts";
import ClinicInquirySheetView from "@dentalClinicModule/clients/panel/private/inquiries/center/sheetView/clinicInquirySheetView.tsx";
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
            failedTitle={String(resolveLanguageKey("failedTitle"))}
            failedDescription={String(resolveLanguageKey("failedDescription"))}
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
            {({entity: row, setAction}) => (
                <>
                    <EntityCard.Header titlePath="number" title={row.number}>
                        <InquiryMenu inquiry={row} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconUser}
                            label={resolveLanguageKey("patient")}
                            tooltip={resolveLanguageKey("patient")}
                            path="contact"
                            value={[row.contact?.firstName, row.contact?.lastName].filter(Boolean).join(" ")}
                        />
                        <EntityCardRow
                            icon={IconWorld}
                            label={resolveLanguageKey("country")}
                            tooltip={resolveLanguageKey("country")}
                            path="contact"
                            value={row.contact?.country?.name}
                        />
                        <EntityCardRow
                            icon={IconStatusChange}
                            label={resolveLanguageKey("status")}
                            tooltip={resolveLanguageKey("status")}
                            path="status"
                            value={resolveLanguageKey(`statusValues.${row.status}`)}
                        />
                        <EntityCardRow
                            icon={IconMessage}
                            label={resolveLanguageKey("unread")}
                            tooltip={resolveLanguageKey("unread")}
                            path="unreadForClinic"
                            type="number"
                            value={row.unreadForClinic}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/inquiries/center/cardView/clinicInquiryCard.tsx"),
    withDebug(true, true, "clinicinquiries"),
)(ClinicInquiryCard);
