import {compose} from "redux";
import {useMemo} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage, {type QuickFilterDef} from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators.ts";
import {INQUIRY_STATUSES, PATIENT_SOURCES, TREATMENT_CATEGORIES} from "armonia/src/modules/dentalClinic/constants/index.ts";
import type {ClinicInquiry} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicInquiry/clinicInquiry.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ClinicInquiryCard from "./center/cardView/clinicInquiryCard.tsx";
import ClinicInquirySheetView from "./center/sheetView/clinicInquirySheetView.tsx";
import InquiryMenu from "./center/actions/inquiryMenu.tsx";
import InquiryDialogs from "./center/dialogs/inquiryDialogs.tsx";

/** Estimate requests from the portal, the clinic's site and leads the clinic enters itself. */
function AllClinicInquiries({resolveLanguageKey}: WithLanguageType) {
    const quickFilters = useMemo<QuickFilterDef[]>(() => [
        {
            field: "status",
            label: String(resolveLanguageKey("fields.status")),
            type: COLUMN_TYPE.ENUM,
            enumValues: INQUIRY_STATUSES.map((value) => ({
                value,
                label: String(resolveLanguageKey(`fields.!enums.status.${value}`)),
            })),
        },
        {
            field: "source",
            label: String(resolveLanguageKey("fields.source")),
            type: COLUMN_TYPE.ENUM,
            enumValues: PATIENT_SOURCES.map((value) => ({
                value,
                label: String(resolveLanguageKey(`fields.!enums.source.${value}`)),
            })),
        },
        {
            field: "treatmentsWanted",
            label: String(resolveLanguageKey("fields.treatmentsWanted")),
            type: COLUMN_TYPE.ENUM,
            enumValues: TREATMENT_CATEGORIES.map((value) => ({
                value,
                label: String(resolveLanguageKey(`fields.!enums.treatmentsWanted.${value}`)),
            })),
        },
        {
            field: "assignedTo",
            label: String(resolveLanguageKey("fields.assignedTo")),
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/company/users/select",
        },
    ], [resolveLanguageKey]);

    return (
        <EntityListPage<ClinicInquiry>
            apiUrl="/api/dentalClinic/clinicInquiry"
            collectionName="clinicinquiries"
            accessModel="clinicinquiries"
            tableConfigKey="clinicinquiries"
            createPath="/dentalClinic/inquiries/create"
            createIcon={<IconPlus />}
            createLanguageKey="create"
            buildEditPath={() => ""}
            resolveLanguageKey={resolveLanguageKey}
            quickFilters={quickFilters}
            sheetLanguagePath="src/modules/dentalClinic/clients/panel/private/inquiries/center/sheetView/clinicInquirySheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            rowActionMenu={{allowMenuForCustomChildren: true, hideEdit: true}}
            renderActionMenuChildren={(row, bindRowAction) => <InquiryMenu inquiry={row} onAction={bindRowAction} />}
            renderSheetActionMenuChildren={(row, bindRowAction) => <InquiryMenu inquiry={row} onAction={bindRowAction} />}
            renderFloatingModals={({action, entity, resetAction, listRef}) => (
                <InquiryDialogs
                    action={action}
                    inquiry={entity}
                    onClose={resetAction}
                    onUpdated={(updated) => listRef.current?.updateRow?.(entity._id, updated)}
                />
            )}
            renderSheet={({open, onOpenChange, entity, onDelete, onRestore, listRef}) => (
                <ClinicInquirySheetView
                    open={open}
                    onOpenChange={onOpenChange}
                    inquiry={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onSheetRowPatched={(row: Partial<ClinicInquiry>) => listRef.current?.updateRow?.(entity._id, row)}
                />
            )}
            renderCard={(row, onDelete, onRestore) => (
                <ClinicInquiryCard
                    inquiry={row}
                    onDelete={(deleted: ClinicInquiry | undefined, response?: DeletedData) => onDelete(deleted, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/inquiries/index.tsx"),
    withDebug(true, true, "clinicinquiries"),
)(AllClinicInquiries);
